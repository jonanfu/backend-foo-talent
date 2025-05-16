import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UsersModule } from 'src/users/users.module';
import { VacanciesAdminController } from './vacancies.admin.controller';

@Module({
  imports: [FirebaseModule, UsersModule],
  exports: [VacanciesService],
  controllers: [VacanciesController, VacanciesAdminController],
  providers: [VacanciesService]
})
export class VacanciesModule { }
