import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';

// Declaración mínima para que TypeScript reconozca el objeto global `google`
declare const google: {
  accounts: {
    id: {
      initialize: (config: object) => void;
      renderButton: (element: HTMLElement, options: object) => void;
      prompt: () => void;
    };
  };
};

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: false,
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  errorMsg = '';

  readonly googleClientId = '717011728262-9182srsqkvonhjsi5dtubslb7gjtl41a.apps.googleusercontent.com';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Inicializar Google Identity Services después de que el DOM esté listo
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    // Esperar a que el script de GSI esté cargado
    if (typeof google === 'undefined') {
      setTimeout(() => this.initGoogleSignIn(), 200);
      return;
    }

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: { credential: string }) => {
        // El callback viene fuera del contexto de Angular, usamos NgZone
        this.ngZone.run(() => {
          this.loginWithGoogle(response.credential);
        });
      }
    });

    // Renderizar el botón oficial de Google en el contenedor
    const btnEl = document.getElementById('google-signin-btn');
    if (btnEl) {
      google.accounts.id.renderButton(btnEl, {
        theme: 'outline',
        size: 'large',
        width: 340,
        text: 'signin_with',
        locale: 'es'
      });
    }
  }

  get f() { return this.loginForm.controls; }

  login(): void {
    if (this.loginForm.invalid) return;
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (res: any) => {
          this.authService.saveToken(res.token);
        },
        error: (err) => {
          this.errorMsg = err.error?.mensaje || 'Error al iniciar sesión';
        }
      });
  }

  loginWithGoogle(idToken: string): void {
    this.authService.loginWithGoogle(idToken).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
      },
      error: (err) => {
        this.errorMsg = err.error?.mensaje || 'Error al iniciar sesión con Google';
      }
    });
  }
}
