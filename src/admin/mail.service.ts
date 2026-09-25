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
    await this.sendEmail(
      recipient,
      `Admin password ${purpose}`,
      `Your verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    );
  }

  async sendContactConfirmation(
    recipient: string,
    name: string,
  ): Promise<void> {
    const safeName = this.escapeHtml(name);
    await this.sendEmail(
      recipient,
      'We received your message',
      `Hi ${name},\n\nThanks for contacting me. Your message was received, and I will get back to you soon.\n\nTalha Shahid Khan`,
      `<div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;color:#202820;line-height:1.6"><p style="margin:0 0 20px;color:#54713b;font-size:13px;font-weight:bold">MESSAGE RECEIVED</p><h1 style="margin:0 0 16px;font-size:24px">Thanks, ${safeName}</h1><p style="margin:0">Your message was received. I will get back to you soon.</p><p style="margin:28px 0 0;color:#59635b">Talha Shahid Khan</p></div>`,
    );
  }

  async sendServiceRequestConfirmation(
    recipient: string,
    request: {
      name: string;
      service: {
        title: string;
        category: string;
        description: string;
        price: string;
        deliveryDays: number;
        revisions: number;
        features: string[];
      };
      package?: {
        name: string;
        description: string | null;
        price: string;
        deliveryDays: number;
        revisions: number;
        features: string[];
      };
      message?: string;
      additionalRequirements: string[];
    },
  ): Promise<void> {
    const safeName = this.escapeHtml(request.name);
    const selectedOffer = request.package ?? request.service;
    const rows: [string, string][] = [
      ['Service', request.service.title],
      ['Category', request.service.category],
      ['Details', request.service.description],
      ['Price (as listed)', selectedOffer.price],
      ['Delivery', `${selectedOffer.deliveryDays} days`],
      ['Revisions', String(selectedOffer.revisions)],
      ['Features', selectedOffer.features.join(', ') || 'Not specified'],
    ];

    if (request.package) {
      rows.splice(1, 0, ['Package', request.package.name]);
      if (request.package.description) {
        rows.splice(3, 0, ['Package details', request.package.description]);
      }
    }

    const detailRows = rows
      .map(
        ([label, value]) =>
          `<tr><th style="padding:8px 12px 8px 0;text-align:left;vertical-align:top;color:#59635b;font-weight:normal">${this.escapeHtml(label)}</th><td style="padding:8px 0;vertical-align:top">${this.escapeHtml(value)}</td></tr>`,
      )
      .join('');
    const extraDetails = [
      request.message
        ? `<p style="margin:20px 0 0"><strong>Your message</strong><br>${this.escapeHtml(request.message).replace(/\n/g, '<br>')}</p>`
        : '',
      request.additionalRequirements.length
        ? `<p style="margin:16px 0 0"><strong>Additional requirements</strong><br>${request.additionalRequirements.map((item) => this.escapeHtml(item)).join('<br>')}</p>`
        : '',
    ].join('');
    const textLines = [
      `Hi ${request.name},`,
      '',
      'Your service request was received. I will review it and get back to you soon.',
      '',
      `Service: ${request.service.title}`,
      `Category: ${request.service.category}`,
      `Details: ${request.service.description}`,
      ...(request.package ? [`Package: ${request.package.name}`] : []),
      `Price (as listed): ${selectedOffer.price}`,
      `Delivery: ${selectedOffer.deliveryDays} days`,
      `Revisions: ${selectedOffer.revisions}`,
      `Features: ${selectedOffer.features.join(', ') || 'Not specified'}`,
      ...(request.message ? ['', `Your message: ${request.message}`] : []),
      ...(request.additionalRequirements.length
        ? [
            '',
            `Additional requirements: ${request.additionalRequirements.join(', ')}`,
          ]
        : []),
      '',
      'Talha Shahid Khan',
    ];

    await this.sendEmail(
      recipient,
      'We received your service request',
      textLines.join('\n'),
      `<div style="max-width:600px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;color:#202820;line-height:1.6"><p style="margin:0 0 20px;color:#54713b;font-size:13px;font-weight:bold">REQUEST RECEIVED</p><h1 style="margin:0 0 16px;font-size:24px">Thanks, ${safeName}</h1><p style="margin:0 0 24px">Your service request was received. I will review it and get back to you soon.</p><table style="width:100%;border-collapse:collapse">${detailRows}</table>${extraDetails}<p style="margin:28px 0 0;color:#59635b">Talha Shahid Khan</p></div>`,
    );
  }

  private async sendEmail(
    recipient: string,
    subject: string,
    text: string,
    html?: string,
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
      subject,
      text,
      html,
    });
  }

  private escapeHtml(value: string): string {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return value.replace(/[&<>"']/g, (character) => entities[character]);
  }
}
