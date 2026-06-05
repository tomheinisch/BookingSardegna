import { Resend } from "resend";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "Sardinien Buchungen <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://booking-sardegna.vercel.app";

function fmt(date: Date) {
  return format(date, "dd. MMMM yyyy", { locale: de });
}

function nächteText(start: Date, end: Date) {
  const nächte = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return `${nächte} Nacht${nächte !== 1 ? "e" : ""}`;
}

// ── Neue Buchungsanfrage → User ──────────────────────────────────────────────
export async function sendBookingRequestConfirmation(opts: {
  to: string;
  userName: string;
  propertyName: string;
  startDate: Date;
  endDate: Date;
  guests: number;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Buchungsanfrage eingegangen – ${opts.propertyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#1d4ed8">Deine Buchungsanfrage ist eingegangen 🏖</h2>
        <p>Hallo ${opts.userName},</p>
        <p>wir haben deine Anfrage erhalten und werden sie so bald wie möglich prüfen.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px 0;color:#555">Objekt</td><td style="padding:8px 0;font-weight:600">${opts.propertyName}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Anreise</td><td style="padding:8px 0">${fmt(opts.startDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Abreise</td><td style="padding:8px 0">${fmt(opts.endDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Dauer</td><td style="padding:8px 0">${nächteText(opts.startDate, opts.endDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Gäste</td><td style="padding:8px 0">${opts.guests}</td></tr>
        </table>
        <p>Du erhältst eine weitere E-Mail, sobald deine Anfrage bestätigt oder abgelehnt wurde.</p>
        <a href="${SITE_URL}/buchungen" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none">Meine Buchungen ansehen</a>
        <p style="margin-top:24px;font-size:13px;color:#888">Sardinien Ferienwohnungen</p>
      </div>
    `,
  });
}

// ── Neue Buchungsanfrage → Admins ────────────────────────────────────────────
export async function sendAdminNewBookingNotification(opts: {
  adminEmails: string[];
  userName: string;
  userEmail: string;
  propertyName: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  message?: string | null;
}) {
  if (opts.adminEmails.length === 0) return;
  await resend.emails.send({
    from: FROM,
    to: opts.adminEmails,
    subject: `Neue Buchungsanfrage – ${opts.propertyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#1d4ed8">Neue Buchungsanfrage 📬</h2>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px 0;color:#555">Gast</td><td style="padding:8px 0;font-weight:600">${opts.userName} (${opts.userEmail})</td></tr>
          <tr><td style="padding:8px 0;color:#555">Objekt</td><td style="padding:8px 0">${opts.propertyName}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Anreise</td><td style="padding:8px 0">${fmt(opts.startDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Abreise</td><td style="padding:8px 0">${fmt(opts.endDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Dauer</td><td style="padding:8px 0">${nächteText(opts.startDate, opts.endDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Gäste</td><td style="padding:8px 0">${opts.guests}</td></tr>
          ${opts.message ? `<tr><td style="padding:8px 0;color:#555;vertical-align:top">Nachricht</td><td style="padding:8px 0">${opts.message}</td></tr>` : ""}
        </table>
        <a href="${SITE_URL}/admin/buchungen" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none">Anfragen verwalten</a>
        <p style="margin-top:24px;font-size:13px;color:#888">Sardinien Ferienwohnungen – Admin-Benachrichtigung</p>
      </div>
    `,
  });
}

// ── Buchung bestätigt → User ─────────────────────────────────────────────────
export async function sendBookingConfirmed(opts: {
  to: string;
  userName: string;
  propertyName: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  adminNote?: string | null;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Buchung bestätigt – ${opts.propertyName} ✅`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#16a34a">Deine Buchung ist bestätigt! ✅</h2>
        <p>Hallo ${opts.userName},</p>
        <p>wir freuen uns, deine Buchung bestätigen zu können. Wir sehen uns auf Sardinien!</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px 0;color:#555">Objekt</td><td style="padding:8px 0;font-weight:600">${opts.propertyName}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Anreise</td><td style="padding:8px 0">${fmt(opts.startDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Abreise</td><td style="padding:8px 0">${fmt(opts.endDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Dauer</td><td style="padding:8px 0">${nächteText(opts.startDate, opts.endDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Gäste</td><td style="padding:8px 0">${opts.guests}</td></tr>
          ${opts.adminNote ? `<tr><td style="padding:8px 0;color:#555;vertical-align:top">Hinweis</td><td style="padding:8px 0">${opts.adminNote}</td></tr>` : ""}
        </table>
        <a href="${SITE_URL}/buchungen" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none">Buchungsdetails ansehen</a>
        <p style="margin-top:24px;font-size:13px;color:#888">Sardinien Ferienwohnungen</p>
      </div>
    `,
  });
}

// ── Buchung abgelehnt → User ─────────────────────────────────────────────────
export async function sendBookingRejected(opts: {
  to: string;
  userName: string;
  propertyName: string;
  startDate: Date;
  endDate: Date;
  adminNote?: string | null;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Buchungsanfrage abgelehnt – ${opts.propertyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#dc2626">Buchungsanfrage leider abgelehnt</h2>
        <p>Hallo ${opts.userName},</p>
        <p>leider können wir deine Anfrage für den gewünschten Zeitraum nicht bestätigen.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px 0;color:#555">Objekt</td><td style="padding:8px 0;font-weight:600">${opts.propertyName}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Anreise</td><td style="padding:8px 0">${fmt(opts.startDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Abreise</td><td style="padding:8px 0">${fmt(opts.endDate)}</td></tr>
          ${opts.adminNote ? `<tr><td style="padding:8px 0;color:#555;vertical-align:top">Grund</td><td style="padding:8px 0">${opts.adminNote}</td></tr>` : ""}
        </table>
        <p>Du kannst gerne andere Daten anfragen.</p>
        <a href="${SITE_URL}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none">Andere Daten suchen</a>
        <p style="margin-top:24px;font-size:13px;color:#888">Sardinien Ferienwohnungen</p>
      </div>
    `,
  });
}

// ── Buchung storniert → User ─────────────────────────────────────────────────
export async function sendBookingCancelled(opts: {
  to: string;
  userName: string;
  propertyName: string;
  startDate: Date;
  endDate: Date;
}) {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Buchung storniert – ${opts.propertyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#d97706">Buchung storniert</h2>
        <p>Hallo ${opts.userName},</p>
        <p>deine Buchung wurde erfolgreich storniert.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px 0;color:#555">Objekt</td><td style="padding:8px 0;font-weight:600">${opts.propertyName}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Anreise</td><td style="padding:8px 0">${fmt(opts.startDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Abreise</td><td style="padding:8px 0">${fmt(opts.endDate)}</td></tr>
        </table>
        <a href="${SITE_URL}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none">Neue Anfrage stellen</a>
        <p style="margin-top:24px;font-size:13px;color:#888">Sardinien Ferienwohnungen</p>
      </div>
    `,
  });
}
