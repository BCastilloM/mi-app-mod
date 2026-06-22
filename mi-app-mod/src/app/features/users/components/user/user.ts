import { Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'app-user',
  templateUrl: './user.html',
  standalone: false,
  styleUrl: './user.css'
})
export class User {
  data: { name: string; email: string; avatar: string }[];

  constructor() {
    this.data = Array(10000)
      .fill(1)
      .map(_ => {
        return {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          avatar: faker.image.avatar()
        };
      });
  }
}
