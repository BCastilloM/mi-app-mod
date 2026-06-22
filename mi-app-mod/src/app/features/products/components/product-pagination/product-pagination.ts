import { Component, signal } from '@angular/core';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'app-product-pagination',
  templateUrl: './product-pagination.html',
  standalone: false,
  styleUrl: './product-pagination.css'
})
export class ProductPagination {
  products = signal<any[]>([]);
  p = signal(1);
  total = signal(0);

  constructor() {
    this.products.set(
      Array(50)
        .fill(1)
        .map(_ => {
          return {
            image: faker.image.url(),
            productName: faker.commerce.productName(),
            productCode: 'PROD' + faker.string.numeric(3),
            releaseDate: faker.date.past(),
            price: faker.commerce.price()
          };
        })
    );
    this.total.set(this.products().length);
  }
}
