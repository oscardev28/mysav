import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { UserModel } from '../models/user';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importa Router

@Component({
  imports: [FormsModule, CommonModule],
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {
  public user: UserModel = new UserModel('', '', '', '', '');
  public errorMessage: string = '';
  public showPassword: boolean = false;

  constructor(private authService: AuthService,  private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: any) {
    this.errorMessage = ''; // Resetea el mensaje de error
    try {
      await this.authService.register(this.user);
      console.log('Usuario registrado correctamente');
      // Intentar iniciar sesión después del registro
      const userCredential = await this.authService.login(this.user.email, this.user.password);

      if (userCredential) {
        console.log('Usuario logueado correctamente');
        this.router.navigate(['/']); // Redirigir solo si el login es exitoso
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      this.errorMessage = this.getErrorMessage(error.code); // Captura el mensaje de error
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
