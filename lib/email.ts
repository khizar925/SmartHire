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

export async function sendStatusEmail(params: StatusEmailParams) {
    const { to, candidateName, jobTitle, companyName, status, feedback } = params;

    const subjects: Record<StatusEmailParams['status'], string> = {
        accepted: `Congratulations! Your application to ${jobTitle} has been accepted`,
        rejected: `Update on your application to ${jobTitle}`,
        shortlisted: `You've been shortlisted for ${jobTitle}`,
    };

    const bodies: Record<StatusEmailParams['status'], string> = {
        accepted: `Hi ${candidateName},\n\nGreat news! Your application for ${jobTitle} at ${companyName} has been accepted.\n\nThe hiring team will be in touch with you shortly regarding next steps.\n\nBest regards,\n${companyName}`,
        rejected: `Hi ${candidateName},\n\nThank you for applying for ${jobTitle} at ${companyName}.\n\nAfter careful consideration, we have decided to move forward with other candidates.${feedback ? `\n\nFeedback from the recruiter:\n${feedback}` : ''}\n\nWe wish you the best in your job search.\n\nBest regards,\n${companyName}`,
        shortlisted: `Hi ${candidateName},\n\nGreat news! You have been shortlisted for ${jobTitle} at ${companyName}.\n\nThe hiring team will review your profile further and be in touch soon.\n\nBest regards,\n${companyName}`,
    };

    await resend.emails.send({
        from: 'SmartHire <noreply@smarthire.website>',
        to,
        subject: subjects[status],
        text: bodies[status],
    });
}
