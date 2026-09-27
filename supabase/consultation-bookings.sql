-- Run this once in the Supabase SQL Editor for the Flowmint project.
create extension if not exists pgcrypto;

create table if not exists public.consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  session_minutes integer not null check (session_minutes in (30, 60)),
  amount_paise integer not null check (amount_paise in (29900, 49900)),
  slot_date date not null,
  slot_time text not null check (slot_time in ('09:00', '10:30', '12:00', '13:30', '15:00', '16:30')),
  time_zone text not null default 'Asia/Kolkata',
  status text not null default 'pending_payment' check (status in (
    'pending_payment', 'confirmed', 'expired', 'payment_link_failed',
    'refund_pending', 'refund_processing', 'refunded_late_payment'
  )),
  payment_link_id text unique,
  payment_link_url text,
  razorpay_payment_id text unique,
  refund_id text unique,
  expires_at timestamptz not null,
  confirmation_email_status text not null default 'pending' check (confirmation_email_status in ('pending', 'sending', 'sent')),
  confirmation_email_claimed_at timestamptz,
  confirmation_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists consultation_one_active_booking_per_slot
  on public.consultation_bookings (slot_date, slot_time)
  where status in ('pending_payment', 'confirmed');

alter table public.consultation_bookings enable row level security;
revoke all on public.consultation_bookings from anon, authenticated;
grant all on public.consultation_bookings to service_role;

create or replace function public.reserve_consultation_slot(
  p_name text,
  p_email text,
  p_session_minutes integer,
  p_amount_paise integer,
  p_slot_date date,
  p_slot_time text,
  p_expires_at timestamptz
) returns table (booking_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_booking_id uuid;
begin
  update consultation_bookings
     set status = 'expired', updated_at = now()
   where status = 'pending_payment' and expires_at <= now();

  insert into consultation_bookings (
    name, email, session_minutes, amount_paise, slot_date, slot_time,
    time_zone, status, expires_at
  ) values (
    p_name, lower(p_email), p_session_minutes, p_amount_paise, p_slot_date, p_slot_time,
    'Asia/Kolkata', 'pending_payment', p_expires_at
  ) returning id into new_booking_id;

  return query select new_booking_id;
exception when unique_violation then
  return query select null::uuid;
end;
$$;

create or replace function public.confirm_consultation_payment(
  p_booking_id uuid,
  p_payment_id text
) returns table (result text)
language plpgsql
security definer
set search_path = public
as $$
declare
  booking consultation_bookings%rowtype;
  slot_taken boolean;
begin
  update consultation_bookings
     set status = 'expired', updated_at = now()
   where status = 'pending_payment' and expires_at <= now();

  select * into booking from consultation_bookings where id = p_booking_id for update;
  if not found then return query select 'invalid'; return; end if;

  if booking.status = 'confirmed' and booking.razorpay_payment_id = p_payment_id then
    return query select 'already_confirmed'; return;
  end if;
  if booking.status in ('refund_pending', 'refund_processing', 'refunded_late_payment') then
    return query select 'refund'; return;
  end if;
  if booking.status not in ('pending_payment', 'expired') then
    return query select 'invalid'; return;
  end if;

  select exists (
    select 1 from consultation_bookings other_booking
     where other_booking.slot_date = booking.slot_date
       and other_booking.slot_time = booking.slot_time
       and other_booking.id <> booking.id
       and other_booking.status in ('pending_payment', 'confirmed')
  ) into slot_taken;

  if slot_taken then
    update consultation_bookings set status = 'refund_pending', razorpay_payment_id = p_payment_id, updated_at = now()
     where id = p_booking_id;
    return query select 'refund'; return;
  end if;

  begin
    update consultation_bookings set status = 'confirmed', razorpay_payment_id = p_payment_id, updated_at = now()
     where id = p_booking_id;
    return query select 'confirmed';
  exception when unique_violation then
    update consultation_bookings set status = 'refund_pending', razorpay_payment_id = p_payment_id, updated_at = now()
     where id = p_booking_id;
    return query select 'refund';
  end;
end;
$$;

create or replace function public.claim_consultation_confirmation_email(p_booking_id uuid)
returns table (claimed boolean)
language sql
security definer
set search_path = public
as $$
  update consultation_bookings
     set confirmation_email_status = 'sending', confirmation_email_claimed_at = now(), updated_at = now()
   where id = p_booking_id
     and status = 'confirmed'
     and (
       confirmation_email_status = 'pending'
       or (confirmation_email_status = 'sending' and confirmation_email_claimed_at < now() - interval '5 minutes')
     )
  returning true;
$$;

create or replace function public.claim_consultation_refund(p_booking_id uuid)
returns table (claimed boolean)
language sql
security definer
set search_path = public
as $$
  update consultation_bookings
     set status = 'refund_processing', updated_at = now()
   where id = p_booking_id and status = 'refund_pending'
  returning true;
$$;

revoke all on function public.reserve_consultation_slot(text, text, integer, integer, date, text, timestamptz) from public, anon, authenticated;
revoke all on function public.confirm_consultation_payment(uuid, text) from public, anon, authenticated;
revoke all on function public.claim_consultation_confirmation_email(uuid) from public, anon, authenticated;
revoke all on function public.claim_consultation_refund(uuid) from public, anon, authenticated;
grant execute on function public.reserve_consultation_slot(text, text, integer, integer, date, text, timestamptz) to service_role;
grant execute on function public.confirm_consultation_payment(uuid, text) to service_role;
grant execute on function public.claim_consultation_confirmation_email(uuid) to service_role;
grant execute on function public.claim_consultation_refund(uuid) to service_role;
