import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imagePipe',
  standalone: false
})
export class ImagePipe implements PipeTransform {
  transform(value: string): string {
    if (!value || value.trim() === '') {
      return 'default-product.png';
    }
    return value;
  }
}
