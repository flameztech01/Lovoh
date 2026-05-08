// utils/biizzedEmailService.js — rebranded for Biizzed (articles + magazines)
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ==================== BRAND CONFIG ====================
const BRAND_NAME = "Lovoh Create";
const PLATFORM_NAME = "Biizzed";                         // unified platform
const WEBSITE_URL =
  process.env.WEBSITE_URL || process.env.FRONTEND_URL || "https://lovohcreate.com";
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://lovohcreate.com";
const BIIZZED_FEED_URL = `${FRONTEND_URL}/biizzed/feed`;   // main feed
const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || "support@lovohcreate.com";

const FROM_EMAIL =
  process.env.RESEND_FROM_MAGAZINE ||
  `Lovoh Create Biizzed <biizzed@lovohcreate.com>`;

const LOGO_URL =
  process.env.BRAND_LOGO_URL || `${WEBSITE_URL}/images/logo.png`;

// ==================== HELPERS ====================
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const buildRefId = () =>
  `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;

const buildShell = ({
  title,
  eyebrow,
  heading,
  intro,
  bodyHtml,
  footerNote = "Stories that inspire. Ideas that matter.",
}) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia, 'Times New Roman', serif;color:#1a1a1a;">
    <div style="width:100%;background-color:#f5f5f0;padding:24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:0 12px;">
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              border="0"
              width="100%"
              style="max-width:600px;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);"
            >
              <tr>
                <td
                  align="center"
                  style="padding:32px 24px;background:#1a1a1a;border-bottom:4px solid #d4af37;"
                >
                  <div style="margin-bottom:8px;">
                    <div style="font-family:Georgia, serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#d4af37;margin-bottom:8px;">
                      ${escapeHtml(BRAND_NAME)}
                    </div>
                    <div style="font-family:Georgia, serif;font-size:28px;line-height:1.2;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                      ${escapeHtml(PLATFORM_NAME)}
                    </div>
                  </div>
                  <div style="font-family:Georgia, serif;font-size:18px;line-height:1.4;color:#cccccc;margin-top:16px;font-style:italic;">
                    ${escapeHtml(eyebrow)}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 28px;">
                  <div style="font-family:Georgia, serif;font-size:24px;line-height:1.3;color:#1a1a1a;margin-bottom:16px;font-weight:600;">
                    ${escapeHtml(heading)}
                  </div>
                  <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:24px;">
                    ${escapeHtml(intro)}
                  </div>
                  ${bodyHtml}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 28px;background:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
                  <div style="font-family:Arial, sans-serif;font-size:12px;line-height:1.8;color:#888888;">
                    © ${new Date().getFullYear()} ${escapeHtml(BRAND_NAME)}. All rights reserved.
                  </div>
                  <div style="font-family:Arial, sans-serif;font-size:12px;line-height:1.8;color:#888888;margin-top:4px;">
                    ${escapeHtml(footerNote)}
                  </div>
                  <div style="font-family:Arial, sans-serif;font-size:12px;line-height:1.8;color:#888888;margin-top:12px;">
                    <a href="${escapeHtml(BIIZZED_FEED_URL)}" style="color:#1a1a1a;text-decoration:underline;">Explore Biizzed</a> • 
                    <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#1a1a1a;text-decoration:underline;">Contact Support</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
`;

const buildButton = (label, url) => `
  <div style="text-align:center;margin:28px 0;">
    <a
      href="${escapeHtml(url)}"
      style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-family:Arial, sans-serif;font-weight:600;padding:14px 32px;border-radius:6px;border:2px solid #d4af37;"
    >
      ${escapeHtml(label)}
    </a>
  </div>
`;

const buildStoryCard = (story) => `
  <div style="margin:20px 0;padding:20px;background:#fafafa;border-radius:8px;border-left:3px solid #d4af37;">
    <div style="font-family:Georgia, serif;font-size:18px;font-weight:600;color:#1a1a1a;margin-bottom:8px;">
      ${escapeHtml(story.title)}
    </div>
    <div style="font-family:Arial, sans-serif;font-size:13px;color:#888888;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">
      ${escapeHtml(story.category)} • ${story.readTime || "5 min read"}
    </div>
    <div style="font-family:Arial, sans-serif;font-size:14px;line-height:1.6;color:#555555;margin-bottom:16px;">
      ${escapeHtml(story.excerpt || story.summary || "")}
    </div>
    <a href="${escapeHtml(`${BIIZZED_FEED_URL}/${story.slug || story._id}`)}" 
       style="font-family:Arial, sans-serif;font-size:13px;color:#1a1a1a;text-decoration:underline;font-weight:600;">
      Read Full Story →
    </a>
  </div>
`;

const sendBrandedEmail = async ({
  from,
  to,
  subject,
  html,
  text,
  mailer = "Biizzed Email System",
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      text,
      headers: {
        "X-Priority": "1",
        "X-Mailer": mailer,
        "X-Entity-Ref-ID": buildRefId(),
      },
    });
    if (error) {
      throw new Error(error.message || "Unable to send email");
    }
    return { success: true, messageId: data?.id || null };
  } catch (error) {
    console.error(`❌ ${mailer} failed:`, error);
    return { success: false, error: error.message || "Unable to send email" };
  }
};

// ==================== SUBSCRIPTION EMAIL ====================
const sendSubscriptionConfirmation = async (email, name = "") => {
  const subject = `Welcome to ${PLATFORM_NAME}`;

  const bodyHtml = `
    <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:20px;">
      Hello <strong style="color:#1a1a1a;">${escapeHtml(name || "there")}</strong>,
    </div>
    <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:20px;">
      Thank you for subscribing to <strong>${escapeHtml(PLATFORM_NAME)}</strong>. You're now part of a community that celebrates stories worth telling.
    </div>
    <div style="margin:24px 0;padding:20px;background:#fafafa;border-radius:8px;border:1px solid #e5e5e5;">
      <div style="font-family:Georgia, serif;font-size:14px;color:#1a1a1a;line-height:1.6;">
        <strong>What to expect:</strong>
        <ul style="margin:12px 0;padding-left:20px;">
          <li>Weekly curated articles & magazine features</li>
          <li>Exclusive business insights and trends</li>
          <li>Early access to our print editions</li>
          <li>Invitations to Lovoh Create events</li>
        </ul>
      </div>
    </div>
    ${buildButton("Explore Biizzed", BIIZZED_FEED_URL)}
    <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1.6;color:#888888;margin-top:24px;">
      You can unsubscribe at any time by clicking the link at the bottom of any email we send.
    </div>
  `;

  const html = buildShell({
    title: subject,
    eyebrow: "Subscription Confirmed",
    heading: "You're on the list",
    intro: "Welcome to stories that matter. Welcome to Biizzed.",
    bodyHtml,
  });

  const text = `
${BRAND_NAME} | ${PLATFORM_NAME}

Hello ${name || "there"},

Thank you for subscribing to Biizzed. You're now part of a community that celebrates stories worth telling.

What to expect:
- Weekly curated articles & magazine features
- Exclusive business insights and trends
- Early access to our print editions
- Invitations to Lovoh Create events

Explore: ${BIIZZED_FEED_URL}

Need help? Contact ${SUPPORT_EMAIL}
  `.trim();

  return sendBrandedEmail({
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
    text,
    mailer: "Biizzed Subscription Confirmation",
  });
};

// ==================== NEW STORY NOTIFICATION ====================
const sendNewMagazineNotification = async (email, name = "", story, isFeatured = false) => {
  const subject = isFeatured
    ? `Featured Story: ${story.title} | ${PLATFORM_NAME}`
    : `New Story: ${story.title} | ${PLATFORM_NAME}`;

  const bodyHtml = `
    <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:20px;">
      Hello <strong style="color:#1a1a1a;">${escapeHtml(name || "there")}</strong>,
    </div>
    <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:24px;">
      A new ${isFeatured ? '<span style="color:#d4af37;font-weight:600;">featured</span> ' : ''}story has just been published on ${escapeHtml(PLATFORM_NAME)}.
    </div>
    ${buildStoryCard(story)}
    ${buildButton("Explore Biizzed", BIIZZED_FEED_URL)}
    <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1.6;color:#888888;margin-top:24px;">
      You're receiving this because you subscribed to ${PLATFORM_NAME} updates.
    </div>
  `;

  const html = buildShell({
    title: subject,
    eyebrow: isFeatured ? "Featured Story" : "Fresh from the Press",
    heading: story.title,
    intro: "A story worth your time. A perspective worth exploring.",
    bodyHtml,
  });

  const text = `
${BRAND_NAME} | ${PLATFORM_NAME}

Hello ${name || "there"},

A new ${isFeatured ? 'featured ' : ''}story has just been published on Biizzed.

${story.title}
${story.category} • ${story.readTime || "5 min read"}

${story.excerpt || story.summary || ""}

Read more: ${BIIZZED_FEED_URL}/${story.slug || story._id}

Need help? Contact ${SUPPORT_EMAIL}
  `.trim();

  return sendBrandedEmail({
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
    text,
    mailer: "Biizzed New Story Notification",
  });
};

// ==================== WEEKLY DIGEST ====================
const sendWeeklyDigest = async (email, name = "", stories = []) => {
  if (stories.length === 0) return { success: true, skipped: true };

  const subject = `This Week's Highlights | ${PLATFORM_NAME}`;

  const storiesHtml = stories.map(story => buildStoryCard(story)).join('');

  const bodyHtml = `
    <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:20px;">
      Hello <strong style="color:#1a1a1a;">${escapeHtml(name || "there")}</strong>,
    </div>
    <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:24px;">
      Here's what caught our attention this week. Stories that inform, inspire, and ignite conversation.
    </div>
    ${storiesHtml}
    ${buildButton("Explore Biizzed", BIIZZED_FEED_URL)}
    <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1.6;color:#888888;margin-top:24px;">
      You're receiving this because you subscribed to ${PLATFORM_NAME} weekly digest.
    </div>
  `;

  const html = buildShell({
    title: subject,
    eyebrow: "Weekly Digest",
    heading: "This week's highlights",
    intro: "Curated stories for curious minds.",
    bodyHtml,
  });

  const storiesText = stories.map(s => `- ${s.title} (${s.category})`).join('\n');

  const text = `
${BRAND_NAME} | ${PLATFORM_NAME}

Hello ${name || "there"},

Here's what caught our attention this week:

${storiesText}

View all: ${BIIZZED_FEED_URL}

Need help? Contact ${SUPPORT_EMAIL}
  `.trim();

  return sendBrandedEmail({
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
    text,
    mailer: "Biizzed Weekly Digest",
  });
};

// ==================== UNSUBSCRIBE CONFIRMATION ====================
const sendUnsubscribeConfirmation = async (email, name = "") => {
  const subject = `You've Unsubscribed | ${PLATFORM_NAME}`;

  const bodyHtml = `
    <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:20px;">
      Hello <strong style="color:#1a1a1a;">${escapeHtml(name || "there")}</strong>,
    </div>
    <div style="font-family:Arial, sans-serif;font-size:15px;line-height:1.7;color:#555555;margin-bottom:20px;">
      You've been successfully unsubscribed from <strong>${escapeHtml(PLATFORM_NAME)}</strong> email updates.
    </div>
    <div style="margin:24px 0;padding:20px;background:#fafafa;border-radius:8px;border:1px solid #e5e5e5;">
      <div style="font-family:Arial, sans-serif;font-size:14px;color:#555555;line-height:1.6;">
        We're sorry to see you go. If you change your mind, you can always resubscribe on our website.
      </div>
    </div>
    <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1.6;color:#888888;margin-top:24px;">
      Didn't mean to unsubscribe? <a href="${escapeHtml(BIIZZED_FEED_URL)}/resubscribe?email=${encodeURIComponent(email)}" style="color:#1a1a1a;text-decoration:underline;">Resubscribe here</a>
    </div>
  `;

  const html = buildShell({
    title: subject,
    eyebrow: "Subscription Updated",
    heading: "You're unsubscribed",
    intro: "You won't receive any more emails from us.",
    bodyHtml,
  });

  const text = `
${BRAND_NAME} | ${PLATFORM_NAME}

Hello ${name || "there"},

You've been successfully unsubscribed from Biizzed email updates.

We're sorry to see you go. If you change your mind, you can always resubscribe on our website.

Resubscribe: ${BIIZZED_FEED_URL}/resubscribe?email=${encodeURIComponent(email)}

Need help? Contact ${SUPPORT_EMAIL}
  `.trim();

  return sendBrandedEmail({
    from: FROM_EMAIL,
    to: email,
    subject,
    html,
    text,
    mailer: "Biizzed Unsubscribe Confirmation",
  });
};

export {
  sendSubscriptionConfirmation,
  sendNewMagazineNotification,
  sendWeeklyDigest,
  sendUnsubscribeConfirmation,
};