import {DataSource} from "typeorm";
import {InjectDataSource} from "@nestjs/typeorm";
import {GenericFunction} from "../genericFunction";
import {Injectable} from "@nestjs/common";
import {HttpCustomService} from "../HttpCustomService";
import {pipelineDto} from "../../dto/specData.dto";
import {
    PipelineSchemaDatasettoDB,
    PipelineSchemaDimensiontoDB,
    PipelineSchemaIngesttoDB,
    schemaPipeline
} from "../../../utils/spec-data";
import {checkName} from "../../queries/queries";
import {insertIntoSpecPipeline} from '../../queries/queries';
import {ProcessorGroup, processorObjList} from "./pipeline-obj";


@Injectable()
export class PipelineServiceNew {
    nifiUrl: string = process.env.URL;

    constructor(@InjectDataSource() private dataSource: DataSource, private specService: GenericFunction, private http: HttpCustomService) {
    }

    async createSpecPipelineNew(pipelineData: pipelineDto) {
        let isValidSchema: any;
        let PipeStr = pipelineData?.pipeline_type?.toLowerCase();
        let schemavalidator: any = await this.specService.ajvValidator(schemaPipeline, pipelineData);
        if (schemavalidator.errors) {
            return {code: 400, error: schemavalidator.errors}
        } else {
            switch (PipeStr) {
                case 'ingest_to_db':
                    isValidSchema = await this.specService.ajvValidator(PipelineSchemaIngesttoDB, pipelineData);
                    break;
                case 'dimension_to_db':
                    isValidSchema = await this.specService.ajvValidator(PipelineSchemaDimensiontoDB, pipelineData);
                    break;
                case 'dataset_to_db':
                    isValidSchema = await this.specService.ajvValidator(PipelineSchemaDatasettoDB, pipelineData);
                    break;
            }
        }

        if (isValidSchema.errors) {
            return {code: 400, error: isValidSchema.errors}
        } else {
            let queryResult = checkName('pipeline_name', "pipeline");
            queryResult = queryResult.replace('$1', `${pipelineData?.pipeline_name?.toLowerCase()}`);
            const resultPipeName = await this.dataSource.query(queryResult);
            if (resultPipeName.length > 0) {
                return {code: 400, error: "Pipeline name already exists"}
            } else {
                let dataset_name = pipelineData?.pipeline[0]['dataset_name'];
                let dimension_name = pipelineData?.pipeline[0]['dimension_name'];
                let event_name = pipelineData?.pipeline[0]['event_name'];
                let transformer_name = pipelineData?.pipeline[0]['transformer_name'];

                let checkTransformerQuery = checkName('transformer_file', 'transformer');
                checkTransformerQuery = checkTransformerQuery.replace('$1', `${transformer_name}`);
                let checkTransformerResult = await this.dataSource.query(checkTransformerQuery);
                if (checkTransformerResult.length === 0) {
                    return {code: 400, error: 'Transformer not found'}
                }
                const queryRunner = this.dataSource.createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    let insertPipeLineQuery = await insertIntoSpecPipeline(pipelineData?.pipeline_name, PipeStr, dataset_name, dimension_name, event_name, transformer_name);
                    const insertPipelineResult = await queryRunner.query(insertPipeLineQuery);
                    if (insertPipelineResult[0].pid) {
                        if (PipeStr === 'ingest_to_db') {
                            if (insertPipelineResult[0].dimension_pid == null) {
                                await queryRunner.rollbackTransaction();
                                return {code: 400, error: "Cannot find dimension name"}
                            }
                            if (insertPipelineResult[0].dataset_pid == null) {
                                await queryRunner.rollbackTransaction();
                                return {code: 400, error: "Cannot find dataset name"}
                            }
                            if (insertPipelineResult[0].event_pid == null) {
                                await queryRunner.rollbackTransaction();
                                return {code: 400, error: "Cannot find event name"}
                            }
                        } else if (PipeStr === 'dimension_to_db') {
                            if (insertPipelineResult[0].dimension_pid == null) {
                                await queryRunner.rollbackTransaction();
                                return {code: 400, error: "Cannot find dimension name"}
                            }
                        } else {
                            if (insertPipelineResult[0].dataset_pid == null) {
                                await queryRunner.rollbackTransaction();
                                return {code: 400, error: "Cannot find dataset name"}
                            }
                        }
                        const result = await this.CreatePipeline(transformer_name, pipelineData?.pipeline_name?.toLowerCase());
                        if (result.code == 400) {
                            await queryRunner.rollbackTransaction();
                        } else {
                            await queryRunner.commitTransaction();
                        }
                        return result
                    }
                } catch (error) {
                    console.error("Error in spec pipeline ::::", error);
                    await queryRunner.rollbackTransaction();
                    return {code: 400, error: "Something went wrong"};
                } finally {
                    await queryRunner.release();
                }
            }
        }
    }

    async CreatePipeline(transformerName, pipelineName, schedulePeriod = undefined) {
        try {
            if (transformerName && transformerName != "") {
                const transformer_file = transformerName;
                let nifi_root_pg_id, pg_list, pg_source;
                const processor_group_name = pipelineName;
                let data = {};
                let res = await this.http.get(`${this.nifiUrl}/nifi-api/process-groups/root`);
                nifi_root_pg_id = res.data['component']['id'];
                let resp = await this.http.get(`${this.nifiUrl}/nifi-api/flow/process-groups/${nifi_root_pg_id}`);

                pg_list = resp.data;
                let counter = 0;
                let pg_group = pg_list['processGroupFlow']['flow']['processGroups'];
                for (let pg of pg_group) {
                    if (pg.component.name == processor_group_name) {
                        pg_source = pg;
                        counter = counter + 1;
                        data = {
                            "id": pg_source['component']['id'],
                            "state": "STOPPED",  // RUNNING or STOP
                            "disconnectedNodeAcknowledged": false
                        };
                        await this.http.put(`${this.nifiUrl}/nifi-api/flow/process-groups/${pg_source['component']['id']}`, data,);
                        break;
                    }
                }
                if (counter == 0) {
                    let response = await this.addProcessorGroup(processor_group_name);
                    pg_source = response['data'];
                    let processorResponse: any;
                    let connectionProcess: ProcessorGroup[] = [];
                    for (let processorObj of processorObjList) {
                        processorResponse = await this.addProcessor(processorObj.componentName, processorObj.processorName, pg_source['component']['id']);
                        if (processorResponse.id) {
                            processorObj.id = processorResponse.id;
                            if (processorObj.connectToList.length > 0) {
                                connectionProcess.push(processorObj)
                            }
                        } else {
                            throw new Error('No id created for processor ' + processorObj.processorName)
                        }
                        // let flowId = await this.getProcessorSourceId(pg_source['component']['id'], processor.processorName);
                        await this.updateProcessorProperty(pg_source['component']['id'], processorObj.processorName, transformer_file, schedulePeriod);
                    }

                    let toConnection: ProcessorGroup;
                    for (let conProcessor of connectionProcess) {
                        for (let connectTo of conProcessor.connectToList) {
                            toConnection = processorObjList.find(obj => obj.processorName === connectTo.to);
                            if (toConnection) {
                                await this.connect(conProcessor.id, toConnection.id, connectTo.relationship, pg_source['component']['id'])
                            } else {
                                throw new Error('To connection not found ' + connectTo.to)
                            }
                        }
                    }
                    return {
                        code: 200,
                        message: "Processor group created successfully"
                    }
                } else {
                    let result = await this.updateScheduleProcessProperty(processor_group_name, 'generateFlowFile', schedulePeriod);
                    await this.processSleep(5000);
                    data = {
                        "id": pg_source['component']['id'],
                        "state": "RUNNING",  // RUNNING or STOP
                        "disconnectedNodeAcknowledged": false
                    };
                    await this.http.put(`${this.nifiUrl}/nifi-api/flow/process-groups/${pg_source['component']['id']}`, data);
                    if (result.code == 400) {
                        return {
                            code: 400,
                            error: "Could not schedule the processor"
                        }
                    } else {
                        return {
                            code: 200,
                            message: "Processor group created successfully"
                        }
                    }
                }
            } else {
                return {
                    code: 400,
                    error: "Could not find transformer"
                }
            }
        }
        catch (e) {
            console.error('create-pipeline-impl.executeQueryAndReturnResults: ', e.message);
            throw new Error(e);
        }
    }

    async addProcessorGroup(processor_group_name: string) {
        let url = `${this.nifiUrl}/nifi-api/process-groups/root`;
        let result = await this.http.get(url);
        if (result) {
            const nifi_root_pg_id = result.data['component']['id'];
            const minRange = -500;
            const maxRange = 500;
            const x = Math.floor(Math.random() * (maxRange - minRange) + minRange);
            const y = Math.floor(Math.random() * (maxRange - minRange) + minRange);
            const replacements = {
                processor_group_name: processor_group_name,
                x: x,
                y: y
            };
            const pg_details = this.specService.replaceJsonValues('addProcessorGroup', replacements);
            try {
                let processurl = `${this.nifiUrl}/nifi-api/process-groups/${nifi_root_pg_id}/process-groups`;
                let processRes = await this.http.post(processurl, pg_details);
                if (processRes) {
                    return processRes
                } else {
                    return 'Failed to create the processor group';
                }
            } catch (error) {
                return {code: 400, error: "Error occured during processor group creation"}
            }
        }
    }

    async addProcessor(processor_name, name, pg_source_id) {
        let url = `${this.nifiUrl}/nifi-api/flow/process-groups/${pg_source_id}`;
        let result = await this.http.get(url);
        const pg_ports = result.data;
        const minRange = -250;
        const maxRange = 250;
        const x = Math.floor(Math.random() * (maxRange - minRange) + minRange);
        const y = Math.floor(Math.random() * (maxRange - minRange) + minRange);

        const replacements = {
            processor_name: processor_name,
            name: name,
            x: x,
            y: y
        };
        const processors = this.specService.replaceJsonValues('addProcessor', replacements);
        try {
            let addProcessUrl = `${this.nifiUrl}/nifi-api/process-groups/${pg_ports['processGroupFlow']['id']}/processors`;
            let addProcessResult: any = await this.http.post(addProcessUrl, processors);
            if (addProcessResult) {
                return {id: addProcessResult.data.id, message: "Successfully created the processor"};
            } else {
                return "Failed to create the processor";
            }
        } catch (error) {
            return {code: 400, error: "Error occured during processor creation"}
        }
    }

    async getProcessorSourceId(pg_source_id, processor_name) {
        const pg_ports = await this.getProcessorGroupPorts(pg_source_id);
        if (pg_ports) {
            let processors = pg_ports['processGroupFlow']['flow']['processors'];
            for (let pc of processors) {
                if (pc.component.name === processor_name) {
                    return pc.component.id;
                }
            }
        }
    }

    async updateProcessorProperty(pg_source_id, processor_name, transformer_file, schedulePeriod) {
        const pg_ports = await this.getProcessorGroupPorts(pg_source_id);
        if (pg_ports) {
            for (let processor of pg_ports['processGroupFlow']['flow']['processors']) {
                if (processor.component.name == processor_name) {
                    let update_processor_property_body, replacements;
                    if (processor_name == 'generateFlowFile') {
                        if (schedulePeriod !== undefined) {
                            replacements = {
                                componentId: processor['component']['id'],
                                componentName: processor['component']['name'],
                                schedulePeriod: schedulePeriod,
                                version: processor['revision']['version']
                            };
                            update_processor_property_body = this.specService.replaceJsonValues('generateFlowFileWithSchedule', replacements);
                        }
                        else {
                            replacements = {
                                componentId: processor.component.id,
                                componentName: processor.component.name,
                                version: processor.revision.version
                            };
                            update_processor_property_body = this.specService.replaceJsonValues('generateFlowFileWithoutSchedule', replacements);
                        }
                    }
                    if (processor_name == 'failedLogMessage') {
                        replacements = {
                            componentId: processor.component.id,
                            componentName: processor.component.name,
                            version: processor.revision.version
                        };
                        update_processor_property_body = this.specService.replaceJsonValues('failedLogMessage', replacements);
                    }
                    if (processor_name == 'successLogMessage') {
                        replacements = {
                            componentId: processor.component.id,
                            componentName: processor.component.name,
                            version: processor.revision.version
                        };
                        update_processor_property_body = this.specService.replaceJsonValues('successLogMessage', replacements);
                    }
                    if (processor_name == 'pythonCode') {
                        replacements = {
                            componentId: processor.component.id,
                            componentName: processor.component.name,
                            CommandArguments: transformer_file,
                            CommandPath: `${process.env.PYTHON_PATH}`,
                            WorkingDirectory: `${process.env.WRK_DIR_PYTHON}`,
                            version: processor.revision.version
                        };
                        update_processor_property_body = this.specService.replaceJsonValues('pythonCode', replacements);
                    }
                    let url = `${this.nifiUrl}/nifi-api/processors/${processor?.component?.id}`;

                    try {
                        let result = await this.http.put(url, update_processor_property_body);
                        if (result) {
                            return `{message:Successfully updated the properties in the ${processor_name}}`;
                        } else {
                            return `{message:Failed to update the properties in the ${processor_name}}`;
                        }
                    } catch (error) {
                        return {code: 400, error: "Could not update the processor"};
                    }
                }
            }
        }
    }

    async connect(sourceId, destinationId, relationship, pg_source_id) {
        const pg_ports = await this.getProcessorGroupPorts(pg_source_id);
        if (pg_ports) {
            const pg_id = pg_ports['processGroupFlow']['id'];
            const replacements = {
                sourceId: sourceId,
                groupId: pg_id,
                destinationId: destinationId,
                relationship: relationship
            };

            const connect = this.specService.replaceJsonValues('connect', replacements);
            let url = `${this.nifiUrl}/nifi-api/process-groups/${pg_ports['processGroupFlow']['id']}/connections`;
            try {
                let result = await this.http.post(url, connect);
                if (result) {
                    return `{message:Successfully connected the processor from ${sourceId} to ${destinationId}}`;
                } else {
                    return `{message:Failed connected the processor from ${sourceId} to ${destinationId}}`;
                }
            } catch (error) {
                return {code: 400, message: "Errror occured during connection"};
            }
        }
    }

    async updateScheduleProcessProperty(processor_group_name, processor_name, schedulePeriod) {
        let pcName;
        let pg_details;
        let res = await this.http.get(`${this.nifiUrl}/nifi-api/process-groups/root`);
        let nifi_root_pg_id = res.data['component']['id'];
        let pg_list = await this.http.get(`${this.nifiUrl}/nifi-api/flow/process-groups/${nifi_root_pg_id}`);
        if (pg_list['status'] == 200) {
            for (let pg of pg_list['data']['processGroupFlow']['flow']['processGroups']) {
                if (pg['component']['name'] === processor_group_name) {
                    pcName = pg;
                }
            }
        } else {
            return {code: 400, error: "Failed to get the processor group list"}
        }
        let result = await this.http.get(`${this.nifiUrl}/nifi-api/flow/process-groups/${pcName['component']['id']}`);
        pg_details = result;
        for (let details of pg_details['data']['processGroupFlow']['flow']['processors']) {
            if (details['component']['name'] == processor_name) {
                const replacements = {
                    componentId: details['component']['id'],
                    componentName: details['component']['name'],
                    schedulePeriod: schedulePeriod,
                    version: details['revision']['version']
                };
                let reqBody = this.specService.replaceJsonValues('updateScheduleProcessProperty', replacements);
                let url = `${this.nifiUrl}/nifi-api/processors/${details?.component?.id}`;
                let resultCode = await this.http.put(url, reqBody);
                if (resultCode['status'] == 200) {
                    return {code: 200, message: "Success"}
                } else {
                    return {code: 400, error: "Failed to update the schedule property"}
                }
            }
        }
    }

    async getProcessorGroupPorts(pg_source_id) {
        let url = `${this.nifiUrl}/nifi-api/flow/process-groups/${pg_source_id}`;
        try {
            let res = await this.http.get(url);
            if (res.data) {
                return res.data;
            }
        } catch (error) {
            return {code: 400, error: "coould not get Processor Group Port"}
        }
    }

    async processSleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
}