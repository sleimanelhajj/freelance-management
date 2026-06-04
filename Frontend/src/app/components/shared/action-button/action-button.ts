import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-action-button',
  imports: [CommonModule],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class ActionButton {
  @Input() buttonLabel: string = '';
  @Input() deleteButton: boolean = false;
  @Input() modalButton: boolean = false;
  @Input() disabled: boolean = false;
  @Input() addButton: boolean = false;
  @Input() submitting: boolean = false;
  @Input() submitButton: boolean = false;
  @Input() type: string = 'button';
  @Input() paidButton: boolean = false;
  @Input() wideButton: boolean = false;

  @Output() action = new EventEmitter<void>();

  onPressed(): void {
    this.action.emit();
  }
}
