import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, geckoId, message } = body;

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
