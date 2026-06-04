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
}
