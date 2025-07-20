import { NextResponse } from 'next/server';
import { getLeadData } from '@/lib/facebook';
import { appendToSheet } from '@/lib/sheets';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(req) {
  const body = await req.json();

  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const leadId = change.value.leadgen_id;

        try {
          const leadData = await getLeadData(leadId);
          await appendToSheet(leadData);
        } catch (error) {
          console.error('Error handling lead:', error.message);
        }
      }
    }
    return NextResponse.json({ success: true });
  } else {
    return new NextResponse('Not a page event', { status: 400 });
  }
}
