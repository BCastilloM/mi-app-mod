import { Component, input, output, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { IProduct } from '../../interfaces/product';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  standalone: false,
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit, OnChanges, OnDestroy {

  products       = input<IProduct[]>([]);
  productsChange = output<IProduct[]>();

  showImage   = false;
  imageWidth  = 50;
  imageMargin = 2;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {}
  ngOnChanges(): void {}
  ngOnDestroy(): void {}

  toggleImage(): void {
    this.showImage = !this.showImage;
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe(() => {
      this.productService.getProducts().subscribe((res: IProduct[]) => {
        this.productsChange.emit(res);
      });
    });
  }

  updateProduct(product: IProduct): void {
    const updated: IProduct = {
      ...product,
      fechaVenta: product.fechaVenta.substring(0, 10),
      precio:     Math.floor(Math.random() * 100000) + 1000,
      puntuacion: Math.floor(Math.random() * 5) + 1
    };
    this.productService.updateProduct(updated).subscribe(() => {
      this.productService.getProducts().subscribe((res: IProduct[]) => {
        this.productsChange.emit(res);
      });
    });
  }
}