import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:3000';

  products = signal<IProduct[]>([]);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.apiUrl}/productos`, { headers: this.getHeaders() });
  }

  saveProduct(product: IProduct): Observable<any> {
    return this.http.post(`${this.apiUrl}/producto`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/producto/${id}`, { headers: this.getHeaders() });
  }

  updateProduct(product: IProduct): Observable<any> {
    return this.http.put(`${this.apiUrl}/producto/${product.id_producto}`, product, { headers: this.getHeaders() });
  }

  checkCodigoExistente(codigo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/producto/codigo/${codigo}`);
  }

  generateProductCode(): string {
    const num = Math.floor(Math.random() * 1000);
    return 'PROD' + String(num).padStart(3, '0');
  }
}
