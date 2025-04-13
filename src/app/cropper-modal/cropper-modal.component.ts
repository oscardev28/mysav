import {
  Component,
  Inject,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  standalone: true,
  selector: 'app-cropper-modal',
  template: `
    <div class="p-4 flex flex-col items-center gap-4 w-full max-w-md">
      <canvas #canvas width="300" height="300" class="rounded-full border shadow-md"></canvas>

      <mat-slider [min]="0.5" [max]="3" [step]="0.1">
        <input matSliderThumb [formControl]="scaleControl" />
      </mat-slider>

      <div class="flex justify-between w-full mt-4">
        <button mat-button color="warn" (click)="dialogRef.close()">Cancelar</button>
        <button mat-flat-button color="primary" (click)="confirm()">Confirmar</button>
      </div>
    </div>
  `,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSliderModule
  ]
})
export class CropperModalComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private image = new Image();

  offset = { x: 0, y: 0 };
  dragStart = { x: 0, y: 0 };
  isDragging = false;

  scaleControl = new FormControl(1); // Inicializamos con escala 1

  constructor(
    public dialogRef: MatDialogRef<CropperModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ) {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.image.onload = () => {
      this.offset = {
        x: canvas.width / 2 - (this.image.width * this.scaleControl.value!) / 2,
        y: canvas.height / 2 - (this.image.height * this.scaleControl.value!) / 2
      };
      this.render();
    };

    this.image.src = this.data.imageUrl;

    canvas.addEventListener('mousedown', this.startDrag);
    canvas.addEventListener('mousemove', this.onDrag);
    canvas.addEventListener('mouseup', this.stopDrag);
    canvas.addEventListener('mouseleave', this.stopDrag);

    canvas.addEventListener('touchstart', this.startDrag, { passive: true });
    canvas.addEventListener('touchmove', this.onDrag, { passive: true });
    canvas.addEventListener('touchend', this.stopDrag);

    // React to scale changes
    this.scaleControl.valueChanges.subscribe(() => {
      this.render();
    });
  }

  render() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(150, 150, 150, 0, Math.PI * 2);
    this.ctx.clip();

    const scale = this.scaleControl.value!;
    const w = this.image.width * scale;
    const h = this.image.height * scale;

    this.ctx.drawImage(this.image, this.offset.x, this.offset.y, w, h);
    this.ctx.restore();
  }

  startDrag = (event: MouseEvent | TouchEvent) => {
    this.isDragging = true;
    const point = this.getEventPosition(event);
    this.dragStart = {
      x: point.x - this.offset.x,
      y: point.y - this.offset.y
    };
  };

  onDrag = (event: MouseEvent | TouchEvent) => {
    if (!this.isDragging) return;
    const point = this.getEventPosition(event);
    this.offset = {
      x: point.x - this.dragStart.x,
      y: point.y - this.dragStart.y
    };
    this.render();
  };

  stopDrag = () => {
    this.isDragging = false;
  };

  getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    let x = 0;
    let y = 0;

    if (event instanceof MouseEvent) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    }

    return { x, y };
  }

  confirm() {
    const canvas = this.canvasRef.nativeElement;
    canvas.toBlob((blob:any) => {
      if (blob) {
        const file = new File([blob], 'profile.png', { type: 'image/png' });
        this.dialogRef.close(file);
      }
    }, 'image/png');
  }
}
