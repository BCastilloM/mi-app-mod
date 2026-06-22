import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';

import { IProduct } from '../../interfaces/product';
import { ProductService } from '../../services/product';
import { ProductListComponent } from '../product-list/product-list';
import { ModalAddComponent } from '../modal-add/modal-add';

@Component({
  selector: 'app-product',
  templateUrl: './product.html',
  standalone: false,
  styleUrl: './product.css'
})
export class ProductComponent implements OnInit {

  isModalOpen = signal(false);
  listFilter = signal('');

  filteredProducts = computed(() =>
    this.productService.products().filter(p =>
      p.nombre.toLowerCase().includes(this.listFilter().toLowerCase())
    )
  );

  constructor(public productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products: IProduct[]) => {
      this.productService.products.set(products);
    });
  }

  abrirModal(): void {
    console.log('Abriendo modal');
    this.isModalOpen.set(true);
    console.log(this.isModalOpen());
  }

  cerrarModal(): void {
    console.log('Cerrando modal');
    this.isModalOpen.set(false);
  }

  guardarProducto(product: IProduct): void {
    console.log('Guardando producto:', product);
    this.productService.saveProduct(product).pipe(
      switchMap(() => this.productService.getProducts())
    ).subscribe(products => this.productService.products.set(products));
  }

  crearProducto(): void {
    const datos: IProduct = {
      nombre: `Producto Nuevo ${Math.round(Math.random() * (100 - 1) + 1)}`,
      codigo: this.productService.generateProductCode(),
      fechaVenta: '2024-01-01',
      precio: Math.round(Math.random() * (40000 - 10000) + 10000),
      puntuacion: Math.round(Math.random() * (200 - 1) + 1),
      imagen: ''
    };
    this.guardarProducto(datos);
  }
}
