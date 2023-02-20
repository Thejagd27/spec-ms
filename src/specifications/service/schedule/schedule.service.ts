import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { scheduleDto } from '../../dto/specData.dto';
import {  checkRecordExists, getPipelineSpec, insertIntoSchedule, updateSchedule } from '../../queries/queries';
import { scheduleSchema } from '../../../utils/spec-data';
import { DataSource } from 'typeorm';
import { GenericFunction } from '../genericFunction';
import { PipelineService } from '../pipeline/pipeline.service'
var cronValidator = require('cron-expression-validator');

@Injectable()
export class ScheduleService {
    constructor(@InjectDataSource() private dataSource: DataSource, private specService: GenericFunction, private pipelineService: PipelineService) {
    }

    async schedulePipeline(scheduleData: scheduleDto) {
        let isValidSchema: any;
        let transformerName: string = "";
        const queryRunner = this.dataSource.createQueryRunner();
        isValidSchema = await this.specService.ajvValidator(scheduleSchema, scheduleData);
        if (isValidSchema.errors) {
            return { code: 400, error: isValidSchema.errors }
        }
        else {
            let result = cronValidator.isValidCronExpression(scheduleData.scheduled_at, { error: true });
            if (result.errorMessage) {
                return { code: 400, error: result.errorMessage }
            }
            else {
                let queryResult = getPipelineSpec(scheduleData?.pipeline_name);
                const resultPipeName = await this.dataSource.query(queryResult);
                if (resultPipeName.length === 1) {
                    transformerName = resultPipeName[0]?.transformer_file;
                    await queryRunner.connect();
                    await queryRunner.startTransaction();
                    try {
                        const result = await this.pipelineService.CreatePipeline(transformerName, scheduleData?.pipeline_name, scheduleData?.scheduled_at)
                        if (result?.code === 200) {
                            let checkPipelinePid = checkRecordExists('pipeline_pid', 'schedule');
                            checkPipelinePid = checkPipelinePid.replace('$1', resultPipeName[0].pid);
                            const recordsCount = await queryRunner.query(checkPipelinePid);
                            if (recordsCount?.length > 0) {
                                let updateScheduleQry = updateSchedule(scheduleData.scheduled_at, recordsCount[0].pid)
                                let updateResult = await queryRunner.query(updateScheduleQry);
                                if (updateResult.length > 0) {
                                    return { code: 200, "message": "Successfully updated the schedule" }
                                }
                                else {
                                    return { code: 400, "error": "Failed to update the schedule" };
                                }
                            }
                            else {
                                const queryStr = insertIntoSchedule(['pipeline_pid', 'scheduled_at'], [resultPipeName[0].pid, scheduleData?.scheduled_at]);
                                let resultSchedule = await queryRunner.query(queryStr);
                                if (resultSchedule[0]?.pid) {
                                    await queryRunner.commitTransaction();
                                    return { code: 200, message: `${scheduleData.pipeline_name} has been successfully scheduled` }
                                }
                                else {
                                    await queryRunner.rollbackTransaction();
                                    return { code: 400, error: "Could not insert into schedule table" };
                                }
                            }
                        }
                        else {
                            await queryRunner.rollbackTransaction();
                            return { code: 400, error: `Could not create schedule for ${scheduleData.pipeline_name}` }
                        }

                    } catch (error) {
                        await queryRunner.rollbackTransaction();
                        return { code: 400, error: "Something went wrong" }
                    } finally {
                        await queryRunner.release();
                    }


                }
                else {
                    return { code: 400, error: "Pipeline name not Found" }
                }
            }
        }
    }
}
