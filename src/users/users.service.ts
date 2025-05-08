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
      phoneNumber: user.phoneNumber || 'No disponible',
      role: user.customClaims?.role || 'user',
      createdAt: user.metadata.creationTime,
    }));
  }

  async getUserById(uid: string) {
    try {
      const user = await this.firebaseService.getAuth().getUser(uid);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || 'No disponible',
        role: user.customClaims?.role || 'user',
        createdAt: user.metadata.creationTime,
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
      // 1. Obtener la información actual del usuario
      const currentUser = await this.firebaseService.getAuth().getUser(uid);
      
      // 2. Crear un objeto de actualización combinando los datos actuales con los nuevos
      const updateData = {
        ...dto  // Solo incluye los campos que vienen en el dto
      };
      
      // 3. Actualizar el usuario con los datos combinados
      await this.firebaseService.getAuth().updateUser(uid, updateData);
      
      return { message: 'Usuario actualizado' };
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
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
