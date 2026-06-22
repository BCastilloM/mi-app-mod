import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-star',
  templateUrl: './star.html',
  standalone: false,
  styleUrl: './star.css'
})
export class StarComponent {

  starRating = input<number>(0);

  stars = computed(() => Array(this.starRating()).fill(0));

  starWidth = computed(() => (this.starRating() / 5) * 75);
}
