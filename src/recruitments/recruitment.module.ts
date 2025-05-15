import { FirebaseModule } from "src/firebase/firebase.module";
import { RecluitmentController } from "./recruitment.controller";
import { RecluitmentService } from "./recruitment.service";
import { Module } from "@nestjs/common";
import { PineconeService } from "./pinecone.service";
import { NotificationModule } from "src/notifications/notification.module";
import { VacanciesModule } from "src/vacancies/vacancies.module";

@Module({
    imports: [FirebaseModule, NotificationModule, VacanciesModule],
    providers: [RecluitmentService, PineconeService],
    controllers: [RecluitmentController]
  })

export class RecluitmentModule {}