import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly year = new Date().getFullYear();

  protected logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigate(['/servicios']),
      error: () => void this.router.navigate(['/servicios']),
    });
  }
}
