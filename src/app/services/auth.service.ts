import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { UserModel, UserRegisterModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<UserModel | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userData = await this.getUserFromFirestore(user.uid);
        this.userSubject.next(userData);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const userData = await this.getUserFromFirestore(userCredential.user.uid);
    this.userSubject.next(userData);
    return userCredential;
  }

  getCurrentUser(): UserModel | null {
    return this.userSubject.value;
  }

  async register(user: UserRegisterModel) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, user.email, user.password);
    const userRef = doc(this.firestore, 'users', userCredential.user.uid);

    // 🔹 Guardar el usuario en Firestore (sin password)
    const userData: UserModel = {
      name: user.name,
      lastname: user.lastname,
      nick: user.nick,
      email: user.email,
      age: user.age,
      photoURL: user.photoURL || 'assets/img/usuario.webp'
    };

    await setDoc(userRef, userData);
    this.userSubject.next(userData);

    return userCredential;
  }

  async logout() {
    await signOut(this.auth);
    this.userSubject.next(null);
  }

  private async getUserFromFirestore(uid: string): Promise<UserModel | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserModel;
    }
    return null;
  }
}
