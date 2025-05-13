import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { VacanciesModule } from 'src/vacancies/vacancies.module';

@Module({
  imports: [FirebaseModule, VacanciesModule],
  controllers: [ApplicationController],
  providers: [ApplicationService]
})
export class ApplicationModule {}
