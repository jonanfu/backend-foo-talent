import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { EmailDto } from './dto/email.dto';
import { PushDto } from './dto/push.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('email')
  @ApiOperation({ summary: 'Enviar un correo electrónico' })
  @ApiResponse({ status: 201, description: 'Correo enviado con éxito' })
  async sendEmail(@Body() emailDto: EmailDto) {
    await this.notificationService.sendEmail(emailDto);
    return { message: 'Correo enviado con éxito' };
  }

  @Post('push')
  @ApiOperation({ summary: 'Enviar una notificación push' })
  @ApiResponse({ status: 201, description: 'Notificación push enviada' })
  async sendPush(@Body() pushDto: PushDto) {
    await this.notificationService.sendPushNotification(pushDto);
    return { message: 'Notificación push enviada' };
  }
}
