import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { ApplicationModule } from './applications/application.module';
import { NotificationModule } from './notifications/notification.module';
import { RecluitmentModule } from './recruitments/recruitment.module';
import { TokenModule } from './tokens/token.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT') || '6380', 10),
          password: configService.get('REDIS_PASSWORD'),
          tls: {
            // Azure Redis requiere conexión TLS
            servername: configService.get('REDIS_HOST')
          }
        }
      }),
      inject: [ConfigService],
    }),
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
