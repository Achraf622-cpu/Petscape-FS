import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AnimalService } from './animal.service';
import { environment } from '../../../environments/environment';
import { AnimalResponse, Page } from '../../models/models';

describe('AnimalService', () => {
  let service: AnimalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimalService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AnimalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get an animal by id', () => {
    const mockAnimal = {
      id: 1,
      name: 'Buddy',
      breed: 'Golden',
      status: 'AVAILABLE',
    } as AnimalResponse;

    service.getById(1).subscribe((res) => {
      expect(res).toEqual(mockAnimal);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/animals/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAnimal);
  });

  it('should retrieve a list of animals with query params', () => {
    const mockPage: Page<AnimalResponse> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 12,
      number: 0,
      first: true,
      last: true,
    };

    service.getAll({ speciesId: 2, status: 'AVAILABLE' }).subscribe((res) => {
      expect(res).toEqual(mockPage);
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.apiUrl}/animals` &&
        request.params.get('speciesId') === '2' &&
        request.params.get('status') === 'AVAILABLE',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });
});
