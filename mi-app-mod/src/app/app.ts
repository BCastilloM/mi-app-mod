import { Component, signal } from '@angular/core';
import { AuthService } from './features/auth/services/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Empresa ACME');

  constructor(public authService: AuthService) {}
}
