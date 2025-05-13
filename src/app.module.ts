import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { ApplicationModule } from './applications/application.module';
import { NotificationModule } from './notifications/notification.module';
import { RecluitmentModule } from './recruitments/recruitment.module';
import { TokenModule } from './tokens/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    RecluitmentModule,
    TokenModule,
    AuthModule, 
    UsersModule, 
    FirebaseModule,
    VacanciesModule,
    ApplicationModule,
    NotificationModule

  ],
})
export class AppModule {}
