import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { ProductModule } from './product/product.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    AuthModule, 
    UsersModule, 
    ProductModule, 
    FirebaseModule,
  ],
})
export class AppModule {}
