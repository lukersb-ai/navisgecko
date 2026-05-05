import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Prosty in-memory rate limiter
const rateLimit = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limitData = rateLimit.get(ip);
  
  if (!limitData) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 }); // 1 godzina
    return true;
  }
  
  if (now > limitData.resetTime) {
    // Reset po godzinie
    rateLimit.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
    return true;
  }
  
  if (limitData.count >= 3) {
    return false; // Przekroczono limit
  }
  
  limitData.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    if (ip !== 'unknown' && !checkRateLimit(ip)) {
      console.log('Zablokowano IP za spam:', ip);
      return NextResponse.json({ 
        success: false, 
        message: 'Wysłano zbyt wiele wiadomości. Spróbuj ponownie za godzinę.' 
      }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, geckoId, message, website } = body;

    // Honeypot check - if a bot filled out this invisible field, we quietly reject it
    if (website && website.trim() !== '') {
      console.log('Bot blocked by honeypot');
      return NextResponse.json({ success: true, message: 'Wiadomość została wysłana' }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'navisgecko@gmail.com',
      replyTo: email,
      subject: `Nowe zapytanie od ${name} ${geckoId ? '[Gekon: ' + geckoId + ']' : ''}`,
      text: `Masz nową wiadomość ze strony (formularz kontaktowy):\n\nOd: ${name}\nEmail: ${email}\nDotyczy gekona (ID): ${geckoId || 'Brak'}\n\nWiadomość:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Wiadomość została wysłana' }, { status: 200 });
  } catch (error) {
    console.error('Błąd formularza kontaktowego:', error);
    return NextResponse.json({ success: false, message: 'Wystąpił błąd serwera. Nie udało się wysłać maila.' }, { status: 500 });
  }
}
