// src/app/shared/loader/loader.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loaderService.loading$ | async" class="loader-backdrop">
      <div class="loader-spinner"></div>
    </div>
  `,
  styles: [`
    .loader-backdrop {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .loader-spinner {
      width: 60px;
      height: 60px;
      border: 5px solid #ccc;
      border-top-color: #60a5fa;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}
}
