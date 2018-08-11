import { TestBed, inject } from '@angular/core/testing';

import { OfflineManagerService } from './offline-manager.service';

describe('OfflineManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OfflineManagerService]
    });
  });

  it('should be created', inject([OfflineManagerService], (service: OfflineManagerService) => {
    expect(service).toBeTruthy();
  }));
});
