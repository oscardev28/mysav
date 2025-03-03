import { UserService } from './../services/user.service';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

interface Error {
  state: boolean,
  text: string
}

@Component({
  selector: 'app-profile',
  imports: [ ReactiveFormsModule, CommonModule ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent {
  error: Error = {
    state: false,
    text: 'Error'
  }
  profileForm = new FormGroup({
    name: new FormControl(''),
    lastname: new FormControl(''),
    age: new FormControl(''),
    nick: new FormControl(''),
    photoURL: new FormControl('')
  });
  selectedFile: File | null = null;
  previewUrl: any = null; // Para la previsualización de la imagen
  showPassword: boolean = false;

  constructor(private userService: UserService) {

  }

  async ngOnInit() {
    let user = await this.userService.getUser();

    this.profileForm.patchValue({
      name: user?.name,
      lastname: user?.lastname,
      age: user?.age,
      nick: user?.nick,
      photoURL: user.photoURL || 'assets/default-avatar.png'
    });

    console.log(this.profileForm.value.photoURL)
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  openFileInput() {
    document.getElementById('fileInput')?.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Previsualizar la imagen antes de subirla
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    console.warn(this.profileForm.value);
    try {
      const userData = this.profileForm.value;
      await this.userService.updateUserProfile(userData, this.selectedFile);
      alert("Perfil actualizado correctamente");
    } catch (error: any) {
      this.error = error.message;
    }
  }
}
