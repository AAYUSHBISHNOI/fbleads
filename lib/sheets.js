import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';

export async function appendToSheet(leadData) {
  const credentialsPath = path.join(process.cwd(), 'config/credentials.json');
  const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const row = [
    new Date().toLocaleString(),
    leadData.field_data.find((f) => f.name === 'full_name')?.values[0] || '',
    leadData.field_data.find((f) => f.name === 'email')?.values[0] || '',
    leadData.field_data.find((f) => f.name === 'phone_number')?.values[0] || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [row],
    },
  });
}
