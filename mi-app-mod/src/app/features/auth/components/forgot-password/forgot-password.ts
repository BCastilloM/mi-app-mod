import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  standalone: false,
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent implements OnInit {

  forgotForm!: FormGroup;
  errorMsg = '';
  successMsg = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    console.log('Enviando solicitud de recuperación para el email:', this.f['email'].value);

    this.authService.requestPasswordReset(this.f['email'].value).subscribe({
      next: (res: any) => {
        console.log('Respuesta de éxito del backend (solicitud):', res);
        this.successMsg = res.mensaje || 'Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.';
        this.isLoading = false;

        // Redirigir al login después de 5 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (err) => {
        console.error('Error al solicitar enlace de recuperación:', err);
        this.errorMsg = err.error?.mensaje || err.error?.error || 'Error al solicitar el enlace de recuperación.';
        this.isLoading = false;
      }
    });
  }
}
