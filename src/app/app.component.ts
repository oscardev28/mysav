import { ModalService } from './services/modal.service';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { LoaderComponent } from './loader/loader.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, LoaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'mysav';
  modalVisible: boolean = false;

  constructor() {}

}
