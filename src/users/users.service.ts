// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class UsersService {
  constructor(private firebaseService: FirebaseService) { }

  async listUsers(limit = 1000) {
    const list = await this.firebaseService.getAuth().listUsers(limit);
    const defaultAvatar = await this.getCachedDefaultAvatarUrl();

    return list.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber || 'No disponible',
      photoURL: user.photoURL || defaultAvatar,
      role: user.customClaims?.role || 'user',
      createdAt: user.metadata.creationTime,
      disabled: user.disabled || false,
    }));
  }

  async getUserById(uid: string) {
    try {
      const user = await this.firebaseService.getAuth().getUser(uid);
      const defaultAvatar = await this.getCachedDefaultAvatarUrl();

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || 'No disponible',
        photoURL: user.photoURL || defaultAvatar,
        role: user.customClaims?.role || 'user',
        createdAt: user.metadata.creationTime,
        disabled: user.disabled || false,
      };
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async updateUserRole(uid: string, dto: UpdateUserRoleDto) {
    await this.firebaseService
      .getAuth()
      .setCustomUserClaims(uid, { role: dto.role });
    return { message: `Rol actualizado a ${dto.role}` };
  }

  async updateUser(uid: string, dto: UpdateUserDto) {
    try {
      // Validar photoURL si viene en el DTO
      if (dto.photoUrl && !this.isValidHttpUrl(dto.photoUrl)) {
        throw new BadRequestException('La URL de la foto no es válida');
      }

      // Actualizar en Authentication
      await this.firebaseService.getAuth().updateUser(uid, {
        email: dto.email,
        displayName: dto.displayName,
        phoneNumber: dto.phoneNumber,
        photoURL: dto.photoUrl,
        disabled: dto.disabled,
      });

      // Actualizar en Firestore 
      const db = this.firebaseService.getFirestore();
      await db.collection('users').doc(uid).update({
        ...dto,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: 'Usuario actualizado correctamente',
        uid
      };
    } catch (error) {
      throw new BadRequestException(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async deleteUser(uid: string) {
    try {
      // Opcional: Eliminar la foto de Storage si es una URL personalizada
      // await this.deleteUserPhotoIfCustom(uid);

      await this.firebaseService.getAuth().deleteUser(uid);

      // Opcional: Eliminar datos de Firestore
      const db = this.firebaseService.getFirestore();
      await db.collection('users').doc(uid).delete();

      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      throw new BadRequestException(`Error al eliminar usuario: ${error.message}`);
    }
  }

  async disableUser(uid: string) {
    await this.firebaseService.getAuth().updateUser(uid, { disabled: true });
    return { message: 'Usuario deshabilitado' };
  }

  async enableUser(uid: string) {
    await this.firebaseService.getAuth().updateUser(uid, { disabled: false });
    return { message: 'Usuario habilitado' };
  }

  async updatePassword(uid: string, newPassword: string) {
    await this.firebaseService.getAuth().updateUser(uid, {
      password: newPassword,
    });
    return { message: 'Contraseña actualizada', uid };
  }

  // --- Métodos auxiliares ---
  private isValidHttpUrl(url: string): boolean {
    try {
      const newUrl = new URL(url);
      return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (err) {
      return false;
    }
  }

  private async deleteUserPhotoIfCustom(uid: string): Promise<void> {
    try {
      const user = await this.getUserById(uid);
      if (user.photoURL && !user.photoURL.includes('default-avatars')) {
        const photoPath = this.extractPathFromUrl(user.photoURL);
        if (photoPath) {
          await this.firebaseService.getBucket().file(photoPath).delete();
        }
      }
    } catch (error) {
      console.error('Error al eliminar foto personalizada:', error);
    }
  }

  private extractPathFromUrl(url: string): string | null {
    const matches = url.match(/storage\.googleapis\.com\/[^\/]+\/(.+)/);
    return matches ? matches[1] : null;
  }
  private defaultAvatarUrl: string | null = null;

  private async getCachedDefaultAvatarUrl(): Promise<string> {
    if (!this.defaultAvatarUrl) {
      const bucket = this.firebaseService.getBucket();
      const file = bucket.file('default-avatars/default-avatar.png');
      const [url] = await file.getSignedUrl({ action: 'read', expires: '03-09-2030' });
      this.defaultAvatarUrl = url;
    }
    return this.defaultAvatarUrl;
  }

}