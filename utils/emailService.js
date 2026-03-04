import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

export const sendInviteEmail = async (toEmail, tripName, inviteLink, inviterName) => {
    // Skip if email credentials not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[Email] Credentials not configured — skipping send to', toEmail);
        return false;
    }

    try {
        const transporter = createTransporter();

        // Verify connection first
        await transporter.verify();

        const info = await transporter.sendMail({
            from: `"Settlr" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `${inviterName} invited you to join "${tripName}" on Settlr`,
            html: `
                <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
                    <div style="padding: 40px 32px; text-align: center; border-bottom: 1px solid #1e293b;">
                        <h1 style="color: #a855f7; font-size: 28px; font-weight: 900; margin: 0 0 4px;">Settlr</h1>
                        <p style="color: #64748b; font-size: 13px; margin: 0;">Group Expense Manager</p>
                    </div>
                    <div style="padding: 32px;">
                        <h2 style="color: #f1f5f9; font-size: 20px; font-weight: 700; margin: 0 0 16px;">You're invited! 🎉</h2>
                        <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 28px;">
                            <strong style="color: #f1f5f9;">${inviterName}</strong> has invited you to join the trip 
                            <strong style="color: #a855f7;">"${tripName}"</strong> on Settlr. 
                            Click the button below to accept and start tracking expenses together.
                        </p>
                        <div style="text-align: center; margin-bottom: 28px;">
                            <a href="${inviteLink}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
                                Join Trip →
                            </a>
                        </div>
                        <p style="color: #475569; font-size: 12px; margin: 0; line-height: 1.6; text-align: center;">
                            Or copy this link:<br/>
                            <a href="${inviteLink}" style="color: #818cf8; word-break: break-all;">${inviteLink}</a>
                        </p>
                    </div>
                </div>
            `,
        });

        console.log(`[Email] Sent invite to ${toEmail} — messageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email] Failed to send to ${toEmail}:`, error.message);
        return false;
    }
};
