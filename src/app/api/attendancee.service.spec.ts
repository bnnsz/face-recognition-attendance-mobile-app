import { TestBed } from '@angular/core/testing';

import { AttendanceeService } from './attendancee.service';

describe('AttendanceeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AttendanceeService = TestBed.get(AttendanceeService);
    expect(service).toBeTruthy();
  });
});
