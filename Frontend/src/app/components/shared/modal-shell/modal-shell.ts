import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-shell.html',
  styleUrl: './modal-shell.css',
})
export class ModalShellComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'default' | 'confirm' = 'default';
  @Input() closeOnBackdrop = true;

  @Output() closed = new EventEmitter<void>();

  get titleId(): string {
    return `modal-title-${this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'dialog'}`;
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }
}
