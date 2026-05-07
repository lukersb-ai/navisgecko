import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ── Rate limiter ────────────────────────────────────────────────────────────
// NOTE: This in-memory store works for single-instance deployments (e.g. VPS).
// On Vercel serverless (multiple instances) use an external store like Upstash Redis.
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = rateLimit.get(ip);

  if (!existing || now > existing.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX) return false;

  existing.count++;
  return true;
}

// ── Input validation ─────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@<>()\[\]\\,;:]+@[^\s@<>()\[\]\\,;:]+\.[^\s@<>()\[\]\\,;:]{2,}$/;

function sanitizeHeader(value: string): string {
  // Strip CR/LF to prevent email header injection
  return value.replace(/[\r\n]/g, '');
}

export async function POST(request: Request) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp    = request.headers.get('x-real-ip');
    // Always apply rate limiting – use a generic key when IP is unavailable
    const ip = forwarded?.split(',')[0]?.trim() || realIp || '__unknown__';

    if (!checkRateLimit(ip)) {
      console.warn('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { success: false, message: 'Wysłano zbyt wiele wiadomości. Spróbuj ponownie za godzinę.' },
        { status: 429 }
      );
    }

    // ── Parse body ────────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Nieprawidłowe żądanie.' }, { status: 400 });
    }

    const { name, email, geckoId, message, website } = body as Record<string, unknown>;

    // ── Honeypot (bot trap) ───────────────────────────────────────────────
    if (typeof website === 'string' && website.trim() !== '') {
      console.info('Bot blocked by honeypot');
      // Return 200 so bots don't know they were blocked
      return NextResponse.json({ success: true, message: 'Wiadomość została wysłana' }, { status: 200 });
    }

    // ── Field validation ──────────────────────────────────────────────────
    if (typeof name    !== 'string' || name.trim().length    === 0 || name.length    > 200) {
      return NextResponse.json({ success: false, message: 'Nieprawidłowe imię.' }, { status: 400 });
    }
    if (typeof email   !== 'string' || !EMAIL_REGEX.test(email) || email.length > 320) {
      return NextResponse.json({ success: false, message: 'Nieprawidłowy adres email.' }, { status: 400 });
    }
    if (typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
      return NextResponse.json({ success: false, message: 'Wiadomość jest pusta lub zbyt długa (max 5000 znaków).' }, { status: 400 });
    }
    const geckoIdSafe = typeof geckoId === 'string' && geckoId.length <= 50 ? geckoId : '';

    // ── Sanitize values used in email headers ─────────────────────────────
    const safeName    = sanitizeHeader(name.trim());
    const safeEmail   = sanitizeHeader(email.trim());
    const safeGeckoId = sanitizeHeader(geckoIdSafe.trim());

    // ── Send email ────────────────────────────────────────────────────────
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from:    process.env.EMAIL_USER,
      to:      'navisgecko@gmail.com',
      replyTo: safeEmail,
      subject: `Nowe zapytanie od ${safeName}${safeGeckoId ? ' [Gekon: ' + safeGeckoId + ']' : ''}`,
      text: [
        'Masz nową wiadomość ze strony (formularz kontaktowy):',
        '',
        `Od: ${safeName}`,
        `Email: ${safeEmail}`,
        `Dotyczy gekona (ID): ${safeGeckoId || 'Brak'}`,
        '',
        'Wiadomość:',
        message.trim(),
      ].join('\n'),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Wiadomość została wysłana' }, { status: 200 });
  } catch (error) {
    console.error('Błąd formularza kontaktowego:', error);
    return NextResponse.json(
      { success: false, message: 'Wystąpił błąd serwera. Nie udało się wysłać maila.' },
      { status: 500 }
    );
  }
}
