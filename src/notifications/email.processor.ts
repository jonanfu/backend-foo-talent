import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import { EmailDto } from './dto/email.dto';
import { ConfigService } from '@nestjs/config';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService
  ) {
    // Configura tu transporter de nodemailer
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER') || 'user@example.com',
        pass: this.configService.get<string>('EMAIL_PASS') || 'password',
      },
    });
  }

  @Process('send')
  async handleSendEmail(job: Job<EmailDto>) {
    this.logger.log(`Procesando email job ${job.id}`);
    
    try {
      const { to, subject, text, html } = job.data;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to,
        subject,
        text,
        html,
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado: ${info.messageId}`);
      
      return info;
    } catch (error) {
      this.logger.error(`Error al enviar email: ${error.message}`, error.stack);
      throw error; // Esto activará los reintentos configurados
    }
  }
}