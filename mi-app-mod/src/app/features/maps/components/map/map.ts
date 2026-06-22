import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MapService, Marker } from '../../services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
  standalone: false
})
export class MapComponent implements OnInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  searchQuery = '';
  selectedMarker: Marker | null = null;
  errorMessage = '';

  // Santiago de Chile por defecto
  private defaultLat = -33.4489;
  private defaultLng = -70.6693;

  constructor(private mapService: MapService) {}

  async ngOnInit(): Promise<void> {
    await this.mapService.initMap(this.mapContainer.nativeElement, this.defaultLat, this.defaultLng, 13);

    // Marcador inicial
    this.mapService.addMarker({
      lat: this.defaultLat,
      lng: this.defaultLng,
      label: '1',
      info: 'Santiago de Chile'
    });
  }

  async onSearch(): Promise<void> {
    this.errorMessage = '';
    if (!this.searchQuery.trim()) return;

    const result = await this.mapService.searchAddress(this.searchQuery);
    if (result) {
      this.mapService.clearMarkers();
      this.mapService.addMarker({
        lat: result.lat,
        lng: result.lng,
        label: '1',
        info: this.searchQuery
      });
    } else {
      this.errorMessage = 'No se encontró la dirección. Intente con otra búsqueda.';
    }
  }

  onMarkerClick(marker: Marker): void {
    this.selectedMarker = marker;
  }
}
