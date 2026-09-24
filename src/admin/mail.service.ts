import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  async sendVerificationCode(
    recipient: string,
    code: string,
    purpose: 'password change' | 'password reset',
  ): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<string>('SMTP_PORT');
    const username = this.config.get<string>('SMTP_USER');
    const password = this.config.get<string>('SMTP_PASSWORD');
    const from = this.config.get<string>('MAIL_FROM');

    if (!host || !port || !username || !password || !from) {
      throw new ServiceUnavailableException('Email delivery is not configured');
    }

    const smtpPassword =
      host === 'smtp.gmail.com' ? password.replace(/\s/g, '') : password;

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: this.config.get('SMTP_SECURE', 'true') === 'true',
      auth: { user: username, pass: smtpPassword },
    });

    await transporter.sendMail({
      from,
      to: recipient,
      subject: `Admin password ${purpose}`,
      text: `Your verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    });
  }
}
