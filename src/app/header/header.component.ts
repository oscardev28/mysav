import { AuthService } from './../services/auth.service';
import { Component } from '@angular/core';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('slideInOut', [
      state('hidden', style({ transform: 'translateX(100%)', opacity: 0 })), // Oculto a la derecha
      state('visible', style({ transform: 'translateX(0)', opacity: 1 })), // Visible
      transition('hidden => visible', animate('300ms ease-in-out')),
      transition('visible => hidden', animate('200ms ease-in-out'))
    ])
  ]
})
export class HeaderComponent {
  user: User | null = null;
  menuOpen = false; // Estado del menú

  constructor(private auth: Auth, private authService: AuthService) {}

  ngOnInit() {
    // Escuchar cambios en la autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      console.log('Usuario autenticado:', this.user);
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
    this.menuOpen = false; // Cierra el menú después de cerrar sesión
  }
}
