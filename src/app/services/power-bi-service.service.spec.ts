import { TestBed } from '@angular/core/testing';

import { PowerBIService } from './power-bi-service.service';

describe('PowerBiServiceService', () => {
  let service: PowerBIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerBIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
