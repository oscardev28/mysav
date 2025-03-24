import { Injectable } from '@angular/core';
import { Auth, updateProfile, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { UserModel } from '../models/user.model'; // Importamos el modelo de usuario

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private auth: Auth, private firestore: Firestore, private storage: Storage) {}

  // ✅ Obtener usuario actual de Firestore y mapearlo a UserModel
  async getUser(): Promise<UserModel | null> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) return null; // Si no existe en Firestore

    const userData = userSnap.data() as UserModel;
    userData.photoURL = userData.photoURL || user.photoURL || 'assets/img/usuario.webp';

    console.log('User data:', userData);
    return userData;
  }

  // ✅ Crear o actualizar perfil de usuario
    // 👇 Solo cambiamos la firma para aceptar campos parciales
  async updateUserProfile(userData: Partial<UserModel>, file?: File | null): Promise<Partial<UserModel>> {
    if (!this.auth.currentUser) throw new Error("No hay usuario autenticado");

    const user = this.auth.currentUser;
    let photoURL = userData.photoURL || user.photoURL || '';

    // 🔹 Si hay una imagen nueva, subirla a Firebase Storage
    if (file) {
      const storageRef = ref(this.storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef);
    }

    // 🔹 Actualizar en Firebase Auth solo si hay nombre o apellido
    const displayName =
      `${userData.name || ''} ${userData.lastname || ''}`.trim();

    await updateProfile(user, {
      displayName: displayName || user.displayName || '',
      photoURL
    });

    // 🔹 Guardar en Firestore
    const userDocRef = doc(this.firestore, 'users', user.uid);
    await setDoc(userDocRef, {
      ...userData,
      photoURL
    }, { merge: true }); // merge true mantiene el resto de campos

    return { ...userData, photoURL };
  }

}
