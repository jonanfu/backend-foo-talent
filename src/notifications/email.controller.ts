import { Controller, Post, Body, Get } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailDto } from './dto/email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() emailData: EmailDto) {
    await this.emailService.sendEmail(emailData);
    return { message: 'Email encolado correctamente' };
  }
  
  @Get('queue-status')
  async getQueueStatus() {
    return this.emailService.getQueueInfo();
  }
}