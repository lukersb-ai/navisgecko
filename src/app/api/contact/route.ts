import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, geckoId, message } = body;

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Here we would normally send an email using Resend, Nodemailer, etc.
    // Since the user requested to mock it for now, we just log it.
    console.log('--- DODANO NOWE ZAPYTANIE Z FORMULARZA KONTAKTOWEGO ---');
    console.log(`Od: ${name} (${email})`);
    if (geckoId) {
      console.log(`Zainteresowany gekonem: ${geckoId}`);
    }
    console.log(`Wiadomość:\n${message}`);
    console.log('----------------------------------------------------');

    return NextResponse.json({ success: true, message: 'Wiadomość została wysłana' }, { status: 200 });
  } catch (error) {
    console.error('Błąd formularza kontaktowego:', error);
    return NextResponse.json({ success: false, message: 'Wystąpił błąd serwera.' }, { status: 500 });
  }
}
