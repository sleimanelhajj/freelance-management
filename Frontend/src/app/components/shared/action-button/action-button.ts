import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-action-button',
  imports: [],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class ActionButton {
  @Input() buttonLabel: string = '';
  @Input() deleteButton: boolean = false;
  @Input() modalButton: boolean = false;
  @Input() disabled: boolean = false;

  @Output() action = new EventEmitter<void>();

  onPressed(): void {
    this.action.emit();
  }
}
