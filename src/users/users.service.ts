// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
      if (dto.photoUrl && !this.isValidHttpUrl(dto.photoUrl)) {
        throw new BadRequestException('La URL de la foto no es válida');
      }

      const updateData: Record<string, any> = {};

      if (dto.email !== undefined) updateData.email = dto.email;
      if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
      if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber;
      if (dto.photoUrl !== undefined) updateData.photoURL = dto.photoUrl;
      if (dto.disabled !== undefined) updateData.disabled = dto.disabled;

      await this.firebaseService.getAuth().updateUser(uid, updateData);

      return {
        success: true,
        message: 'Usuario actualizado correctamente',
        updatedFields: Object.keys(updateData)
      };

    } catch (error) {
      throw new BadRequestException(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async deleteUser(uid: string) {
    try {

      await this.firebaseService.getAuth().deleteUser(uid);

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
      try {
        const bucket = this.firebaseService.getBucket();
        const file = bucket.file('default-avatars/default-avatar.png');

        const [exists] = await file.exists();

        if (exists) {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2030'
          });

          this.defaultAvatarUrl = url;
        } else {
          this.defaultAvatarUrl = 'https://via.placeholder.com/150';
        }

      } catch (error) {
        console.error('Error obteniendo avatar predeterminado:', error);
        this.defaultAvatarUrl = 'https://via.placeholder.com/150';
      }
    }
    return this.defaultAvatarUrl;
  }

}