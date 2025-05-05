// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private firebaseService: FirebaseService) {}
  async listUsers(limit = 1000) {
    const list = await this.firebaseService.getAuth().listUsers(limit);
    return list.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.customClaims?.role || 'user',
    }));
  }

  async getUserById(uid: string) {
    try {
      const user = await this.firebaseService.getAuth().getUser(uid);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.customClaims?.role || 'user',
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
    await this.firebaseService.getAuth().updateUser(uid, dto);
    return { message: 'Usuario actualizado' };
  }

  async deleteUser(uid: string) {
    await this.firebaseService.getAuth().deleteUser(uid);
    return { message: 'Usuario eliminado' };
  }

  async disableUser(uid: string) {
    const auth = this.firebaseService.getAuth();
    return auth.updateUser(uid, { disabled: true });
  }
  
  async enableUser(uid: string) {
    const auth = this.firebaseService.getAuth();
    return auth.updateUser(uid, { disabled: false });
  }

  async updatePassword(uid: string, newPassword: string) {
    const user = await this.firebaseService.getAuth().updateUser(uid, {
      password: newPassword,
    });

    return { message: 'Contraseña actualizada', uid: user.uid };
  }

}
