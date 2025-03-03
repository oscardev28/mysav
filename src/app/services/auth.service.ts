import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, User, onAuthStateChanged, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { UserModel } from '../models/user';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user); // Actualiza el estado del usuario
    });
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  getCurrentUser() {
    return this.userSubject.value;
  }

  async register(user: UserModel) {
    // Primero se crea el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(this.auth, user.email, user.password);

    // Después se guarda el usuario en Firestore
    const userRef = doc(this.firestore, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      name: user.name,
      lastname: user.lastname,
      nick: user.nick,
      email: user.email
    });

    return userCredential;
  }

  async logout() {
    return signOut(this.auth);
  }
}
