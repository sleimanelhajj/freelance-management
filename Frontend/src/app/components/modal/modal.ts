import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  @Input() visible = false;
  @Input() message = '';
  @Input() title = 'Error';
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
