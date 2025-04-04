import { UserService } from './../services/user.service';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Auth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from '@angular/fire/auth';
import { UserModel } from '../models/user.model';

interface Error {
  state: boolean,
  text: string
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  error: Error = {
    state: false,
    text: 'Error'
  }

  profileForm = new FormGroup({
    name: new FormControl<string>(''),
    lastname: new FormControl<string>(''),
    age: new FormControl<number | null>(null), // <- Aquí cambia el tipo
    nick: new FormControl<string>(''),
    photoURL: new FormControl<string>(''),
  });

  passForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: any = null;

  showPassword: boolean = false;
  showPassword2: boolean = false;
  showPassword3: boolean = false;
  changePass: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private auth: Auth
  ) {
    this.passForm = this.fb.group({
      lastPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPasswordRep: ['', [Validators.required]]
    });
  }

  async ngOnInit() {
    const user = await this.userService.getUser();
    console.log('user', user);

    this.profileForm.patchValue({
      name: user?.name || '',
      lastname: user?.lastname || '',
      age: user?.age ?? null,
      nick: user?.nick || '',
      photoURL: user?.photoURL || 'assets/img/usuario.webp'
    });

    this.previewUrl = user?.photoURL || 'assets/img/usuario.webp';
  }

  async changePassword() {
    if (this.passForm.invalid) {
      alert('❌ Por favor, completa todos los campos correctamente. Recuerda que la contraseña debe tener al menos 6 carácteres');
      return;
    }

    const { lastPassword, newPassword, newPasswordRep } = this.passForm.value;

    if (newPassword !== newPasswordRep) {
      alert('❌ Las contraseñas no coinciden.');
      return;
    }

    const user = this.auth.currentUser;
    if (!user || !user.email) {
      alert('❌ No hay usuario autenticado.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, lastPassword!);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword!);
      alert('Contraseña actualizada con éxito.');
      this.passForm.reset();
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        alert('❌ La contraseña anterior es incorrecta.');
      } else if (error.code === 'auth/too-many-requests') {
        alert('⚠️ Has intentado demasiadas veces. Inténtalo más tarde.');
      } else {
        alert('❌ Error al cambiar la contraseña: ' + error.message);
      }
    }
  }

  showChangePassword(el: HTMLButtonElement) {
    this.changePass = !this.changePass;
    const icon = el.querySelector('i');
    if (icon) {
      icon.style.transform = this.changePass ? 'rotate(180deg)' : 'rotate(0deg)';
      icon.style.transition = 'transform 0.3s ease';
    }
  }

  togglePassword(value: number = 1) {
    switch (value) {
      case 1:
        this.showPassword = !this.showPassword;
        break;
      case 2:
        this.showPassword2 = !this.showPassword2;
        break;
      case 3:
        this.showPassword3 = !this.showPassword3;
        break;
      default:
        console.error('Ha ocurrido un error');
    }
  }

  openFileInput() {
    document.getElementById('fileInput')?.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    try {
      const userData = this.profileForm.value as Partial<UserModel>;
      await this.userService.updateUserProfile(userData, this.selectedFile);
      alert("✅ Perfil actualizado correctamente");
    } catch (error: any) {
      this.error = {
        state: true,
        text: error.message || 'Ocurrió un error al actualizar el perfil'
      };
    }
  }
}
