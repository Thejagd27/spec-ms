import {pipelineDto} from 'src/specifications/dto/specData.dto';
import {Test, TestingModule} from '@nestjs/testing';
import {DataSource} from 'typeorm';
import {GenericFunction} from '../genericFunction';
import {HttpCustomService} from '../HttpCustomService';
import {PipelineService} from './pipeline.service';

describe('PipelineService', () => {
    let service: PipelineService;
    const mockHttpservice = {
        post: jest.fn().mockReturnValueOnce({data: {component: {id: 2}}}).mockReturnValue('response'),
        put: jest.fn(),
        get: jest.fn().mockReturnValueOnce({data: {component: {id: 1}}}).mockReturnValueOnce({
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
        }).mockReturnValueOnce({data: {component: {id: 1}}}).mockReturnValueOnce({
            data: {
                processGroupFlow: {
                    flow: {
                        processGroups: [{
                            component: {
                                id: 123,
                                name: "abc"
                            }
                        }]
                    }
                }
            }
        }).mockReturnValueOnce({data: {component: {id: 3}}}).mockReturnValueOnce({data: {processGroupFlow: {id: 4}}}).mockReturnValueOnce({data: {processGroupFlow: {id: 5}}})
            .mockReturnValueOnce({data: {processGroupFlow: {id: 6}}}).mockReturnValueOnce({data: {processGroupFlow: {id: 7}}})
            .mockReturnValueOnce({
                data: {
                    processGroupFlow: {
                        flow: {
                            processors: [{
                                component: {
                                    name: "generateFlowFile",
                                    id: 1
                                }
                            }, {component: {name: "pythonCode", id: 2}},
                                {component: {name: "successLogMessage", id: 3}}, {
                                    component: {
                                        name: "failedLogMessage",
                                        id: 4
                                    }
                                }]
                        }
                    }
                }
            })
            .mockReturnValueOnce({
                data: {
                    processGroupFlow: {
                        flow: {
                            processors: [{
                                component: {
                                    name: "generateFlowFile",
                                    id: 1
                                }
                            }, {component: {name: "pythonCode", id: 2}},
                                {component: {name: "successLogMessage", id: 3}}, {
                                    component: {
                                        name: "failedLogMessage",
                                        id: 4
                                    }
                                }]
                        }
                    }
                }
            })
            .mockReturnValueOnce({
                data: {
                    processGroupFlow: {
                        flow: {
                            processors: [{
                                component: {
                                    name: "generateFlowFile",
                                    id: 1
                                }
                            }, {component: {name: "pythonCode", id: 2}},
                                {component: {name: "successLogMessage", id: 3}}, {
                                    component: {
                                        name: "failedLogMessage",
                                        id: 4
                                    }
                                }]
                        }
                    }
                }
            })
            .mockReturnValueOnce({
                data: {
                    processGroupFlow: {
                        flow: {
                            processors: [{
                                component: {
                                    name: "generateFlowFile",
                                    id: 1
                                }
                            }, {component: {name: "pythonCode", id: 2}},
                                {component: {name: "successLogMessage", id: 3}}, {
                                    component: {
                                        name: "failedLogMessage",
                                        id: 4
                                    }
                                }]
                        }
                    }
                }
            }).mockReturnValue({
                data: {
                    processGroupFlow: {
                        id: 1,
                        flow: {
                            processors: [{
                                component: {
                                    name: "generateFlowFile",
                                    id: 1
                                },
                                revision: {
                                    version: 1.1
                                }
                            }, {
                                component: {name: "pythonCode", id: 2},
                                revision: {
                                    version: 1.1
                                }
                            },
                                {
                                    component: {name: "successLogMessage", id: 3},
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
            })
    };

    const mockTransacation = {
        createQueryRunner: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            release: jest.fn(),
            rollbackTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            query: jest.fn().mockReturnValueOnce([{pid: 1}])
        })),
        query: jest.fn().mockReturnValueOnce([{length: 1}])
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
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

        service = module.get<PipelineService>(PipelineService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('pipeline Name already exists', async () => {
        let inputData = {
            "pipeline_type": "ingest_to_db",
            "pipeline_name": "student_attendance_by_class",
            "pipeline": [
                {
                    "event_name": "student_attendance",
                    "dataset_name": "student_attendance_by_class",
                    "dimension_name": "student_attendance",
                    "transformer_name": "student_attendance_by_class.py"

                }
            ]
        };
        let result = {
            "code": 400, "error": "Pipeline name already exists"
        };
        expect(await service.createSpecPipeline(inputData)).toStrictEqual(result)

    });

    it('Invalid Pipeline Type', async () => {
        let inputData = {
            "pipeline_type": "",
            "pipeline_name": "student_attendance_by_class",
            "pipeline": [
                {
                    "event_name": "student_attendance",
                    "dataset_name": "student_attendance_by_class",
                    "dimension_name": "student_attendance",
                    "transformer_name": "student_attendance_by_class.py"

                }
            ]
        };
        let result = {code: 400, error: [
            {
                "instancePath": "/pipeline_type",
                "schemaPath": "#/properties/pipeline_type/enum",
                "keyword": "enum",
                "params": {
                    "allowedValues": [
                        "ingest_to_db",
                        "dimension_to_db",
                        "dataset_to_db"
                    ]
                },
                "message": "must be equal to one of the allowed values"
            }
        ]};
        expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    });

    // it('dimension_to_db Pipeline Type', async () => {
    //     let inputData = {
    //         "pipeline_type": "dimension_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {
    //         "code": 400, "error": "Pipeline name already exists"
    //     };
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // });

    // it('dataset_to_db Pipeline Type', async () => {
    //     let inputData = {
    //         "pipeline_type": "dataset_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {
    //         "code": 400, "error": "Pipeline name already exists"
    //     };
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // });

    it('Validation Error', async () => {
        let inputData = {
            "pipeline_type": "dataset_to_db",
            "pipeline_name": "",
            "pipeline": [
                {
                    "event_name": "student_attendance",
                    "dataset_name": "student_attendance_by_class",
                    "dimension_name": "student_attendance",
                    "transformer_name": "student_attendance_by_class.py"

                }
            ]
        };
        let result = {
            code: 400, error: [
                {
                    "instancePath": "/pipeline_name",
                    "schemaPath": "#/properties/pipeline_name/shouldnotnull",
                    "keyword": "shouldnotnull",
                    "params": {},
                    "message": "must pass \"shouldnotnull\" keyword validation"
                }
            ]
        };
        expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    });

    // it('Transformer not found', async () => {
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce({pid: 1}).mockReturnValueOnce([])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([{length: 1}])
    //     };

    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //             {
    //                 provide: HttpCustomService,
    //                 useValue: mockHttpservice
    //             },
    //         ]
    //     }).compile();

    //     service = module.get<PipelineService>(PipelineService);

    //     let inputData = {
    //         "pipeline_type": "dataset_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_classasdasd.py"

    //             }
    //         ]
    //     };
    //     let result = {code: 400, error: 'Transformer not found'};
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // });

    // it('Cannot find dimension_name in ingest_to_db', async () => {
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce({pid: 1})
    //                 .mockReturnValueOnce([{pid: 1}]).mockReturnValueOnce([{pid: 1}])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([{length: 1}])
    //     };

    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //             {
    //                 provide: HttpCustomService,
    //                 useValue: mockHttpservice
    //             },
    //         ]
    //     }).compile();

    //     service = module.get<PipelineService>(PipelineService);

    //     let inputData = {
    //         "pipeline_type": "ingest_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {code: 400, error: 'Cannot find dimension name'};
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // });

    // it('Cannot find dataset_name in ingest_to_db', async () => {
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce({pid: 1})
    //                 .mockReturnValueOnce([{pid: 1}])
    //                 .mockReturnValueOnce([{pid: 1, dimension_pid: 1}])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([{length: 1}])
    //     };

    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //             {
    //                 provide: HttpCustomService,
    //                 useValue: mockHttpservice
    //             },
    //         ]
    //     }).compile();

    //     service = module.get<PipelineService>(PipelineService);

    //     let inputData = {
    //         "pipeline_type": "ingest_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {code: 400, error: 'Cannot find dataset name'};
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // });

    // it('Cannot find dimension_name in dimension_to_db', async () => {
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce({pid: 1})
    //                 .mockReturnValueOnce([{pid: 1}]).mockReturnValueOnce([{pid: 1}])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([{length: 1}])
    //     };

    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //             {
    //                 provide: HttpCustomService,
    //                 useValue: mockHttpservice
    //             },
    //         ]
    //     }).compile();

    //     service = module.get<PipelineService>(PipelineService);

    //     let inputData = {
    //         "pipeline_type": "dimension_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {code: 400, error: 'Cannot find dimension name'};
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // });

    // it('Cannot find dataset_name in dataset_to_db', async () => {
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce({pid: 1})
    //                 .mockReturnValueOnce([{pid: 1}])
    //                 .mockReturnValueOnce([{pid: 1, dimension_pid: 1}])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([{length: 1}])
    //     };

    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //             {
    //                 provide: HttpCustomService,
    //                 useValue: mockHttpservice
    //             },
    //         ]
    //     }).compile();

    //     service = module.get<PipelineService>(PipelineService);

    //     let inputData = {
    //         "pipeline_type": "dataset_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {code: 400, error: 'Cannot find dataset name'};
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // });

    // it('No Pipeline Found', async () => {
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce({pid: 1})
    //                 .mockReturnValueOnce([{pid: 1}])
    //                 .mockReturnValueOnce([{pid: 1, dataset_pid: 1}]).mockReturnValueOnce([])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([{length: 1}]),

    //     };

    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //             {
    //                 provide: HttpCustomService,
    //                 useValue: mockHttpservice
    //             },
    //         ]
    //     }).compile();

    //     service = module.get<PipelineService>(PipelineService);

    //     let inputData = {
    //         "pipeline_type": "dataset_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {code: 400, error: 'No Pipeline Found'};
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // });

    // it('Processor Group Running Successfully Already Exists', async () => {
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce({pid: 1})
    //                 .mockReturnValueOnce([{pid: 1}])
    //                 .mockReturnValueOnce([{pid: 1, dataset_pid: 1}])
    //                 .mockReturnValueOnce([{
    //                     "transformer_file": "student_attendance_by_class.py",
    //                     "event_name": "student_attendance",
    //                     "dataset_name": "student_attendance_by_class"
    //                 }])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([{length: 1}]),
    //         get: jest.fn().mockReturnValueOnce({data: {component: {id: 1}}})
    //             .mockReturnValueOnce({
    //                 data: {
    //                     processGroupFlow: {
    //                         flow: {
    //                             processGroups: [{
    //                                 component: {
    //                                     id: 123,
    //                                     name: "student_attendance_by_class"
    //                                 }
    //                             }]
    //                         }
    //                     }
    //                 }
    //             }),
    //         put: jest.fn()
    //     };

    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //             {
    //                 provide: HttpCustomService,
    //                 useValue: mockTransaction
    //             },
    //         ]
    //     }).compile();

    //     service = module.get<PipelineService>(PipelineService);

    //     let inputData = {
    //         "pipeline_type": "dataset_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {code: 200, message: 'Processor group created successfully'};
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // }, 70000);

    // it('Processor Group Running Successfully', async () => {
    //     const mockTransaction = {
    //         createQueryRunner: jest.fn().mockImplementation(() => ({
    //             connect: jest.fn(),
    //             startTransaction: jest.fn(),
    //             release: jest.fn(),
    //             rollbackTransaction: jest.fn(),
    //             commitTransaction: jest.fn(),
    //             query: jest.fn().mockReturnValueOnce({pid: 1})
    //                 .mockReturnValueOnce([{pid: 1}])
    //                 .mockReturnValueOnce([{pid: 1, dataset_pid: 1}])
    //                 .mockReturnValueOnce([{
    //                     "transformer_file": "student_attendance_by_class.py",
    //                     "event_name": "student_attendance",
    //                     "dataset_name": "student_attendance_by_class"
    //                 }])
    //         })),
    //         query: jest.fn().mockReturnValueOnce([{length: 1}]),
    //         get: jest.fn().mockReturnValueOnce({data: {component: {id: 1}}})
    //             .mockReturnValueOnce({
    //                 data: {
    //                     processGroupFlow: {
    //                         flow: {
    //                             processGroups: [{
    //                                 component: {
    //                                     id: 123,
    //                                     name: "asd"
    //                                 }
    //                             }]
    //                         }
    //                     }
    //                 }
    //             }).mockReturnValueOnce({data: {component: {id: 1}}})
    //             .mockReturnValue({
    //                 data: {
    //                     processGroupFlow: {
    //                         id: 1,
    //                         flow: {
    //                             processors: [{
    //                                 component: {
    //                                     name: "generateFlowFile",
    //                                     id: 1
    //                                 },
    //                                 revision: {
    //                                     version: 1.1
    //                                 }
    //                             }, {
    //                                 component: {name: "pythonCode", id: 2},
    //                                 revision: {
    //                                     version: 1.1
    //                                 }
    //                             },
    //                                 {
    //                                     component: {name: "successLogMessage", id: 3},
    //                                     revision: {
    //                                         version: 1.1
    //                                     }
    //                                 }, {
    //                                     component: {
    //                                         name: "failedLogMessage",
    //                                         id: 4
    //                                     },
    //                                     revision: {
    //                                         version: 1.1
    //                                     }
    //                                 }]
    //                         }
    //                     }
    //                 }
    //             }),
    //         post: jest.fn().mockReturnValueOnce({data: {component: {id: 2}}}),
    //         put: jest.fn()
    //     };

    //     const module: TestingModule = await Test.createTestingModule({
    //         providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
    //             {
    //                 provide: DataSource,
    //                 useValue: mockTransaction
    //             },
    //             {
    //                 provide: GenericFunction,
    //                 useClass: GenericFunction
    //             },
    //             {
    //                 provide: HttpCustomService,
    //                 useValue: mockTransaction
    //             },
    //         ]
    //     }).compile();

    //     service = module.get<PipelineService>(PipelineService);

    //     let inputData = {
    //         "pipeline_type": "dataset_to_db",
    //         "pipeline_name": "student_attendance_by_class",
    //         "pipeline": [
    //             {
    //                 "event_name": "student_attendance",
    //                 "dataset_name": "student_attendance_by_class",
    //                 "dimension_name": "student_attendance",
    //                 "transformer_name": "student_attendance_by_class.py"

    //             }
    //         ]
    //     };
    //     let result = {code: 200, message: 'Processor group created successfully'};
    //     expect(await service.createSpecPipeline(inputData)).toStrictEqual(result);
    // }, 70000);

    it('Exception', async () => {

        const mockTransaction = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                query: jest.fn().mockReturnValueOnce({pid: 1})
                    .mockReturnValueOnce([{pid: 1}]).mockImplementation(() => {
                        throw Error("exception test")
                    })
            })),
            query: jest.fn().mockReturnValueOnce([{length: 1}]),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
                {
                    provide: DataSource,
                    useValue: mockTransaction
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

        service = module.get<PipelineService>(PipelineService);
        let inputData = {
            "pipeline_type": "dataset_to_db",
            "pipeline_name": "student_attendance_by_class",
            "pipeline": [
                {
                    "event_name": "student_attendance",
                    "dataset_name": "student_attendance_by_class",
                    "dimension_name": "student_attendance",
                    "transformer_name": "student_attendance_by_class.py"

                }
            ]
        };

        let resultOutput = "Error: exception test";

        try {
            await service.createSpecPipeline(inputData);
        } catch (e) {
            expect(e.message).toEqual(resultOutput);
        }
    });

    it('addProcessorGroup', async () => {

        const mockTransaction = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                query: jest.fn().mockReturnValueOnce({pid: 1})
                    .mockReturnValueOnce([{pid: 1}]).mockImplementation(() => {
                        throw Error("exception test")
                    })
            })),
            query: jest.fn().mockReturnValueOnce([{length: 1}]),
            get: jest.fn().mockReturnValueOnce({data: {component: {id: 1}}}),
            post: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
                {
                    provide: DataSource,
                    useValue: mockTransaction
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

        service = module.get<PipelineService>(PipelineService);

        let resultOutput = "Failed to create the processor group";

        try {
            await service.addProcessorGroup("student_attendance_by_class");
        } catch (e) {
            expect(e.message).toEqual(resultOutput);
        }
    });

    it('addProcessor Failed', async () => {

        const mockTransaction = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                query: jest.fn().mockReturnValueOnce({pid: 1})
                    .mockReturnValueOnce([{pid: 1}]).mockImplementation(() => {
                        throw Error("exception test")
                    })
            })),
            query: jest.fn().mockReturnValueOnce([{length: 1}]),
            get: jest.fn().mockReturnValue({
                data: {
                    processGroupFlow: {
                        id: 1,
                        flow: {
                            processors: [{
                                component: {
                                    name: "generateFlowFile",
                                    id: 1
                                },
                                revision: {
                                    version: 1.1
                                }
                            }, {
                                component: {name: "pythonCode", id: 2},
                                revision: {
                                    version: 1.1
                                }
                            },
                                {
                                    component: {name: "successLogMessage", id: 3},
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
            post: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
                {
                    provide: DataSource,
                    useValue: mockTransaction
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

        service = module.get<PipelineService>(PipelineService);

        let resultOutput = "Failed to create the processor";

        try {
            await service.addProcessor("student_attendance_by_class", "asd", 1);
        } catch (e) {
            expect(e.message).toEqual(resultOutput);
        }
    });

    it('addProcessor Success', async () => {

        const mockTransaction = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                query: jest.fn().mockReturnValueOnce({pid: 1})
                    .mockReturnValueOnce([{pid: 1}]).mockImplementation(() => {
                        throw Error("exception test")
                    })
            })),
            query: jest.fn().mockReturnValueOnce([{length: 1}]),
            get: jest.fn().mockReturnValue({
                data: {
                    processGroupFlow: {
                        id: 1,
                        flow: {
                            processors: [{
                                component: {
                                    name: "generateFlowFile",
                                    id: 1
                                },
                                revision: {
                                    version: 1.1
                                }
                            }, {
                                component: {name: "pythonCode", id: 2},
                                revision: {
                                    version: 1.1
                                }
                            },
                                {
                                    component: {name: "successLogMessage", id: 3},
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
            post: jest.fn().mockReturnValueOnce({data: {component: {id: 2}}})
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [PipelineService, DataSource, GenericFunction, HttpCustomService,
                {
                    provide: DataSource,
                    useValue: mockTransaction
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

        service = module.get<PipelineService>(PipelineService);

        let resultOutput = "Successfully created the processor";

        try {
            await service.addProcessor("student_attendance_by_class", "asd", 1);
        } catch (e) {
            expect(e.message).toEqual(resultOutput);
        }
    });
});
