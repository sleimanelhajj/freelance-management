import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.css',
})
export class InputFieldComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() type = 'text';
  @Input() name = '';
  @Input() placeholder = '';

  dateInputActive = false;

  get inputType(): string {
    if (this.type !== 'date') return this.type;
    return this.dateInputActive || this.control.value ? 'date' : 'text';
  }

  activateDateInput(): void {
    if (this.type === 'date') {
      this.dateInputActive = true;
    }
  }

  deactivateDateInput(): void {
    if (this.type === 'date' && !this.control.value) {
      this.dateInputActive = false;
    }
  }
}
