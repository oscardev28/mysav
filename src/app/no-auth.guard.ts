import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          this.router.navigate(['/inicio']); // Si está autenticado, redirige a /inicio
          observer.next(false);
        } else {
          observer.next(true); // Si no está autenticado, permite el acceso
        }
        observer.complete();
      });
    });
  }
}
