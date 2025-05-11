import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AuthModule } from '../auth/auth.module'; 

@Module({
    imports: [FirebaseModule, AuthModule],
    providers: [StorageService],
    controllers: [StorageController],
})
export class StorageModule { }