import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductSalesAnalyticsService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getSalesData(): Observable<{ name: string; value: number }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`, { headers: this.getHeaders() }).pipe(
      map((productos: any[]) => {
        return productos
          .sort((a, b) => b.puntuacion - a.puntuacion)
          .slice(0, 5)
          .map(p => ({ name: p.nombre, value: p.puntuacion }));
      })
    );
  }
}
