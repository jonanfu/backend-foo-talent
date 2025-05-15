import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { BullModule } from '@nestjs/bull';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { TemplateService } from './template.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    FirebaseModule
  ],
  providers: [NotificationService, EmailService, EmailProcessor, TemplateService],
  controllers: [NotificationController, EmailController],
  exports: [NotificationService],
})
export class NotificationModule {}
