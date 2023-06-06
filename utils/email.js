import { createTransport } from 'nodemailer';
import { catchAsync } from './catchAsync.js';
import pug from 'pug';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import htmlToText from 'html-to-text';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Hariharan <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    return createTransport({
      service: 'SendinBlue',

      auth: {
        user: process.env.SENDIN_BLUE_LOGIN_NAME,
        pass: process.env.SENDIN_BLUE_API_KEY
      }
      // Configure the email transport options (SMTP, SendGrid, etc.)
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}

export { Email };
