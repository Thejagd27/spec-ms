import { HttpCustomService } from './../HttpCustomService';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { GenericFunction } from '../genericFunction';
import { s3DTO } from 'src/specifications/dto/specData.dto';

describe('S3Service', () => {
  let service: S3Service;
  const mockHttpservice = {
    get: jest.fn().mockReturnValueOnce({ data: { component: { id: 1 } } })
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, HttpCustomService, GenericFunction,
        {
          provide: S3Service,
          useClass: S3Service
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockHttpservice
        },
      ]
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validation', async () => {
    let input = {
      "scheduled_type": "archive"
    }
    let result = {
      code: 400, error: [
        {
          "instancePath": "",
          "schemaPath": "#/required",
          "keyword": "required",
          "params": {
            "missingProperty": "scheduled_at"
          },
          "message": "must have required property 'scheduled_at'"
        }
      ]
    }

    expect(await service.uploadFile(input)).toStrictEqual(result);
  });

  it('cron validation', async () => {
    let input = {
      "scheduled_at": "gsdg",//giving wrong expression
      "scheduled_type":"archive"
    }
    let result = {
      code: 400, error: "Unexpected end of expression"
    }
    expect(await service.uploadFile(input)).toStrictEqual(result);
  });

  it('Processor group running successfully', async () => {
    const mockTransaction = {
      get: jest.fn().mockReturnValueOnce({ data: { component: { id: 1 } } })
        .mockReturnValueOnce({
          data: {
            processGroupFlow: {
              flow: {
                processGroups: [{
                  component: {
                    id: 123,
                    name: "asd"
                  }
                }]
              }
            }
          }
        }).mockReturnValueOnce({ data: { component: { id: 1 } } })
        .mockReturnValue({
          data: {
            processGroupFlow: {
              id: 1,
              flow: {
                processors: [{
                  component: {
                    name: "GetFile", id: 1
                  },
                  revision: {
                    version: 1.1
                  }
                }, {
                  component: { name: "PutS3Object", id: 2 },
                  revision: {
                    version: 1.1
                  }
                },
                {
                  component: { name: "successLogMessage", id: 3 },
                  revision: {
                    version: 1.1
                  }
                }, {
                  component: {
                    name: "failedLogMessage",
                    id: 4
                  },
                  revision: {
                    version: 1.1
                  }
                }]
              }
            }
          }
        }),
      post: jest.fn().mockReturnValueOnce({ data: { component: { id: 2 } } }),
      put: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, HttpCustomService, GenericFunction,
        {
          provide: S3Service,
          useClass: S3Service
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockTransaction
        },
      ]
    }).compile();

    service = module.get<S3Service>(S3Service);
    let input = {
      "scheduled_at": "0 0/2 * 1/1 * ? *",
      "scheduled_type": "archive"
    }
    let result = {
      code: 200, message: "uploadToS3 Processor group running successfully"
    }
    expect(await service.uploadFile(input)).toStrictEqual(result);
  });

  it('exception', async () => {
    const mockTransaction = {
      get: jest.fn().mockImplementation(() => {
        throw Error("exception test")
      }),
      post: jest.fn().mockReturnValueOnce({ data: { component: { id: 2 } } }),
      put: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, HttpCustomService, GenericFunction,
        {
          provide: S3Service,
          useClass: S3Service
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockTransaction
        },
      ]
    }).compile();

    service = module.get<S3Service>(S3Service);
    let input = {
      "scheduled_at": "0 0/2 * 1/1 * ? *",
      "scheduled_type":"archive"
    }
    let resultOutput = "Error: exception test";

    try {
      await service.uploadFile(input);
    } catch (e) {
      expect(e.message).toEqual(resultOutput);
    }
  })

  it('Failed to create the processor group', async () => {

    const mockTransaction = {
      get: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, HttpCustomService, GenericFunction,
        {
          provide: S3Service,
          useClass: S3Service
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockTransaction
        },
      ]
    }).compile();

    service = module.get<S3Service>(S3Service);
    let resultOutput = "Failed to create the processor group";

    try {
      await service.addProcessorGroup("student_attendance_by_class");
    } catch (e) {
      expect(e.message).toEqual(resultOutput);
    }
  });

});
