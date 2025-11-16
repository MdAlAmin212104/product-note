import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendUninstallEmail(shopDomain: string, email: string) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: `${email}`, // where YOU want to receive uninstall notifications
    subject: `App Uninstalled by ${shopDomain}`,
     html: `
    <div style="font-family: Arial; padding: 20px; line-height: 1.6;">
      <h2>We noticed you uninstalled our app</h2>
      <p>Hi,</p>
      <p>
        We saw that <strong>${shopDomain}</strong> has uninstalled our app.  
        We’re truly sorry to see you go!
      </p>

      <p>
        We always want to improve.  
        Could you share what went wrong or what we can improve?
      </p>

      <p><strong>Your feedback will help us build a better experience.</strong></p>

      <p>You can reply directly to this email — we read every message.</p>

      <p>
        📩 <strong>Reply To:</strong> mdalamin212104@gmail.com
      </p>

      <br />
      <p>Thank you,</p>
      <p>The App Support Team</p>
    </div>
  `,
  });
}
