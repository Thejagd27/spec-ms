import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {checkDuplicacy, checkName, insertPipeline, insertSchema} from '../../queries/queries';
import {DataSource} from 'typeorm';
import {GenericFunction} from '../genericFunction';
import {eventSchemaData} from '../../../utils/spec-data';
import {eventResponse} from '../../dto/specData.dto';

@Injectable()
export class EventService {
    constructor(@InjectDataSource() private dataSource: DataSource, private specService: GenericFunction) {
    }

    async createEvent(eventDTO) {
        let newObj = this.specService.convertKeysToLowerCase(eventDTO);
        const isValidSchema: any = await this.specService.ajvValidator(eventSchemaData, newObj);
        if (isValidSchema.errors) {
            return {"code": 400, error: isValidSchema.errors}
        } else {
            let response: eventResponse = await this.validateRequiredFields(isValidSchema);
            if (response.code == 400) {
                return {
                    code: 400,
                    error: response.error
                }
            } else {
                let queryResult = checkName('event_name', "event");
                queryResult = queryResult.replace('$1', `${eventDTO?.event_name.toLowerCase()}`);
                const resultDname:any = await this.dataSource.query(queryResult);
                if (resultDname?.length > 0) {
                    return {"code": 400, "error": "Event name already exists"};
                }
                else {
                    let values = newObj?.input?.properties?.event?.items?.properties;
                    let duplicacyQuery = checkDuplicacy(['event_name', 'event_data'], 'event', ['event_data', "'input'->'properties'->'event'->'items'->'properties'"], JSON.stringify(values));
                    const result:any = await this.dataSource.query(duplicacyQuery);
                    if (result?.length == 0) { //If there is no record in the DB then insert the first schema
                        const queryRunner = this.dataSource.createQueryRunner();
                        try {
                            await queryRunner.connect();
                            await queryRunner.startTransaction();                       
                            let insertQuery = insertSchema(['event_name', 'event_data'], 'event');
                            insertQuery = insertQuery.replace('$1', `'${eventDTO.event_name.toLowerCase()}'`);
                            insertQuery = insertQuery.replace('$2', `'${JSON.stringify(newObj)}'`);
                            const insertResult = await queryRunner.query(insertQuery);                          
                            if (insertResult[0].pid) {
                                let event_pid = insertResult[0].pid;
                                const pipeline_name = eventDTO.event_name.toLowerCase() + '_pipeline';
                                let insertPipeLineQuery = insertPipeline(['pipeline_name', 'event_pid'], 'pipeline', [pipeline_name, event_pid]);
                                const insertPipelineResult = await queryRunner.query(insertPipeLineQuery);
                                if (insertPipelineResult[0].pid) {
                                    await queryRunner.commitTransaction();
                                    return {
                                        "code": 200,
                                        "message": "Event spec created successfully",
                                        "event_name": eventDTO.event_name,
                                        "pid": insertResult[0].pid
                                    };
                                }
                                else {
                                    await queryRunner.rollbackTransaction();
                                    return {"code": 400, "error": "Unable to insert into pipeline table"};
                                }
                            }
                            else {
                                await queryRunner.rollbackTransaction();
                                return {"code": 400, "error": "Unable to insert into spec table"};
                            }
                        } catch (error) {
                            await queryRunner.rollbackTransaction();
                            return {"code": 400, "error": "something went wrong"}
                        }
                        finally {
                            await queryRunner.release();
                        }
                    }
                    else {
                        return {"code": 400, "error": "Duplicate event not allowed"}
                    }
                }
            }
        }
    }

    async validateRequiredFields(inputData) {
        let responseObj = {
            code: 200,
            error: ""
        };
        if (inputData?.input?.properties?.event?.items?.required && inputData?.input?.properties?.event?.items?.required?.length > 0) {
            inputData?.input?.properties?.event?.items?.required?.map((key) => {
                if (!Object.keys(inputData?.input?.properties?.event?.items?.properties).includes(key)) {
                    responseObj = {
                        "code": 400,
                        "error": 'One/more invalid required fields'
                    }
                }
            })
        }
        return responseObj;
    }
}
