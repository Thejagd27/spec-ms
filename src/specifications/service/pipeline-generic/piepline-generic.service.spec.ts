import { Test, TestingModule } from '@nestjs/testing';
import { PieplineGenericService } from './piepline-generic.service';

describe('PieplineGenericService', () => {
  let service: PieplineGenericService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PieplineGenericService],
    }).compile();

    service = module.get<PieplineGenericService>(PieplineGenericService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
