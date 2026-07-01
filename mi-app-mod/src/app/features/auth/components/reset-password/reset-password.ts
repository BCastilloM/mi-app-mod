import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  standalone: false,
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;
  token: string | null = null;
  errorMsg = '';
  successMsg = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Capturar token de los parámetros de la URL (?token=...)
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.errorMsg = 'El enlace de recuperación es inválido o no contiene un token.';
    }

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para confirmar que las contraseñas coinciden
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  get f() { return this.resetForm.controls; }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    console.log('Restableciendo contraseña con token:', this.token);

    this.authService.resetPassword(this.token, this.f['password'].value).subscribe({
      next: (res: any) => {
        console.log('Respuesta de éxito del backend:', res);
        this.successMsg = res.mensaje || 'Contraseña restablecida con éxito. Redirigiendo...';
        this.isLoading = false;

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error al restablecer contraseña:', err);
        this.errorMsg = err.error?.mensaje || err.error?.error || 'Error al restablecer la contraseña. Puede que el enlace haya expirado.';
        this.isLoading = false;
      }
    });
  }
}
