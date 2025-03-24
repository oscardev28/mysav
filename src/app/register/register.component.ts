import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserRegisterModel } from '../models/user.model';

@Component({
  imports: [FormsModule, CommonModule],
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  public user: UserRegisterModel = {
    name: '',
    lastname: '',
    nick: '',
    email: '',
    password: '',
    age: null,
    photoURL: ''
  };

  public errorMessage: string = '';
  public showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: any) {
    this.errorMessage = '';

    try {
      await this.authService.register(this.user);
      console.log('Usuario registrado correctamente');

      const userCredential = await this.authService.login(this.user.email, this.user.password);

      if (userCredential) {
        console.log('Usuario logueado correctamente');
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      this.errorMessage = this.getErrorMessage(error.code);
    }
  }

  getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'El correo ya está en uso.';
      case 'auth/invalid-email':
        return 'El formato del correo es inválido.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      default:
        return 'Ha ocurrido un error. Inténtalo de nuevo.';
    }
  }
}
