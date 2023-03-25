import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { GenericFunction } from '../genericFunction';
import { HttpCustomService } from '../HttpCustomService';
import { PipelineService } from '../pipeline-old/pipeline.service';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  const mockTransacation = {
    createQueryRunner: jest.fn().mockImplementation(() => ({
      query: jest.fn().mockReturnValue([])
    })),
    query: jest.fn().mockReturnValue([])
  };

  const mockHttpservice = {
    post: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService, DataSource, GenericFunction, PipelineService, HttpCustomService,
        {
          provide: PipelineService,
          useClass: PipelineService
        },
        {
          provide: ScheduleService,
          useClass: ScheduleService
        },
        {
          provide: DataSource,
          useValue: mockTransacation
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockHttpservice
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("validator",async () => {
    let input = {
      // "pipeline_name": "student_count_pipe",
      "scheduled_at": "0 6 13 ? * *"
    }
    let result = { "code": 400, "error": [
      {
          "instancePath": "",
          "schemaPath": "#/required",
          "keyword": "required",
          "params": {
              "missingProperty": "pipeline_name"
          },
          "message": "must have required property 'pipeline_name'"
      }
  ] }
    expect(await service.schedulePipeline(input)).toStrictEqual(result)

  });

  it('cron expression validation  ', async () => {
    let input = {
      "pipeline_name": "student_count_pipe",
      "scheduled_at": "0hg"
    }
    let result = { "code": 400, "error": "Unexpected end of expression" }
    expect(await service.schedulePipeline(input)).toStrictEqual(result)
  });

  it('Pipeline Not found ', async () => {
    let input = {
      "pipeline_name": "student_count_pipe",
      "scheduled_at": "0 6 13 ? * *"
    }
    let result = { code: 400, error: "Pipeline name not Found" }
    expect(await service.schedulePipeline(input)).toStrictEqual(result)
  });

  it('Could not create schedule for student_count_pipe',async () => {
    const mockTransacation1 = {
      createQueryRunner: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        query: jest.fn(),
        startTransaction:jest.fn(),
        release:jest.fn(),
        rollbackTransaction:jest.fn()
      })),
      query: jest.fn().mockReturnValue([{length:1}])
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService, DataSource, GenericFunction, PipelineService, HttpCustomService,
        {
          provide: PipelineService,
          useValue: {
            CreatePipeline:jest.fn()
          }
        },
        {
          provide: ScheduleService,
          useClass: ScheduleService
        },
        {
          provide: DataSource,
          useValue: mockTransacation1
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockTransacation1
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    let input = {
      "pipeline_name": "student_count_pipe",
      "scheduled_at": "0 6 13 ? * *"
    }
    let result = { code: 400, "error": "Could not create schedule for student_count_pipe" }
    expect(await service.schedulePipeline(input)).toStrictEqual(result)
  });

  it('Could not insert into schedule table', async () => {
    const mockTransacation3 = {
      createQueryRunner: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        query: jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([]).mockReturnValueOnce([])
      })),
      query:jest.fn().mockReturnValueOnce([{ length: 1 }])
    };


    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService, DataSource, GenericFunction, PipelineService, HttpCustomService,
        {
          provide: PipelineService,
          useValue: {
            CreatePipeline: jest.fn().mockResolvedValueOnce({ code: 200, message: "created" })
          }
        },
        {
          provide: ScheduleService,
          useClass: ScheduleService
        },
        {
          provide: DataSource,
          useValue: mockTransacation3
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockTransacation3
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    let input = {
      "pipeline_name": "student_count_pipe",
      "scheduled_at": "0 6 13 ? * *"
    }
    let result = { code: 400, "error": "Could not insert into schedule table" }
    expect(await service.schedulePipeline(input)).toStrictEqual(result)
  });

  it('pipeline has been successfully scheduled', async () => {
    const mockTransacation3 = {
      createQueryRunner: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        query: jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([{pid:1}])
      })),
      query:jest.fn().mockReturnValueOnce([{ length: 1 }])
    };


    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService, DataSource, GenericFunction, PipelineService, HttpCustomService,
        {
          provide: PipelineService,
          useValue: {
            CreatePipeline: jest.fn().mockResolvedValueOnce({ code: 200, message: "created" })
          }
        },
        {
          provide: ScheduleService,
          useClass: ScheduleService
        },
        {
          provide: DataSource,
          useValue: mockTransacation3
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockTransacation3
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    let input = {
      "pipeline_name": "student_count_pipe",
      "scheduled_at": "0 6 13 ? * *"
    }
    let result = { code: 200, message: `student_count_pipe has been successfully scheduled` }
    expect(await service.schedulePipeline(input)).toStrictEqual(result)
  });

  it('Successfully updated the schedule', async () => {
    const mockTransacation1 = {
      createQueryRunner: jest.fn().mockImplementation(() => ({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          release: jest.fn(),
          rollbackTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          query: jest.fn().mockReturnValueOnce([{pid: 1}]).mockReturnValueOnce([{pid:1}]).mockReturnValueOnce([{pid:1}])
      })),
      query: jest.fn().mockReturnValueOnce([{length: 1}])
  };


    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService, DataSource, GenericFunction, PipelineService, HttpCustomService,
        {
          provide: PipelineService,
          useValue: {
            CreatePipeline: jest.fn().mockResolvedValueOnce({ code: 200, message: "created"})
          }
        },
        {
          provide: ScheduleService,
          useClass: ScheduleService
        },
        {
          provide: DataSource,
          useValue: mockTransacation1
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockTransacation1
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    let input = {
      "pipeline_name": "student_count_pipe",
      "scheduled_at": "0 6 13 ? * *"
    }
    let result = { code: 200, "message": "Successfully updated the schedule" }
    expect(await service.schedulePipeline(input)).toStrictEqual(result)
  });

  it('exception', async () => {
    const mockTransacation1 = {
      createQueryRunner: jest.fn().mockImplementation(() => ({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          release: jest.fn(),
          rollbackTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          query: jest.fn().mockReturnValueOnce([{pid: 1}]).mockReturnValueOnce([{pid:1}]).mockReturnValueOnce([{length:2}])
      })),
      query: jest.fn().mockReturnValueOnce([{length: 1}])
  };


    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService, DataSource, GenericFunction, PipelineService, HttpCustomService,
        {
          provide: PipelineService,
          useValue: {
            CreatePipeline: jest.fn().mockImplementation(() => {
              throw Error("exception test")
          })
          }
        },
        {
          provide: ScheduleService,
          useClass: ScheduleService
        },
        {
          provide: DataSource,
          useValue: mockTransacation1
        },
        {
          provide: GenericFunction,
          useClass: GenericFunction
        },
        {
          provide: HttpCustomService,
          useValue: mockTransacation1
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    let input = {
      "pipeline_name": "student_count_pipe",
      "scheduled_at": "0 6 13 ? * *"
    }
    let resultOutput = "Error: exception test";

        try {
            await service.schedulePipeline(input);
        } catch (e) {
            expect(e.message).toEqual(resultOutput);
        }
  });

});
