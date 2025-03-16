import { Injectable } from '@angular/core';
import { Auth, updateProfile, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private auth: Auth, private firestore: Firestore, private storage: Storage) {}

  // Obtener usuario actual
  async getUser(): Promise<any | null> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data();

    if (userData && !userData['photoURL']) {
      userData['photoURL'] = user.photoURL || 'assets/img/usuario.webp';
    }

    console.log('user data', userData)

    return userData;
  }

  // Actualizar perfil en Firebase Auth y Firestore
  async updateUserProfile(userData: any, file?: File | null) {
    if (!this.auth.currentUser) throw new Error("No hay usuario autenticado");

    const user = this.auth.currentUser;
    let photoURL = user.photoURL || '';

    // Si hay un archivo, lo subimos a Firebase Storage
    if (file) {
      const storageRef = ref(this.storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef); // Obtenemos la URL de la imagen
    }

    // Actualizar perfil en Firebase Authentication
    await updateProfile(user, {
      displayName: `${userData.name} ${userData.lastname}`,
      photoURL
    });

    // Actualizar datos en Firestore
    const userDocRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userDocRef, {
      name: userData.name,
      lastname: userData.lastname,
      nick: userData.nick,
      age: userData.age,
      photoURL
    });

    return { ...userData, photoURL };
  }
}
