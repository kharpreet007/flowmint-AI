import { NextResponse } from 'next/server'

export const dynamic='force-dynamic'

export async function GET(){return NextResponse.json({configured:Boolean(process.env.EMAIL_SIGNUP_WEBHOOK_URL)},{headers:{'Cache-Control':'no-store'}})}

export async function POST(request:Request){
  const webhook=process.env.EMAIL_SIGNUP_WEBHOOK_URL
  if(!webhook)return NextResponse.json({error:'Email signup is not connected yet. Please check back soon.'},{status:503})
  let email=''
  try{const body=await request.json();email=String(body.email||'').trim().toLowerCase()}catch{return NextResponse.json({error:'Enter a valid email address.'},{status:400})}
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:'Enter a valid email address.'},{status:400})
  try{
    const target=new URL(webhook)
    if(target.protocol!=='https:')return NextResponse.json({error:'The signup connection is misconfigured.'},{status:500})
    const headers:Record<string,string>={'Content-Type':'application/json','Accept':'application/json'}
    if(process.env.EMAIL_SIGNUP_WEBHOOK_SECRET)headers.Authorization=`Bearer ${process.env.EMAIL_SIGNUP_WEBHOOK_SECRET}`
    const response=await fetch(target,{method:'POST',headers,body:JSON.stringify({email,source:'flowmint-linkedin-workflow',createdAt:new Date().toISOString()}),signal:AbortSignal.timeout(8000),cache:'no-store'})
    if(!response.ok)return NextResponse.json({error:'We could not save your email. Please try again in a moment.'},{status:502})
    return NextResponse.json({ok:true},{status:200})
  }catch{return NextResponse.json({error:'We could not reach the signup service. Please try again.'},{status:502})}
}
