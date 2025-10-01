import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly heroes = [
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
  ];

  findOne(data: { id: number }) {
    return this.heroes.find((hero) => hero.id === data.id);
  }
}
