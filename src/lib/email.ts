import { Resend } from "resend";
import { env } from "./env";
import { logWarn, logError } from "./logger";

let resend: Resend | null = null;

function getResend() {
   if (!resend) {
      resend = new Resend(env.RESEND_API_KEY);
   }
   return resend;
}

export interface SendEmailArgs {
   to: string;
   subject: string;
   html: string;
   replyTo?: string;
}

export async function sendEmail({
   to,
   subject,
   html,
   replyTo,
}: SendEmailArgs): Promise<{
   id?: string;
   skipped?: boolean;
   error?: string;
}> {
   if (!env.RESEND_API_KEY) {
      logWarn("email", "RESEND_API_KEY not set — skipping send", {
         to,
         subject,
      });
      return { skipped: true };
   }

   try {
      const { data, error } = await getResend().emails.send({
         from: env.RESEND_FROM_EMAIL,
         to,
         subject,
         html,
         replyTo,
      });
      if (error) throw error;
      return { id: data?.id };
   } catch (err) {
      logError("email:send", err, { to, subject });
      return { error: (err as Error).message };
   }
}

// =========================================
// Helpers
// =========================================
function esc(s: string): string {
   return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
}

function wrap(body: string): string {
   return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
   <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
      <tr><td align="center">
         <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#141414;border:1px solid #262626;border-radius:12px;overflow:hidden">
            <tr><td style="padding:24px 28px;border-bottom:1px solid #262626">
               <div style="color:#fff;font-size:14px;font-weight:700;letter-spacing:0.2px">
                  <span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border-radius:50%;margin-right:8px;vertical-align:middle"></span>
                  Space-Ex
               </div>
            </td></tr>
            <tr><td style="padding:28px;color:#fff;font-size:14px;line-height:1.6">
               ${body}
            </td></tr>
            <tr><td style="padding:16px 28px;border-top:1px solid #262626;color:#666;font-size:11px">
               You're receiving this because you have a Space-Ex account.
            </td></tr>
         </table>
      </td></tr>
   </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
   return `<a href="${href}" style="display:inline-block;padding:12px 22px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:13.5px;margin:8px 0">${esc(text)}</a>`;
}

// =========================================
// Templates
// =========================================

export function welcomeEmail(name: string, appUrl: string) {
   const firstName = (name || "there").split(" ")[0];
   return {
      subject: `Welcome to Space-Ex, ${firstName}`,
      html: wrap(`
         <h1 style="font-size:22px;margin:0 0 12px;font-weight:700">Welcome, ${esc(firstName)} 👋</h1>
         <p style="color:#ccc;margin:0 0 16px">
            Your Space-Ex account is live. Here's what to do next:
         </p>
         <ul style="color:#ccc;padding-left:20px;margin:0 0 20px">
            <li style="margin-bottom:8px"><strong style="color:#fff">Creators</strong> — browse campaigns on Discover and request to join</li>
            <li><strong style="color:#fff">Businesses</strong> — set up your business and launch your first campaign</li>
         </ul>
         ${button("Explore campaigns", `${appUrl}/discover`)}
      `),
   };
}

export function newSignupEmail(
   businessName: string,
   campaignTitle: string,
   creatorName: string,
   appUrl: string,
) {
   return {
      subject: `${creatorName} requested to join "${campaignTitle}"`,
      html: wrap(`
         <h2 style="font-size:18px;margin:0 0 12px;font-weight:700">New join request 🎉</h2>
         <p style="color:#ccc;margin:0 0 8px">
            <strong style="color:#fff">${esc(creatorName)}</strong> wants to join your campaign
            <strong style="color:#fff">${esc(campaignTitle)}</strong>.
         </p>
         <p style="color:#888;margin:0 0 20px;font-size:13px">
            Business: ${esc(businessName)}
         </p>
         <p style="color:#ccc;margin:0 0 20px">
            Review their profile and approve or decline the request.
         </p>
         ${button("Review request", `${appUrl}/business/campaigns`)}
      `),
   };
}

export function approvedEmail(
   businessName: string,
   campaignTitle: string,
   creatorName: string,
   appUrl: string,
   campaignSlug: string,
) {
   return {
      subject: `You're approved for "${campaignTitle}"`,
      html: wrap(`
         <h2 style="font-size:18px;margin:0 0 12px;font-weight:700">Approved ✅</h2>
         <p style="color:#ccc;margin:0 0 8px">
            Hi ${esc(creatorName)}, <strong style="color:#fff">${esc(businessName)}</strong>
            approved your request to join <strong style="color:#fff">${esc(campaignTitle)}</strong>.
         </p>
         <p style="color:#ccc;margin:0 0 20px">
            Start creating content and submit your views to earn.
         </p>
         ${button("Open campaign", `${appUrl}/discover/${campaignSlug}`)}
      `),
   };
}

export function rejectedEmail(
   businessName: string,
   campaignTitle: string,
   creatorName: string,
   note: string,
   appUrl: string,
) {
   const noteBlock = note
      ? `<p style="color:#ccc;margin:0 0 20px;padding:12px;background:#1a1a1a;border-left:3px solid #f87171;border-radius:6px">
            <strong style="color:#fff">Note from the business:</strong><br>
            ${esc(note)}
         </p>`
      : "";
   return {
      subject: `Update on your request for "${campaignTitle}"`,
      html: wrap(`
         <h2 style="font-size:18px;margin:0 0 12px;font-weight:700">Request update</h2>
         <p style="color:#ccc;margin:0 0 8px">
            Hi ${esc(creatorName)}, <strong style="color:#fff">${esc(businessName)}</strong>
            reviewed your request for <strong style="color:#fff">${esc(campaignTitle)}</strong>
            and it wasn't approved this time.
         </p>
         ${noteBlock}
         <p style="color:#ccc;margin:0 0 20px">
            Don't be discouraged — there are plenty of other campaigns on Discover.
         </p>
         ${button("Browse campaigns", `${appUrl}/discover`)}
      `),
   };
}

export function passwordResetEmail(resetUrl: string, name: string) {
   return {
      subject: "Reset your Space-Ex password",
      html: wrap(`
         <h2 style="font-size:18px;margin:0 0 12px;font-weight:700">Reset your password</h2>
         <p style="color:#ccc;margin:0 0 12px">
            Hi ${esc(name)}, we received a request to reset your password.
         </p>
         <p style="color:#ccc;margin:0 0 20px">
            This link expires in 1 hour. If you didn't request it, ignore this email.
         </p>
         ${button("Reset password", resetUrl)}
         <p style="color:#666;font-size:12px;margin-top:20px;word-break:break-all">
            Or copy: ${esc(resetUrl)}
         </p>
      `),
   };
}
