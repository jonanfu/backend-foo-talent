import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailDto } from './dto/email.dto';
import { PushDto } from './dto/push.dto';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service'; 

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendEmail(emailDto: EmailDto) {
    const { to, subject, text, html } = emailDto;
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Correo enviado a ${to}`);
    } catch (error) {
      this.logger.error('Error enviando correo:', error.message);
      throw error;
    }
  }

  async sendPushNotification(pushDto: PushDto) {
    const { token, title, body, data } = pushDto;
    try {
      await this.firebaseService.getMessaging().send({
        token,
        notification: { title, body },
        data,
      });
      this.logger.log(`Push enviado a ${token}`);
    } catch (error) {
      this.logger.error('Error enviando push notification:', error.message);
      throw error;
    }
  }
}
