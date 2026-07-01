import { Component, OnInit, signal } from '@angular/core';
import { ProductSalesAnalyticsService } from '../../services/product-sales-analytics';

@Component({
  standalone: false,
  selector: 'app-product-sales',
  templateUrl: './product-sales.html',
  styleUrls: ['./product-sales.css']
})
export class ProductSalesComponent implements OnInit {

  saleData = signal<any[]>([]);

  // Configuración del gráfico
  view: [number, number] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  legendTitle = 'Productos';
  showXAxisLabel = true;
  xAxisLabel = 'Puntuación';
  showYAxisLabel = true;
  yAxisLabel = 'Producto';
  colorScheme: any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#2196F3']
  };

  constructor(private analyticsService: ProductSalesAnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getSalesData().subscribe({
      next: (data) => this.saleData.set(data),
      error: (err) => console.error('Error cargando datos de ventas:', err)
    });
  }
}
