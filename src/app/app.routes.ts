import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { InicioComponent } from './inicio/inicio.component';
import { AuthGuard } from './auth.guard';
import { NoAuthGuard } from './no-auth.guard'; // Evita que usuarios logueados accedan a login/register
import { PlanComponent } from './plan/plan.component';
import { ProfileComponent } from './profile/profile.component';
import { CalculateComponent } from './calculate/calculate.component';

export const routes: Routes = [
  {path: '', component: HomeComponent, canActivate: [NoAuthGuard]},
  {path: 'home', component: HomeComponent, canActivate: [NoAuthGuard]},
  {path: 'login', component: LoginComponent, canActivate: [NoAuthGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard]},
  {path: 'inicio', component: InicioComponent, canActivate: [AuthGuard]},
  {path: 'plan', component: PlanComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'calculate', component: CalculateComponent, canActivate: [AuthGuard]},
];

