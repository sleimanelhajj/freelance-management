import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutHeaderService {
  titleOverride = signal<string | null>(null);
  subtitleOverride = signal<string | null>(null);

  setOverrides(title: string | null, subtitle: string | null): void {
    this.titleOverride.set(title);
    this.subtitleOverride.set(subtitle);
  }

  clearOverrides(): void {
    this.titleOverride.set(null);
    this.subtitleOverride.set(null);
  }
}
