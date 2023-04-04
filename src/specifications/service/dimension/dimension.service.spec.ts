import {Test, TestingModule} from '@nestjs/testing';
import {DataSource} from 'typeorm';
import {GenericFunction} from '../genericFunction';
import {DimensionService} from './dimension.service';

let inputData = {
    "ingestion_type": "dimension",
    "dimension_name": "dimensionsssss",
    "input": {
        "type": "object",
        "properties": {
            "dimension_name": {
                "type": "string"
            },
            "dimension": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "school_id": {
                            "type": "string"
                        },
                        "school_name": {
                            "type": "string"
                        },
                        "cluster_id": {
                            "type": "string"
                        },
                        "cluster_name": {
                            "type": "string"
                        },
                        "block_id": {
                            "type": "string"
                        },
                        "block_name": {
                            "type": "string"
                        },
                        "district_id": {
                            "type": "string"
                        },
                        "district_name": {
                            "type": "string"
                        },
                        "state_id": {
                            "type": "string"
                        },
                        "state_name": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "school_id",
                        "school_name",
                        "cluster_id",
                        "cluster_name",
                        "block_id",
                        "block_name",
                        "district_id",
                        "district_name",
                        "state_id",
                        "state_name"
                    ]
                }
            }
        },
        "required": [
            "dimension_name",
            "dimension"
        ]
    }
};

describe('DimensionService', () => {
    let service: DimensionService;
    const mockTransacation = {
        createQueryRunner: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            release: jest.fn(),
            rollbackTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            query: jest.fn().mockReturnValueOnce([{pid: 1}]).mockReturnValueOnce([{pid: 1}])
        })),
        query: jest.fn().mockReturnValueOnce([{length: 1}]).mockReturnValueOnce([]).mockReturnValueOnce([{length: 1}]).mockReturnValueOnce([]).mockReturnValueOnce([])
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DimensionService, DataSource, GenericFunction,
                {
                    provide: DimensionService,
                    useClass: DimensionService
                },
                {
                    provide: DataSource,
                    useValue: mockTransacation
                },
                {
                    provide: GenericFunction,
                    useClass: GenericFunction
                }
            ]
        }).compile();

        service = module.get<DimensionService>(DimensionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('validation', async () => {
    //     let dimensionData = {
    //         "ingestion_type": "dimension",
    //         // "dimension_name": "dimesnsion",
    //         "input": {
    //             "type": "object",
    //             "properties": {
    //                 "dimension_name": {
    //                     "type": "string"
    //                 },
    //                 "dimension": {
    //                     "type": "array",
    //                     "items": {
    //                         "type": "object",
    //                         "properties": {
    //                             "school_id": {
    //                                 "type": "string"
    //                             },
    //                             "school_name": {
    //                                 "type": "string"
    //                             },
    //                             "cluster_id": {
    //                                 "type": "string"
    //                             },
    //                             "cluster_name": {
    //                                 "type": "string"
    //                             },
    //                             "block_id": {
    //                                 "type": "string"
    //                             },
    //                             "block_name": {
    //                                 "type": "string"
    //                             },
    //                             "district_id": {
    //                                 "type": "string"
    //                             },
    //                             "district_name": {
    //                                 "type": "string"
    //                             },
    //                             "state_id": {
    //                                 "type": "string"
    //                             },
    //                             "state_name": {
    //                                 "type": "string"
    //                             }
    //                         },
    //                         "required": [
    //                             "school_id",
    //                             "school_name",
    //                             "cluster_id",
    //                             "cluster_name",
    //                             "block_id",
    //                             "block_name",
    //                             "district_id",
    //                             "district_name",
    //                             "state_id",
    //                             "state_name"
    //                         ]
    //                     }
    //                 }
    //             },
    //             "required": [
    //                 "dimension_name",
    //                 "dimension"
    //             ]
    //         }
    //     }
    //     let resultData = {
    //         "code": 400, "error": [
    //             {
    //                 "instancePath": "",
    //                 "schemaPath": "#/required",
    //                 "keyword": "required",
    //                 "params": {
    //                     "missingProperty": "dimension_name"
    //                 },
    //                 "message": "must have required property 'dimension_name'"
    //             }
    //         ]
    //     }
    //     expect(await service.createDimension(dimensionData)).toStrictEqual(resultData)
    // });
    //
    // it('invalid request body', async () => {
    //     let inputData = {
    //         "ingestion_type": "dimension",
    //         "dimension_name": "dimension12",
    //         "input": {
    //             "type": "object",
    //             "properties": {
    //                 "dimension_name": {
    //                     "type": "string"
    //                 },
    //                 "dimension": {
    //                     "type": "array",
    //                     "items": {
    //                         "type": "object",
    //                         "properties": {
    //                             "school_id": {
    //                                 "type": "string"
    //                             },
    //                             "school_name": {
    //                                 "type": "string"
    //                             },
    //                             "cluster_id": {
    //                                 "type": "string"
    //                             },
    //                             "cluster_name": {
    //                                 "type": "string"
    //                             },
    //                             "block_id": {
    //                                 "type": "string"
    //                             },
    //                             "block_name": {
    //                                 "type": "string"
    //                             },
    //                             // "district_id": {
    //                             //   "type": "string"
    //                             // },
    //                             "district_name": {
    //                                 "type": "string"
    //                             },
    //                             "state_id": {
    //                                 "type": "string"
    //                             },
    //                             "state_name": {
    //                                 "type": "string"
    //                             }
    //                         },
    //                         "required": [
    //                             "school_id",
    //                             "school_name",
    //                             "cluster_id",
    //                             "cluster_name",
    //                             "block_id",
    //                             "block_name",
    //                             "district_id",
    //                             "district_name",
    //                             "state_id",
    //                             "state_name"
    //                         ]
    //                     }
    //                 }
    //             },
    //             "required": [
    //                 "dimension_name",
    //                 "dimension"
    //             ]
    //         }
    //     }
    //     let result = {
    //         "code": 400, "error": 'One/more invalid required fields'
    //     }
    //
    //     expect(await service.createDimension(inputData)).toStrictEqual(result)
    // });
    //
    // it('Dimension Name already exists', async () => {
    //     let inputData = {
    //         "ingestion_type": "dimension",
    //         "dimension_name": "dimension",
    //         "input": {
    //             "type": "object",
    //             "properties": {
    //                 "dimension_name": {
    //                     "type": "string"
    //                 },
    //                 "dimension": {
    //                     "type": "array",
    //                     "items": {
    //                         "type": "object",
    //                         "properties": {
    //                             "school_id": {
    //                                 "type": "string"
    //                             },
    //                             "school_name": {
    //                                 "type": "string"
    //                             },
    //                             "cluster_id": {
    //                                 "type": "string"
    //                             },
    //                             "cluster_name": {
    //                                 "type": "string"
    //                             },
    //                             "block_id": {
    //                                 "type": "string"
    //                             },
    //                             "block_name": {
    //                                 "type": "string"
    //                             },
    //                             "district_id": {
    //                                 "type": "string"
    //                             },
    //                             "district_name": {
    //                                 "type": "string"
    //                             },
    //                             "state_id": {
    //                                 "type": "string"
    //                             },
    //                             "state_name": {
    //                                 "type": "string"
    //                             }
    //                         },
    //                         "required": [
    //                             "school_id",
    //                             "school_name",
    //                             "cluster_id",
    //                             "cluster_name",
    //                             "block_id",
    //                             "block_name",
    //                             "district_id",
    //                             "district_name",
    //                             "state_id",
    //                             "state_name"
    //                         ]
    //                     }
    //                 }
    //             },
    //             "required": [
    //                 "dimension_name",
    //                 "dimension"
    //             ]
    //         }
    //
    //     }
    //     let result = {
    //         "code": 400, "error": "Dimension name already exists"
    //     };
    //     expect(await service.createDimension(inputData)).toStrictEqual(result)
    // });
    //
    // it('Duplicate dimension not allowed', async () => {
    //     let inputData = {
    //         "ingestion_type": "dimension",
    //         "dimension_name": "dimension",
    //         "input": {
    //             "type": "object",
    //             "properties": {
    //                 "dimension_name": {
    //                     "type": "string"
    //                 },
    //                 "dimension": {
    //                     "type": "array",
    //                     "items": {
    //                         "type": "object",
    //                         "properties": {
    //                             "school_id": {
    //                                 "type": "string"
    //                             },
    //                             "school_name": {
    //                                 "type": "string"
    //                             },
    //                             "cluster_id": {
    //                                 "type": "string"
    //                             },
    //                             "cluster_name": {
    //                                 "type": "string"
    //                             },
    //                             "block_id": {
    //                                 "type": "string"
    //                             },
    //                             "block_name": {
    //                                 "type": "string"
    //                             },
    //                             "district_id": {
    //                                 "type": "string"
    //                             },
    //                             "district_name": {
    //                                 "type": "string"
    //                             },
    //                             "state_id": {
    //                                 "type": "string"
    //                             },
    //                             "state_name": {
    //                                 "type": "string"
    //                             }
    //                         },
    //                         "required": [
    //                             "school_id",
    //                             "school_name",
    //                             "cluster_id",
    //                             "cluster_name",
    //                             "block_id",
    //                             "block_name",
    //                             "district_id",
    //                             "district_name",
    //                             "state_id",
    //                             "state_name"
    //                         ]
    //                     }
    //                 }
    //             },
    //             "required": [
    //                 "dimension_name",
    //                 "dimension"
    //             ]
    //         }
    //
    //     }
    //     let result = {
    //         "code": 400, "error": "Duplicate dimension not allowed"
    //     }
    //
    //     expect(await service.createDimension(inputData)).toStrictEqual(result)
    // });
    //
    // it('dimesnsion created successfully', async () => {
    //     let result = {
    //         "code": 200,
    //         "message": "Dimension spec created successfully",
    //         "dimension_name": "dimensionsssss",
    //         "pid": 1
    //     };
    //     expect(await service.createDimension(inputData)).toStrictEqual(result)
    // });
    //
    // it('Unable to insert into spec table', async () => {
    //
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce([{}])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([])
    //     };
    //
    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [DimensionService, DataSource, GenericFunction,
    //             {
    //                 provide: DimensionService,
    //                 useClass: DimensionService
    //             },
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //         ],
    //
    //     }).compile();
    //
    //     let localService: DimensionService = module.get<DimensionService>(DimensionService);
    //     let result = {"code": 400, "error": "Unable to insert into spec table"};
    //     expect(await localService.createDimension(inputData)).toStrictEqual(result)
    // });
    //
    // it('Unable to insert into spec pipeline table', async () => {
    //
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce([{pid: 1}]).mockReturnValueOnce([{}])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([]).mockReturnValueOnce([])
    //     };
    //
    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [DimensionService, DataSource, GenericFunction,
    //             {
    //                 provide: DimensionService,
    //                 useClass: DimensionService
    //             },
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //         ],
    //
    //     }).compile();
    //
    //     let localService: DimensionService = module.get<DimensionService>(DimensionService);
    //     let result = {"code": 400, "error": "Unable to insert into spec pipeline table"};
    //     expect(await localService.createDimension(inputData)).toStrictEqual(result)
    // });
});
