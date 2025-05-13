import { FirebaseModule } from "src/firebase/firebase.module";
import { RecluitmentController } from "./recruitment.controller";
import { RecluitmentService } from "./recruitment.service";
import { Module } from "@nestjs/common";
import { PineconeService } from "./pinecone.service";

@Module({
    imports: [FirebaseModule],
    providers: [RecluitmentService, PineconeService],
    controllers: [RecluitmentController]
  })

export class RecluitmentModule {}