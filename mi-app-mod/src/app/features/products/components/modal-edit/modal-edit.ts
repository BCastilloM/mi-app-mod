import { Component, input, output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IProduct } from '../../interfaces/product';

@Component({
  standalone: false,
  selector: 'app-modal-edit',
  templateUrl: './modal-edit.html',
  styleUrl: './modal-edit.css'
})
export class ModalEditComponent implements OnChanges {

  isOpen    = input<boolean>(false);
  producto  = input<IProduct | null>(null);
  cerrar    = output<void>();
  guardar   = output<IProduct>();

  productForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      nombre:     ['', [Validators.required, Validators.minLength(3)]],
      codigo:     ['', [Validators.required]],
      fechaVenta: ['', [Validators.required]],
      precio:     [0,  [Validators.required, Validators.min(0)]],
      puntuacion: [1,  [Validators.required, Validators.min(1), Validators.max(200)]],
      imagen:     ['']
    });
  }

  // Cada vez que cambia el producto de entrada, se pre-rellena el formulario
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] && this.producto()) {
      const p = this.producto()!;
      // Normalizar la fecha a YYYY-MM-DD para el input type="date"
      const fecha = p.fechaVenta ? p.fechaVenta.substring(0, 10) : '';
      this.productForm.patchValue({
        nombre:     p.nombre,
        codigo:     p.codigo,
        fechaVenta: fecha,
        precio:     p.precio,
        puntuacion: p.puntuacion,
        imagen:     p.imagen
      });
    }
  }

  get f() { return this.productForm.controls; }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  guardarProducto(): void {
    if (this.productForm.invalid) return;
    const updated: IProduct = {
      ...this.producto()!,
      ...this.productForm.value
    };
    this.guardar.emit(updated);
    this.cerrar.emit();
  }
}
