import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailDto } from './dto/email.dto';
import { PushDto } from './dto/push.dto';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service'; 
import { EmailService } from './email.service';
import { TemplateService } from './template.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService
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

  async sendRejectionEmail(email: string, vacancyTitle: string): Promise<void> {
    try {
      // Renderizar la plantilla con los datos necesarios
      const html = await this.templateService.renderTemplate('rejection', {
        title: `Estado de tu postulación a ${vacancyTitle}`,
        header: 'Estado de tu postulación',
        message1: `Lamentamos informarte que después de revisar tu aplicación para ${vacancyTitle}, no podremos avanzar con tu candidatura en esta ocasión.`,
        message2: 'Agradecemos tu interés y te animamos a aplicar a otras vacantes que publiquemos en el futuro.',
        showButton: true,
        buttonText: 'Ver otras oportunidades',
        buttonLink: 'https://tuempresa.com/carreras',
        year: new Date().getFullYear()
      });

      // Enviar el correo a través del servicio
      await this.emailService.sendEmail({
        to: email,
        subject: `Actualización sobre ${vacancyTitle}`,
        html
      });
    } catch (error) {
      console.error(`Error al enviar correo de rechazo a ${email}:`, error);
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
