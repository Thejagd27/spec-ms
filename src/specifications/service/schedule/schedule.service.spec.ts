import {Test, TestingModule} from '@nestjs/testing';
import {DataSource} from 'typeorm';
import {GenericFunction} from '../genericFunction';
import {HttpCustomService} from '../HttpCustomService';
import {PipelineService} from '../pipeline-old/pipeline.service';
import {ScheduleService} from './schedule.service';

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
    };

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

    it("validator", async () => {
        let input = {
            // "processor_group_name": "Plugin Student Attendance aws",
            "scheduled_at": "0 6 13 ? * *",
            "processor_name": "Lists3"
        };
        let result = {
            "code": 400, "error": [
                {
                    "instancePath": "",
                    "schemaPath": "#/required",
                    "keyword": "required",
                    "params": {
                        "missingProperty": "processor_group_name"
                    },
                    "message": "must have required property 'processor_group_name'"
                }
            ]
        };
        expect(await service.scheduleProcessorGroup(input)).toStrictEqual(result)

    });

    it('cron expression validation  ', async () => {
        let input = {
            "processor_group_name": "Plugin Student Attendance aws",
            "scheduled_at": "0hg",
            "processor_name": "Lists3"
        };
        let result = {"code": 400, "error": "Unexpected end of expression"};
        expect(await service.scheduleProcessorGroup(input)).toStrictEqual(result)
    });
});
