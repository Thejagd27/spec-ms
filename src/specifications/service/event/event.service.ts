import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {checkName, insertSchema} from '../../queries/queries';
import {DataSource} from 'typeorm';
import {GenericFunction} from '../genericFunction';
import {masterSchema} from '../../../utils/spec-data';

@Injectable()
export class EventService {
    constructor(@InjectDataSource() private dataSource: DataSource, private specService: GenericFunction) {
    }

    async createEvent(eventDTO) {
        const isValidSchema: any = await this.specService.ajvValidator(masterSchema, eventDTO);
        if (isValidSchema.errors) {
            return {"code": 400, error: isValidSchema.errors}
        } else {
            let queryResult = checkName('program', "EventGrammar");
            queryResult = queryResult.replace('$1', `${eventDTO?.program}`);
            const resultDname: any = await this.dataSource.query(queryResult);
            if (resultDname?.length > 0) {
                return {"code": 400, "error": "Program already exists"};
            } else {
                const queryRunner = this.dataSource.createQueryRunner();
                try {
                    await queryRunner.connect();
                    await queryRunner.startTransaction();
                    let insertQuery = insertSchema(['program', 'schema', '"eventType"', 'name', '"updatedAt"'], 'EventGrammar');
                    insertQuery = insertQuery.replace('$1', `'${eventDTO.program}'`);
                    insertQuery = insertQuery.replace('$2', `'${JSON.stringify(eventDTO.input)}'`);
                    insertQuery = insertQuery.replace('$3', `'EXTERNAL'`);
                    insertQuery = insertQuery.replace('$4', `'${eventDTO.program}'`);
                    insertQuery = insertQuery.replace('$5', 'CURRENT_TIMESTAMP');
                    const insertResult = await queryRunner.query(insertQuery);
                    if (insertResult?.length > 0) {
                        await queryRunner.commitTransaction();
                        return {
                            "code": 200,
                            "message": "Event grammar created successfully",
                            "program": eventDTO.program
                        };
                    } else {
                        await queryRunner.rollbackTransaction();
                        return {"code": 400, "error": "Unable to insert into spec table"};
                    }
                } catch (error) {
                    await queryRunner.rollbackTransaction();
                    console.error('event.service.createEvent: ', error.message);
                    return {"code": 400, "error": "something went wrong"}
                } finally {
                    await queryRunner.release();
                }
            }
        }
    }
}
