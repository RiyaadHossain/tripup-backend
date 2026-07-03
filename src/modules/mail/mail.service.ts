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
    const creatorText = addedByName ? `added by <strong>${addedByName}</strong>` : 'added by an administrator';
    const roleText = roleName ? ` with the role of <strong>${roleName}</strong>` : '';
    
    const adminUrl = 'https://admin-tripup-studio.lovable.app/login';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #2563eb; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to TripUp!</h1>
        </div>
        <div style="padding: 32px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333333; margin-top: 0;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">You have been ${creatorText}${roleText} to the TripUp Admin platform.</p>
          
          ${temporaryPassword ? `
          <div style="background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Your Login Credentials</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #111827;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 0; font-size: 16px; color: #111827;"><strong>Password:</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</span></p>
          </div>
          <p style="font-size: 14px; color: #dc2626; margin-bottom: 24px;">⚠️ Please log in and change your password immediately.</p>
          ` : ''}
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${adminUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">Go to Admin Panel</a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 32px; text-align: center;">Or copy this link into your browser: <br><a href="${adminUrl}" style="color: #2563eb; text-decoration: none;">${adminUrl}</a></p>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} TripUp. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Welcome to TripUp!',
        html,
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    // In a real app, this would be a link to the frontend
    const resetLink = `${process.env.FRONTEND_URL}/profile/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #2563eb; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        <div style="padding: 32px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333333; margin-top: 0;">Hello,</p>
          <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">We received a request to reset your password for the TripUp Admin platform.</p>
          
          <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
            <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center;">Or copy this link into your browser: <br><a href="${resetLink}" style="color: #2563eb; text-decoration: none;">${resetLink}</a></p>
          
          <p style="font-size: 14px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px;">If you didn't request this password reset, you can safely ignore this email.</p>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} TripUp. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Password Reset Request',
        html,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
    }
  }
}
