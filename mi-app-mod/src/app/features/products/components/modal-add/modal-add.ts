import { Component, input, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, map, debounceTime, switchMap, of } from 'rxjs';
import { IProduct } from '../../interfaces/product';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-modal-add',
  templateUrl: './modal-add.html',
  standalone: false,
  styleUrl: './modal-add.css'
})
export class ModalAddComponent implements OnInit {

  isOpen = input<boolean>(false);
  cerrar = output<void>();
  guardar = output<IProduct>();

  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      nombre:     ['', [Validators.required, Validators.minLength(3)]],
      codigo:     ['', [Validators.required],
                   [this.validarCodigoExistente.bind(this)]],
      fechaVenta: ['', [Validators.required]],
      precio:     [0,  [Validators.required, Validators.min(0)]],
      puntuacion: [1,  [Validators.required, Validators.min(1), Validators.max(200)]],
      imagen:     ['']
    });
  }

  // Validador asíncrono: verifica si el código ya existe en la BD
  validarCodigoExistente(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 8) {
      return of(null);
    }
    return of(control.value).pipe(
      debounceTime(500),
      switchMap(codigo =>
        this.productService.checkCodigoExistente(codigo).pipe(
          map(existe => (existe ? { codeExists: true } : null))
        )
      )
    );
  }

  get f() { return this.productForm.controls; }

  cerrarModal(): void {
    this.productForm.reset({ precio: 0, puntuacion: 1 });
    this.cerrar.emit();
  }

  guardarProducto(): void {
    if (this.productForm.invalid || this.productForm.pending) return;
    this.guardar.emit(this.productForm.value as IProduct);
    this.productForm.reset({ precio: 0, puntuacion: 1 });
    this.cerrar.emit();
  }
}
