import { Test, TestingModule } from '@nestjs/testing';
import { TransformerService } from './transformer.service';
import { DataSource } from 'typeorm';
import { GenericFunction } from '../genericFunction';
import { HttpCustomService } from '../HttpCustomService';

describe('TransformerService', () => {
    let service: TransformerService;
    const mockTransacation = {
        createQueryRunner: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            release: jest.fn(),
            rollbackTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            query: jest.fn().mockReturnValueOnce([0]).mockRejectedValueOnce([{ pid: 1 }]).mockRejectedValueOnce([])
        })),
        query: jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([{ length: 1 }]).mockRejectedValueOnce([]).mockRejectedValueOnce([])
    }

    let apidata = {
        data: { code: 200, TransformerFiles: [], Message: "Transformer created succesfully", }
    }

    const mockHttpservice = {
        post: jest.fn().mockReturnValueOnce(apidata)
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TransformerService, DataSource, GenericFunction, HttpCustomService,
                {
                    provide: TransformerService,
                    useClass: TransformerService
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

            ]
        }).compile();

        service = module.get<TransformerService>(TransformerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('validation', async () => {
        const transformerData = {

            // "ingestion_name":"students_attendance",
            "key_file": "transformer_dataset_maping.csv",
            "program": "SAC",
            "operation": "dimension"
        };
        let result = {
            "code": 400, error: [
                {
                    "instancePath": "",
                    "keyword": "required",
                    "message": "must have required property 'ingestion_name'",
                    "params": {
                        "missingProperty": "ingestion_name",
                    },
                    "schemaPath": "#/required",
                },
            ]
        };

        expect(await service.createTransformer(transformerData)).toStrictEqual(result);
    });


    it('validation dataset', async () => {
        const transformerData = {

            "ingestion_name":"students_attendance",
            "key_file": "transformer_dataset_maping.csv",
            // "program": "SAC",
            "operation": "dataset"
        };
        let result = {
            "code": 400, error: [
                {
                    "instancePath": "",
                    "schemaPath": "#/required",
                    "keyword": "required",
                    "params": {
                        "missingProperty": "program"
                    },
                    "message": "must have required property 'program'"
                }
            ]
        };

        expect(await service.createTransformer(transformerData)).toStrictEqual(result);
    });

    it('Invalid operation type', async () => {
        const transformerData = {
            "ingestion_name": "students_attendance",
            "key_file": "transformer_dataset_maping.csv",
            "program": "SAC",
            "operation": "dataset1"
        };
        let result = {
            "code": 400, "error": "Invalid operation type"
        };
        expect(await service.createTransformer(transformerData)).toStrictEqual(result)

    })

    it('unable to create a transformer', async () => {
        let service: TransformerService;
        const mockTransacation = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                query: jest.fn().mockReturnValueOnce([{ pid: 1 }])
            })),
            query: jest.fn().mockReturnValueOnce([{ length: 1 }]),
        }

        const module: TestingModule = await Test.createTestingModule({
                    providers: [TransformerService, DataSource, GenericFunction, HttpCustomService,
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
        
                    ]
                }).compile();
        
                service = module.get<TransformerService>(TransformerService);
        let result = {
            "code": 400, "error": "unable to create a transformer"
        };
        const transformerData = {
            "ingestion_name": "students_attendance11",
            "key_file": "transformer_dataset_maping.csv",
            "program": "SAC",
            "operation": "dataset"
        };
        expect(await service.createTransformer(transformerData)).toStrictEqual(result)
    });

    it('transformer not created', async () => {
        let service: TransformerService;
        const mockTransacation = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                query: jest.fn().mockReturnValueOnce([{ pid: 1 }])
            })),
            query: jest.fn().mockReturnValueOnce([{ length: 1 }]),
        }

        let apidata = {
            data: { TransformerFiles: [{ filename: "test" }], Message: "Transformer not created", }
        }
        const mockHttpservice = {
            post: jest.fn().mockReturnValueOnce(apidata)
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [TransformerService, DataSource, GenericFunction, HttpCustomService,

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

            ]
        }).compile();

        service = module.get<TransformerService>(TransformerService);
        const transformerData = {
            "ingestion_name": "students_attendance11",
            "key_file": "transformer_dataset_maping.csv",
            "program": "SAC",
            "operation": "dataset"
        };
        let result = {
            "code": 400, "error": "Transformer not created",
        };
        expect(await service.createTransformer(transformerData)).toStrictEqual(result)
    });

    it('transformer created sucessfully', async () => {
        let service: TransformerService;
        const mockTransacation = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                query: jest.fn().mockReturnValueOnce([{ pid: 1 }])
            })),
            query: jest.fn().mockReturnValueOnce([{ length: 1 }]),
        }

        let apidata = {
            data: { code: 200, TransformerFiles: [{ filename: "test" }], Message: "Transformer created succesfully", }
        }
        const mockHttpservice = {
            post: jest.fn().mockReturnValueOnce(apidata)
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [TransformerService, DataSource, GenericFunction, HttpCustomService,

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

            ]
        }).compile();

        service = module.get<TransformerService>(TransformerService);
        const transformerData = {
            "ingestion_name": "students_attendance11",
            "key_file": "transformer_dataset_maping.csv",
            "program": "SAC",
            "operation": "dimension"
        };
        let result = {
            "code": 200,
            "message": "Transformer created succesfully",
            "response": [{
                "pid": 1,
                "filename": "test"
            }]
        };
        expect(await service.createTransformer(transformerData)).toStrictEqual(result)
    });

    it('exception', async () => {
        let service: TransformerService;
        const mockTransacation = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                query: jest.fn().mockReturnValueOnce([{ pid: 1 }])
            })),
            query: jest.fn().mockReturnValueOnce([{ length: 1 }]),
        }

        let apidata = {
            data: { code: 200, TransformerFiles: [{ filename: "test" }], Message: "Transformer not created", }
        }
        const mockHttpservice = {
            post: jest.fn().mockImplementation(() => {
                throw Error("exception test")
            })
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [TransformerService, DataSource, GenericFunction, HttpCustomService,

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

            ]
        }).compile();

        service = module.get<TransformerService>(TransformerService);
        const transformerData = {
            "ingestion_name": "students_attendance11",
            "key_file": "transformer_dataset_maping.csv",
            "program": "SAC",
            "operation": "dimension"
        };
        let resultOutput = "Error: exception test";

        try {
            await service.createTransformer(transformerData);
        } catch (e) {
            expect(e.message).toEqual(resultOutput);
        }

    });

});