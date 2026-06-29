import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Basic setup, in a real app these come from ConfigService
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
    addedByName: string | null,
    roleName: string | null,
    temporaryPassword?: string,
  ) {
    const creatorText = addedByName ? `added by ${addedByName}` : 'added by an administrator';
    const roleText = roleName ? ` with the role of ${roleName}` : '';
    
    let text = `Hello ${name},\n\nYou have been ${creatorText} ${roleText} to the TripUp platform.\n`;
    
    if (temporaryPassword) {
      text += `Your temporary password is: ${temporaryPassword}\n`;
      text += `Please log in and change it immediately.\n`;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Welcome to TripUp!',
        text,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    // In a real app, this would be a link to the frontend
    const resetLink = `${process.env.FRONTEND_URL}/profile/reset-password?token=${resetToken}`;
    
    const text = `Hello,\n\nYou requested a password reset.\nClick here to reset it: ${resetLink}\nIf you didn't request this, ignore this email.`;

    try {
      await this.transporter.sendMail({
        from: '"TripUp Admin" <no-reply@tripup.com>',
        to,
        subject: 'Password Reset Request',
        text,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
    }
  }
}
