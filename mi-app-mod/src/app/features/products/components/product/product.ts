import { Component, OnInit, signal, computed } from '@angular/core';
import { switchMap } from 'rxjs';

import { IProduct } from '../../interfaces/product';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.html',
  standalone: false,
  styleUrl: './product.css'
})
export class ProductComponent implements OnInit {

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

  crearProducto(): void {
    const datos: IProduct = {
      nombre: `Producto Nuevo ${Math.round(Math.random() * (100 - 1) + 1)}`,
      codigo: this.productService.generateProductCode(),
      fechaVenta: '2024-01-01',
      precio: Math.round(Math.random() * (40000 - 10000) + 10000),
      puntuacion: Math.floor(Math.random() * 5) + 1,
      imagen: ''
    };
    this.productService.saveProduct(datos).pipe(
      switchMap(() => this.productService.getProducts())
    ).subscribe(products => this.productService.products.set(products));
  }
}
