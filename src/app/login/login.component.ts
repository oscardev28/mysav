import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, CommonModule], // Usamos Reactive Forms
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;  // Usamos FormGroup para manejar los datos
  error: any = {
    text: '',
    state: false
  };
  showPassword: boolean = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value; // Extrae los valores del formulario

    try {
      await this.authService.login(email, password);
      console.log('Usuario autenticado correctamente');
      this.router.navigate(['/']); // Redirigir después de un login exitoso
      this.error = {
        state: false,
        text: ''
      }
    } catch (error) {
      this.error = {
        text: 'Tus datos de inicio de sesión no son correctos',
        state: true
      }
      console.error('Error al iniciar sesión:', error);
    }
  }
}
