import {Test, TestingModule} from '@nestjs/testing';
import {connect} from 'http2';
import {async} from 'rxjs';
import {Connection, DataSource, QueryRunner} from 'typeorm';
import {GenericFunction} from '../genericFunction';
import {EventService} from './event.service';

let inputData = {
    "ingestion_type": "event",
    "event_name": "student_attendanceggee1",
    "input": {
        "type": "object",
        "properties": {
            "event_name": {
                "type": "string"
            },
            "event": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "date": {
                            "type": "string"
                        },
                        "school_id": {
                            "type": "string"
                        },
                        "grade": {
                            "type": "string"
                        },
                        "total_students": {
                            "type": "number"
                        },
                        "students_attendance_marked": {
                            "type": "number"
                        }
                    },
                    "required": [
                        "date",
                        "school_id",
                        "grade",
                        "total_students",
                        "students_attendance_marked"
                    ]
                }
            }
        },
        "required": [
            "event_name",
            "event"
        ]
    }
};

describe('EventService', () => {
    let service: EventService;

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
            providers: [EventService, DataSource, GenericFunction,
                {
                    provide: EventService,
                    useClass: EventService
                },
                {
                    provide: DataSource,
                    useValue: mockTransacation
                },
                {
                    provide: GenericFunction,
                    useClass: GenericFunction
                }
            ],
        }).compile();

        service = module.get<EventService>(EventService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('validation', async () => {
    //     let eventData = {
    //         "ingestion_type": "event",
    //         // "event_name": "student_attendance", // removed event
    //         "input": {
    //             "type": "object",
    //             "properties": {
    //                 "event_name": {
    //                     "type": "string"
    //                 },
    //                 "event": {
    //                     "type": "array",
    //                     "items": {
    //                         "type": "object",
    //                         "properties": {
    //                             "date": {
    //                                 "type": "string"
    //                             },
    //                             "school_id": {
    //                                 "type": "number"
    //                             },
    //                             "grade": {
    //                                 "type": "number"
    //                             },
    //                             "total_students": {
    //                                 "type": "number"
    //                             },
    //                             "students_attendance_marked": {
    //                                 "type": "number"
    //                             }
    //                         },
    //                         "required": [
    //                             "date",
    //                             "school_id",
    //                             "grade",
    //                             "total_students",
    //                             "students_attendance_marked"
    //                         ]
    //                     }
    //                 }
    //             },
    //             "required": [
    //                 "event_name",
    //                 "event"
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
    //                     "missingProperty": "event_name"
    //                 },
    //                 "message": "must have required property 'event_name'"
    //             }
    //         ]
    //     }
    //     expect(await service.createEvent(eventData)).toStrictEqual(resultData)
    // });
    //
    // it('invalid request body', async () => {
    //     let inputData = {
    //         "ingestion_type": "event",
    //         "event_name": "student_attendance",
    //         "input": {
    //             "type": "object",
    //             "properties": {
    //                 "event_name": {
    //                     "type": "string"
    //                 },
    //                 "event": {
    //                     "type": "array",
    //                     "items": {
    //                         "type": "object",
    //                         "properties": {
    //                             "date": {
    //                                 "type": "string"
    //                             },
    //                             // "school_id": {
    //                             //   "type": "number" passing invalid req
    //                             // },
    //                             "grade": {
    //                                 "type": "number"
    //                             },
    //                             "total_students": {
    //                                 "type": "number"
    //                             },
    //                             "students_attendance_marked": {
    //                                 "type": "number"
    //                             }
    //                         },
    //                         "required": [
    //                             "date",
    //                             "school_id",
    //                             "grade",
    //                             "total_students",
    //                             "students_attendance_marked"
    //                         ]
    //                     }
    //                 }
    //             },
    //             "required": [
    //                 "event_name",
    //                 "event"
    //             ]
    //         }
    //     }
    //     let result = {
    //         "code": 400, "error": 'One/more invalid required fields'
    //     }
    //
    //     expect(await service.createEvent(inputData)).toStrictEqual(result)
    // });
    //
    // it('Event Name already exists', async () => {
    //     let inputData = {
    //         "ingestion_type": "event",
    //         "event_name": "student_attendance",
    //         "input": {
    //             "type": "object",
    //             "properties": {
    //                 "event_name": {
    //                     "type": "string"
    //                 },
    //                 "event": {
    //                     "type": "array",
    //                     "items": {
    //                         "type": "object",
    //                         "properties": {
    //                             "date": {
    //                                 "type": "string"
    //                             },
    //                             "school_id": {
    //                                 "type": "number"
    //                             },
    //                             "grade": {
    //                                 "type": "number"
    //                             },
    //                             "total_students": {
    //                                 "type": "number"
    //                             },
    //                             "students_attendance_marked": {
    //                                 "type": "number"
    //                             }
    //                         },
    //                         "required": [
    //                             "date",
    //                             "school_id",
    //                             "grade",
    //                             "total_students",
    //                             "students_attendance_marked"
    //                         ]
    //                     }
    //                 }
    //             },
    //             "required": [
    //                 "event_name",
    //                 "event"
    //             ]
    //         }
    //     }
    //     let result = {
    //         "code": 400, "error": "Event name already exists"
    //     }
    //     expect(await service.createEvent(inputData)).toStrictEqual(result)
    // });
    //
    // it('Duplicate event not allowed', async () => {
    //     let inputData = {
    //         "ingestion_type": "event",
    //         "event_name": "student_attendance",
    //         "input": {
    //             "type": "object",
    //             "properties": {
    //                 "event_name": {
    //                     "type": "string"
    //                 },
    //                 "event": {
    //                     "type": "array",
    //                     "items": {
    //                         "type": "object",
    //                         "properties": {
    //                             "date": {
    //                                 "type": "string"
    //                             },
    //                             "school_id": {
    //                                 "type": "number"
    //                             },
    //                             "grade": {
    //                                 "type": "number"
    //                             },
    //                             "total_students": {
    //                                 "type": "number"
    //                             },
    //                             "students_attendance_marked": {
    //                                 "type": "number"
    //                             }
    //                         },
    //                         "required": [
    //                             "date",
    //                             "school_id",
    //                             "grade",
    //                             "total_students",
    //                             "students_attendance_marked"
    //                         ]
    //                     }
    //                 }
    //             },
    //             "required": [
    //                 "event_name",
    //                 "event"
    //             ]
    //         }
    //     }
    //     let result = {
    //         "code": 400, "error": "Duplicate event not allowed"
    //     }
    //
    //     expect(await service.createEvent(inputData)).toStrictEqual(result)
    // });
    //
    // it('event created successfully', async () => {
    //     let result = {
    //         "code": 200,
    //         "message": "Event spec created successfully",
    //         "event_name": "student_attendanceggee1",
    //         "pid": 1
    //     };
    //     expect(await service.createEvent(inputData)).toStrictEqual(result)
    //
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
    //         providers: [EventService, DataSource, GenericFunction,
    //             {
    //                 provide: EventService,
    //                 useClass: EventService
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
    //     let localService: EventService = module.get<EventService>(EventService);
    //     let result = {"code": 400, "error": "Unable to insert into spec table"};
    //     expect(await localService.createEvent(inputData)).toStrictEqual(result)
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
    //         providers: [EventService, DataSource, GenericFunction,
    //             {
    //                 provide: EventService,
    //                 useClass: EventService
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
    //     let localService: EventService = module.get<EventService>(EventService);
    //     let result = {"code": 400, "error": "Unable to insert into pipeline table"};
    //     expect(await localService.createEvent(inputData)).toStrictEqual(result)
    // });
});
