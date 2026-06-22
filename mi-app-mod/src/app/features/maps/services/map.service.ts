import { Injectable } from '@angular/core';
import { MapLoaderService } from './map-loader';

export interface Marker {
  lat: number;
  lng: number;
  label?: string;
  info?: string;
}

@Injectable({ providedIn: 'root' })
export class MapService {
  private map!: google.maps.Map;
  private markers: google.maps.Marker[] = [];
  private infoWindow!: google.maps.InfoWindow;

  constructor(private loader: MapLoaderService) {}

  async initMap(container: HTMLElement, lat: number, lng: number, zoom = 13): Promise<void> {
    await this.loader.load();

    this.map = new google.maps.Map(container, {
      center: { lat, lng },
      zoom
    });

    this.infoWindow = new google.maps.InfoWindow();
  }

  addMarker(marker: Marker): void {
    const gMarker = new google.maps.Marker({
      position: { lat: marker.lat, lng: marker.lng },
      map: this.map,
      label: marker.label
    });

    if (marker.info) {
      gMarker.addListener('click', () => {
        this.infoWindow.setContent(marker.info!);
        this.infoWindow.open(this.map, gMarker);
      });
    }

    this.markers.push(gMarker);
  }

  clearMarkers(): void {
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
  }

  searchAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    return new Promise(resolve => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          this.map.setCenter(loc);
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          resolve(null);
        }
      });
    });
  }
}
