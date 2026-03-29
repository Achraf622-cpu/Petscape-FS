import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Species } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class SpeciesService {
  getAll(): Observable<Species[]> {
    return of(['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'TURTLE', 'OTHER']);
  }
}
