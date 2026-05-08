// utils/formEmailService.js
import { Resend } from 'resend';

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Format form data for email
const formatFormDataForEmail = (formData) => {
  if (!formData) return 'No additional data provided.';
  
  if (typeof formData === 'string') {
    return formData;
  }
  
  try {
    return Object.entries(formData)
      .map(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        if (Array.isArray(value)) {
          return `<strong>${formattedKey}:</strong> ${value.join(', ')}`;
        } else if (typeof value === 'object') {
          return `<strong>${formattedKey}:</strong><br><pre style="background:#f5f5f5;padding:10px;border-radius:5px;overflow-x:auto;">${JSON.stringify(value, null, 2)}</pre>`;
        }
        return `<strong>${formattedKey}:</strong> ${value || 'Not provided'}`;
      })
      .join('<br>');
  } catch (error) {
    return `<pre style="background:#f5f5f5;padding:10px;border-radius:5px;overflow-x:auto;">${JSON.stringify(formData, null, 2)}</pre>`;
  }
};

// Get form type display name
const getFormTypeDisplay = (formType) => {
  const formTypes = {
    'contact': '📞 Contact Form',
    'getintouch': '🤝 Get In Touch',
    'startproject': '🚀 Start Project',
    'servicequote': '💼 Service Quote Request',
    'newsletter': '📧 Newsletter Subscription',
    'general': '📋 General Form'
  };
  return formTypes[formType] || formType;
};

// Get status badge color
const getFormTypeColor = (formType) => {
  const colors = {
    'contact': '#3B82F6',
    'getintouch': '#10B981',
    'startproject': '#8B5CF6',
    'servicequote': '#F59E0B',
    'newsletter': '#EC4899',
    'general': '#6B7280'
  };
  return colors[formType] || '#6B7280';
};

// Send form notification email to admin
const sendFormNotification = async ({ formType, formName, contactInfo, formData, metadata }) => {
  if (!resend) {
    console.log('❌ Resend not configured. Form email notification skipped.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@lovohcreate.com';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@lovohcreate.com';
  
  const formTypeDisplay = getFormTypeDisplay(formType);
  const formTypeColor = getFormTypeColor(formType);
  const formattedFormData = formatFormDataForEmail(formData);
  
  const submittedAt = metadata?.submittedAt 
    ? new Date(metadata.submittedAt).toLocaleString('en-NG', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      })
    : new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          line-height: 1.6; 
          color: #1F2937; 
          background: #F3F4F6;
          margin: 0;
          padding: 20px;
        }
        .container { 
          max-width: 650px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 16px; 
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, ${formTypeColor} 0%, ${formTypeColor}dd 100%); 
          color: white; 
          padding: 24px 30px; 
        }
        .header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .content { 
          padding: 30px; 
        }
        .badge {
          display: inline-block;
          background: ${formTypeColor}20;
          color: ${formTypeColor};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .section { 
          background: #F9FAFB; 
          padding: 20px; 
          margin-bottom: 20px; 
          border-radius: 12px; 
          border-left: 4px solid ${formTypeColor};
        }
        .section-title { 
          font-weight: 600; 
          color: #111827; 
          margin-bottom: 15px; 
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6B7280;
          margin-bottom: 2px;
        }
        .info-value {
          font-weight: 500;
          color: #1F2937;
          word-break: break-word;
        }
        .form-data {
          background: white;
          padding: 15px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.8;
        }
        .form-data strong {
          color: ${formTypeColor};
        }
        .metadata {
          font-size: 12px;
          color: #6B7280;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
        }
        .footer {
          background: #F9FAFB;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #6B7280;
          border-top: 1px solid #E5E7EB;
        }
        .footer a {
          color: ${formTypeColor};
          text-decoration: none;
        }
        .button {
          display: inline-block;
          background: ${formTypeColor};
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          margin-top: 15px;
        }
        pre {
          background: #1F2937;
          color: #E5E7EB;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 12px;
          margin: 10px 0 0 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${formTypeDisplay}</h2>
          <p>New submission from ${formName || 'your website'}</p>
        </div>
        
        <div class="content">
          <span class="badge">📬 New Submission</span>
          
          <div class="section">
            <div class="section-title">
              <span>👤 Contact Information</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">${contactInfo?.name || 'Not provided'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">${contactInfo?.email || 'Not provided'}</span>
              </div>
              ${contactInfo?.phone ? `
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">${contactInfo.phone}</span>
              </div>
              ` : ''}
              ${contactInfo?.company ? `
              <div class="info-item">
                <span class="info-label">Company</span>
                <span class="info-value">${contactInfo.company}</span>
              </div>
              ` : ''}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">
              <span>📝 Form Details</span>
            </div>
            <div class="form-data">
              ${formattedFormData}
            </div>
          </div>
          
          <div class="metadata">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <span>🕐 Submitted: ${submittedAt}</span>
              ${metadata?.ipAddress ? `<span>🌐 IP: ${metadata.ipAddress}</span>` : ''}
              ${metadata?.pageUrl ? `<span>📍 Page: ${metadata.pageUrl}</span>` : ''}
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/admin/forms" class="button">
              View in Admin Dashboard →
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from your website's form system.</p>
          <p>© ${new Date().getFullYear()} LovohCreate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textVersion = `
NEW FORM SUBMISSION: ${formTypeDisplay}
=====================================

CONTACT INFORMATION:
-------------------
Name: ${contactInfo?.name || 'Not provided'}
Email: ${contactInfo?.email || 'Not provided'}
${contactInfo?.phone ? `Phone: ${contactInfo.phone}` : ''}
${contactInfo?.company ? `Company: ${contactInfo.company}` : ''}

FORM DETAILS:
-------------
${Object.entries(formData || {}).map(([key, value]) => {
  const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  if (Array.isArray(value)) {
    return `${formattedKey}: ${value.join(', ')}`;
  }
  return `${formattedKey}: ${value || 'Not provided'}`;
}).join('\n')}

METADATA:
---------
Submitted: ${submittedAt}
${metadata?.ipAddress ? `IP Address: ${metadata.ipAddress}` : ''}
${metadata?.pageUrl ? `Page URL: ${metadata.pageUrl}` : ''}

View in admin dashboard: ${process.env.ADMIN_URL || 'http://localhost:3000'}/admin/forms
`;

  try {
    const { data, error } = await resend.emails.send({
      from: `LovohCreate Forms <${fromEmail}>`,
      to: [adminEmail],
      subject: `📋 ${formTypeDisplay} - New Submission from ${contactInfo?.name || 'Anonymous'}`,
      html: emailHtml,
      text: textVersion,
      replyTo: contactInfo?.email || undefined,
    });

    if (error) {
      console.error('❌ Failed to send form notification email:', error);
      return;
    }

    console.log(`✅ Form notification email sent to ${adminEmail} (ID: ${data?.id})`);
    return data;
  } catch (error) {
    console.error('❌ Error sending form notification email:', error.message);
  }
};

// Send confirmation email to user (optional)
const sendFormConfirmation = async ({ email, name, formType }) => {
  if (!resend) {
    console.log('❌ Resend not configured. Confirmation email skipped.');
    return;
  }

  if (!email) {
    console.log('No email provided for confirmation.');
    return;
  }

  const fromEmail = process.env.FROM_EMAIL || 'noreply@lovohcreate.com';
  const formTypeDisplay = getFormTypeDisplay(formType);
  const formTypeColor = getFormTypeColor(formType);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          line-height: 1.6; 
          color: #1F2937; 
          background: #F3F4F6;
          margin: 0;
          padding: 20px;
        }
        .container { 
          max-width: 550px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 16px; 
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, ${formTypeColor} 0%, ${formTypeColor}dd 100%); 
          color: white; 
          padding: 30px; 
          text-align: center;
        }
        .header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content { 
          padding: 30px; 
          text-align: center;
        }
        .checkmark {
          width: 60px;
          height: 60px;
          background: ${formTypeColor}20;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .checkmark span {
          color: ${formTypeColor};
          font-size: 30px;
        }
        .message {
          margin-bottom: 25px;
          color: #4B5563;
        }
        .footer {
          background: #F9FAFB;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #6B7280;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${formTypeDisplay}</h2>
        </div>
        
        <div class="content">
          <div class="checkmark">
            <span>✓</span>
          </div>
          <h3 style="margin-bottom: 10px;">Thank you, ${name || 'there'}!</h3>
          <p class="message">
            We've received your submission and will get back to you within 24 hours.
          </p>
          <p style="font-size: 14px; color: #6B7280;">
            If you have any urgent questions, feel free to reply to this email.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} LovohCreate. All rights reserved.</p>
          <p>3, Amode Close, Ikeja, Lagos, Nigeria</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `LovohCreate <${fromEmail}>`,
      to: [email],
      subject: `✅ We've received your submission - LovohCreate`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Failed to send confirmation email:', error);
      return;
    }

    console.log(`✅ Confirmation email sent to ${email}`);
    return data;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.message);
  }
};

export {
  sendFormNotification,
  sendFormConfirmation
};