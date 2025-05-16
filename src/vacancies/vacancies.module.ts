import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [FirebaseModule, UsersModule],
  exports: [VacanciesService],
  controllers: [VacanciesController],
  providers: [VacanciesService]
})
export class VacanciesModule { }
