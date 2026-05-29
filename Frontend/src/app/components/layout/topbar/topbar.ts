import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { LayoutHeaderService } from '../../../services/layout-header.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private layoutHeaderService = inject(LayoutHeaderService);

  routeTitle = '';
  routeSubtitle = '';

  get title(): string {
    return this.layoutHeaderService.titleOverride() ?? this.routeTitle;
  }

  get subtitle(): string {
    return this.layoutHeaderService.subtitleOverride() ?? this.routeSubtitle;
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
      )
      .subscribe(() => {
        let current = this.route;
        while (current.firstChild) current = current.firstChild;

        const data = current.snapshot.data;
        this.routeTitle = data['title'] ?? '';

        const rawSubtitle = data['subtitle'];
        this.routeSubtitle =
          rawSubtitle === 'date'
            ? new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : (rawSubtitle ?? '');
      });
  }
}
