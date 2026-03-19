import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API);

interface StatusEmailParams {
    to: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    status: 'accepted' | 'rejected' | 'shortlisted';
    feedback?: string;
}

// ── Shared layout wrapper ────────────────────────────────────────────────────

function layout(accentColor: string, iconSvg: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartHire</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Smart<span style="color:${accentColor};">Hire</span>
              </span>
              <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">AI-Powered Recruitment</p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:${accentColor};padding:20px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">${iconSvg}</td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.5px;text-transform:uppercase;">${body.split('|||BADGE|||')[0]}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;">
              ${body.split('|||BADGE|||')[1]}

              <!-- Footer divider -->
              <tr><td><hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" /></td></tr>

              <!-- Footer -->
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
                This is an automated notification from <strong>SmartHire</strong>.<br/>
                Please do not reply to this email.
              </p>
            </td>
          </tr>

          <!-- Bottom spacer -->
          <tr><td style="height:24px;"></td></tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Info box helper ──────────────────────────────────────────────────────────

function infoBox(label: string, value: string, color: string): string {
    return `
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
      <tr>
        <td style="background:#f8fafc;border-left:3px solid ${color};border-radius:0 8px 8px 0;padding:12px 16px;">
          <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${label}</p>
          <p style="margin:4px 0 0;font-size:15px;color:#1e293b;font-weight:600;">${value}</p>
        </td>
      </tr>
    </table>`;
}

function greeting(candidateName: string): string {
    return `<p style="margin:0 0 24px;font-size:24px;font-weight:700;color:#0f172a;">Hi ${candidateName},</p>`;
}

function bodyText(text: string): string {
    return `<p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">${text}</p>`;
}

// ── Templates ────────────────────────────────────────────────────────────────

function shortlistedHtml(candidateName: string, jobTitle: string, companyName: string): string {
    const accent = '#0ea5e9';
    const icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>`;
    const badge = `You've Been Shortlisted`;
    const body = `
        ${greeting(candidateName)}
        ${bodyText(`Great news — you've been shortlisted for the position below. The hiring team has reviewed your application and wants to move forward with you.`)}
        ${infoBox('Position', jobTitle, accent)}
        ${infoBox('Company', companyName, accent)}
        ${bodyText(`The recruiter will be in touch soon with the next steps. Make sure to keep an eye on your inbox.`)}
        <p style="margin:0;font-size:15px;color:#475569;line-height:1.7;">Best of luck, and congratulations on making it this far! 🎉</p>`;
    return layout(accent, icon, `${badge}|||BADGE|||${body}`);
}

function acceptedHtml(candidateName: string, jobTitle: string, companyName: string): string {
    const accent = '#10b981';
    const icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    const badge = `Application Accepted`;
    const body = `
        ${greeting(candidateName)}
        ${bodyText(`We are thrilled to let you know that your application has been <strong style="color:#10b981;">accepted</strong>! After a thorough review, the team has decided to move forward with you.`)}
        ${infoBox('Position', jobTitle, accent)}
        ${infoBox('Company', companyName, accent)}
        ${bodyText(`The hiring team will reach out to you shortly with details on the next steps, including onboarding, offer letter, and start date information.`)}
        <p style="margin:0;font-size:15px;color:#475569;line-height:1.7;">Congratulations, and welcome aboard! 🚀</p>`;
    return layout(accent, icon, `${badge}|||BADGE|||${body}`);
}

function rejectedHtml(candidateName: string, jobTitle: string, companyName: string, feedback?: string): string {
    const accent = '#64748b';
    const icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    const badge = `Application Update`;
    const feedbackBlock = feedback ? `
        <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
          <tr>
            <td style="background:#fef9f0;border:1px solid #fed7aa;border-radius:10px;padding:20px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Feedback from the Recruiter</p>
              <p style="margin:0;font-size:14px;color:#78350f;line-height:1.7;font-style:italic;">"${feedback}"</p>
            </td>
          </tr>
        </table>` : '';
    const body = `
        ${greeting(candidateName)}
        ${bodyText(`Thank you for taking the time to apply for the position below. After careful consideration, the team has decided to move forward with other candidates at this time.`)}
        ${infoBox('Position', jobTitle, accent)}
        ${infoBox('Company', companyName, accent)}
        ${feedbackBlock}
        ${bodyText(`This decision was not easy, and we genuinely appreciate the effort you put into your application. We encourage you to keep applying — the right opportunity is out there.`)}
        <p style="margin:0;font-size:15px;color:#475569;line-height:1.7;">We wish you all the best in your job search. 💪</p>`;
    return layout(accent, icon, `${badge}|||BADGE|||${body}`);
}

// ── Subjects ─────────────────────────────────────────────────────────────────

const subjects: Record<StatusEmailParams['status'], (jobTitle: string) => string> = {
    shortlisted: (t) => `🎯 You've been shortlisted for ${t}`,
    accepted:    (t) => `🎉 Congratulations! Your application for ${t} has been accepted`,
    rejected:    (t) => `Your application for ${t} — an update`,
};

// ── Export ───────────────────────────────────────────────────────────────────

export async function sendStatusEmail(params: StatusEmailParams) {
    const { to, candidateName, jobTitle, companyName, status, feedback } = params;

    const htmlMap: Record<StatusEmailParams['status'], string> = {
        shortlisted: shortlistedHtml(candidateName, jobTitle, companyName),
        accepted:    acceptedHtml(candidateName, jobTitle, companyName),
        rejected:    rejectedHtml(candidateName, jobTitle, companyName, feedback),
    };

    await resend.emails.send({
        from: 'SmartHire <noreply@smarthire.website>',
        to,
        subject: subjects[status](jobTitle),
        html: htmlMap[status],
    });
}
