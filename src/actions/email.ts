import User from '@/model/User';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import fetch from '@/actions/fetch'

interface EmailDetails {
        to: string;
        subject: string;
        htmlBody: string;
        textBody?: string;
}

const CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN!;
const SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL!;

async function createMailRaw(details: EmailDetails): Promise<string> {
  const mail = await nodemailer.createTransport().sendMail({
    to: details.to,
    from: SENDER_EMAIL,
    subject: 'BuzzFinder Alert: Item claimed',
    html: 'The item you listed has been claimed!',
    text: 'The item you listed has been claimed!',
  });

  const mimeMessage = (mail as any).envelope.message as Buffer;

  // Encode the message buffer to a base64url string
  // Replaces standard base64 characters (+ and /) with URL ones (- and _)
  // and removes padding characters (=) required by the Gmail API 'raw' field.
  const raw = mimeMessage
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); 

  return raw;
}

export async function sendEmailNotification(details: EmailDetails): Promise<void> {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  
  const rawEmail = await createMailRaw(details);

  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawEmail,
      },
    });

    console.log('Email sent Message ID:', response.data.id);
  } catch (error) {
    throw new Error('Could not send email.');
  }
}
