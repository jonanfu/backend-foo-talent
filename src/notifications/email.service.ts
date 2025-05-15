import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async sendEmail(data: EmailDto): Promise<void> {
    await this.emailQueue.add('send', data, {
      attempts: 3, // Reintentos en caso de fallo
      backoff: {
        type: 'exponential',
        delay: 1000, // Tiempo de espera inicial entre reintentos
      },
    });
  }
  
  async getQueueInfo() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
    ]);
    
    return {
      waiting,
      active,
      completed,
      failed,
    };
  }
}