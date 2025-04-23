import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    AuthModule, 
    UsersModule, 
    FirebaseModule,
    ProductModule,
    VacanciesModule,
  ],
})
export class AppModule {}
