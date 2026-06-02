import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });

  static async sendEmail(to: string, subject: string, html: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(`⚠️ [Email Service] SMTP credentials not set. Simulated email to: ${to}`);
      console.log(`[Subject]: ${subject}`);
      console.log(`[Content]:\n${html.replace(/<[^>]*>/g, '').substring(0, 300).trim()}...\n`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"BingeLog Tracker" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
      console.log(`✉️ [Email Service] Email sent successfully to ${to}`);
    } catch (err) {
      console.error(`❌ [Email Service] Failed to send email to ${to}:`, err);
    }
  }

  static async sendReleaseNotification(to: string, username: string, title: string, chapter: number, link: string) {
    const subject = `🎉 New Chapter Released: ${title} - Chapter ${chapter}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">New Chapter Alert!</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>A new chapter has been released for a series on your watchlist:</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <h3 style="margin: 0 0 5px 0; color: #0f172a;">${title}</h3>
          <p style="margin: 0; color: #475569; font-weight: bold;">Chapter ${chapter}</p>
        </div>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${link}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Read Chapter Now</a>
        </p>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          This is an automated notification from your Universal Media Tracker / BingeLog.
        </p>
      </div>
    `;
    await this.sendEmail(to, subject, html);
  }

  static async sendWeeklyReport(to: string, username: string, watchHours: number, readHours: number, totalHours: number, stats: any[]) {
    const subject = `📊 Your Weekly BingeLog Tracker Analytics Report`;
    
    let statsTable = '';
    stats.forEach(item => {
      statsTable += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #0f172a; font-weight: 500;">${item.title}</td>
          <td style="padding: 10px 0; text-align: center; color: #475569;">${item.type}</td>
          <td style="padding: 10px 0; text-align: right; color: #6366f1; font-weight: bold;">+${item.amountAdded}</td>
        </tr>
      `;
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: white;">
        <h2 style="color: #6366f1; text-align: center; margin-top: 0;">Weekly Analytics Report</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>Here is your weekly summary of watch and read time added to BingeLog:</p>
        
        <div style="display: flex; justify-content: space-between; margin: 25px 0; gap: 15px;">
          <div style="flex: 1; background: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 10px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">WATCH TIME</p>
            <h2 style="margin: 5px 0 0 0; color: #6366f1;">${watchHours} hrs</h2>
          </div>
          <div style="flex: 1; background: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 10px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">READ TIME</p>
            <h2 style="margin: 5px 0 0 0; color: #10b981;">${readHours} hrs</h2>
          </div>
          <div style="flex: 1; background: #eef2ff; border: 1px solid #e0e7ff; padding: 15px; border-radius: 10px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #4f46e5; font-weight: bold; text-transform: uppercase;">TOTAL TIME</p>
            <h2 style="margin: 5px 0 0 0; color: #4f46e5;">${totalHours} hrs</h2>
          </div>
        </div>

        <h3 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 30px;">Activity Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="color: #94a3b8; text-transform: uppercase; font-size: 10px; text-align: left; border-bottom: 2px solid #f1f5f9;">
              <th style="padding-bottom: 8px; font-weight: bold;">Media Title</th>
              <th style="padding-bottom: 8px; text-align: center; font-weight: bold;">Type</th>
              <th style="padding-bottom: 8px; text-align: right; font-weight: bold;">Added</th>
            </tr>
          </thead>
          <tbody>
            ${statsTable.length > 0 ? statsTable : '<tr><td colspan="3" style="padding: 10px 0; text-align: center; color: #94a3b8;">No activity tracked this week</td></tr>'}
          </tbody>
        </table>

        <p style="font-size: 11px; color: #94a3b8; margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          Thank you for using BingeLog to manage your media ledger! Keep tracking to stay in sync.
        </p>
      </div>
    `;
    await this.sendEmail(to, subject, html);
  }
}
