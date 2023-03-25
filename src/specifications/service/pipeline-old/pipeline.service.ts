import { HttpCustomService } from './../HttpCustomService';
import {
    PipelineSchemaDimensiontoDB,
    PipelineSchemaDatasettoDB,
    PipelineSchemaIngesttoDB,
    schemaPipeline
} from './../../../utils/spec-data';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { pipelineDto } from 'src/specifications/dto/specData.dto';
import { DataSource } from 'typeorm';
import { GenericFunction } from '../genericFunction';
import { checkName, checkPipelineName, getPipelineSpec, insertIntoSpecPipeline } from '../../queries/queries';

// PipelineSchemaDimension
@Injectable()
export class PipelineService {

    constructor(@InjectDataSource() private dataSource: DataSource, private specService: GenericFunction, private http: HttpCustomService) {
    }

    async createSpecPipeline(pipelineData: pipelineDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        let schemavalidator: any = await this.specService.ajvValidator(schemaPipeline, pipelineData)
        if (schemavalidator.errors) {
            return { code: 400, error: schemavalidator.errors }
        }
        else {
            let queryResult = checkPipelineName('pipeline_name', "pipeline");
            queryResult = queryResult.replace('$1', `${pipelineData?.pipeline_name.toLowerCase()}`);
            const resultPipeName = await this.dataSource.query(queryResult);
            if (resultPipeName.length > 0) {
                return { code: 400, error: "Pipeline name already exists" }
            }
            else {
               
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    let insertPipeLineQuery = await insertIntoSpecPipeline(pipelineData?.pipeline_name.toLowerCase());
                    const insertPipelineResult = await queryRunner.query(insertPipeLineQuery);
                    if (insertPipelineResult[0].pid) {
                        const result = await this.CreatePipeline(pipelineData?.pipeline_name?.toLowerCase());
                        if (result.code == 400) {
                            await queryRunner.rollbackTransaction();
                        }
                        else {
                            await queryRunner.commitTransaction();
                        }
                        return result
                    }
                } catch (error) {
                    console.log("Error in spec pipeline ::::", error)
                    await queryRunner.rollbackTransaction();
                    return { code: 400, error: "Something went wrong" };
                } finally {
                    await queryRunner.release();
                }
            }
        }
    }

    async CreatePipeline(pipelineName, schedulePeriod = undefined) {
        try {
                let nifi_root_pg_id, pg_list, pg_source;
                const processor_group_name = pipelineName;
                let data = {};
                let res = await this.http.get(`${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/process-groups/root`);
                nifi_root_pg_id = res.data['component']['id'];
                let resp = await this.http.get(`${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/flow/process-groups/${nifi_root_pg_id}`)

                pg_list = resp.data;
                let counter = 0;
                let pg_group = pg_list['processGroupFlow']['flow']['processGroups']
                for (let pg of pg_group) {
                    if (pg.component.name == processor_group_name) {
                        pg_source = pg;
                        counter = counter + 1;
                        data = {
                            "id": pg_source['component']['id'],
                            "state": "STOPPED",  // RUNNING or STOP
                            "disconnectedNodeAcknowledged": false
                        };
                        console.log('pipeline.service.: STOPPED');
                        await this.http.put(`${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/flow/process-groups/${pg_source['component']['id']}`, data,)
                        break;
                    }
                }
                if (counter == 0) {
                    let response = await this.addProcessorGroup(processor_group_name);
                    pg_source = response['data'];
                    await this.addProcessor('org.apache.nifi.processors.standard.GenerateFlowFile', 'generateFlowFile', pg_source['component']['id']);
                    await this.addProcessor('org.apache.nifi.processors.standard.ExecuteStreamCommand', 'bashScriptCode', pg_source['component']['id']);
                    await this.addProcessor('org.apache.nifi.processors.standard.LogMessage', 'successLogMessage', pg_source['component']['id']);
                    await this.addProcessor('org.apache.nifi.processors.standard.LogMessage', 'failedLogMessage', pg_source['component']['id']);
                    const generateFlowFileID = await this.getProcessorSourceId(pg_source['component']['id'], 'generateFlowFile');

                    const bashScriptCodeID = await this.getProcessorSourceId(pg_source['component']['id'], 'bashScriptCode');

                    const successLogMessageID = await this.getProcessorSourceId(pg_source['component']['id'], 'successLogMessage');

                    const failedLogMessageID = await this.getProcessorSourceId(pg_source['component']['id'], 'failedLogMessage');

                    const success_relationship = ["success"];
                    const python_failure_relationship = ["nonzero status"];
                    const python_success_relationship = ["output stream"];
                    const autoterminate_relationship = ["success"];
                    await this.connect(generateFlowFileID, bashScriptCodeID, success_relationship, pg_source['component']['id']);
                    await this.connect(bashScriptCodeID, successLogMessageID, python_success_relationship, pg_source['component']['id']);
                    await this.connect(bashScriptCodeID, failedLogMessageID, python_failure_relationship, pg_source['component']['id']);
                    await this.updateProcessorProperty(pg_source['component']['id'], 'bashScriptCode' , schedulePeriod);
                    await this.updateProcessorProperty(pg_source['component']['id'], 'generateFlowFile' , schedulePeriod);
                    await this.updateProcessorProperty(pg_source['component']['id'], 'successLogMessage' , schedulePeriod);
                    await this.updateProcessorProperty(pg_source['component']['id'], 'failedLogMessage' , schedulePeriod);
                    return {
                        code: 200,
                        message: "Processor group created successfully"
                    }
                }
                else {
                    let result = await this.updateScheduleProcessProperty(processor_group_name, 'generateFlowFile', schedulePeriod);
                    await this.processSleep(500);
                    data = {
                        "id": pg_source['component']['id'],
                        "state": "RUNNING",  // RUNNING or STOP
                        "disconnectedNodeAcknowledged": false
                    };
                    console.log('pipeline.service.: RUNNING');
                    await this.http.put(`${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/flow/process-groups/${pg_source['component']['id']}`, data);
                    if (result.code == 400) {

                        return {
                            code: 400,
                            error: "Could not schedule the processor"
                        }
                    }
                    else {
                        return {
                            code: 200,
                            message: "Processor group created successfully"
                        }
                    }

                }
            
        }
        catch (e) {
            console.error('create-pipeline-impl.executeQueryAndReturnResults: ', e.message);
            throw new Error(e);
        }
    }

    async addProcessorGroup(processor_group_name: string) {
        let url = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/process-groups/root`;
        let result = await this.http.get(url);
        if (result) {
            const nifi_root_pg_id = result.data['component']['id'];
            const minRange = -500;
            const maxRange = 500;
            const x = Math.floor(Math.random() * (maxRange - minRange) + minRange);
            const y = Math.floor(Math.random() * (maxRange - minRange) + minRange);
            const pg_details = {
                "revision": {
                    "clientId": "",
                    "version": 0
                },
                "disconnectedNodeAcknowledged": "false",
                "component": {
                    "name": processor_group_name,
                    "position": {
                        "x": x,
                        "y": y
                    }
                }
            }
            try {
                let processurl = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/process-groups/${nifi_root_pg_id}/process-groups`;
                let processRes = await this.http.post(processurl, pg_details);
                if (processRes) {
                    return processRes
                }
                else {
                    return 'Failed to create the processor group';
                }
            } catch (error) {
                return { code: 400, error: "Error occured during processor group creation" }
            }

        }

    }

    async addProcessor(processor_name, name, pg_source_id) {
        let url = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/flow/process-groups/${pg_source_id}`;
        let result = await this.http.get(url);
        const pg_ports = result.data;
        const minRange = -250;
        const maxRange = 250;
        const x = Math.floor(Math.random() * (maxRange - minRange) + minRange);
        const y = Math.floor(Math.random() * (maxRange - minRange) + minRange);
        const processors = {
            "revision": {
                "clientId": "",
                "version": 0
            },
            "disconnectedNodeAcknowledged": "false",
            "component": {
                "type": processor_name,
                "bundle": {
                    "group": "org.apache.nifi",
                    "artifact": "nifi-standard-nar",
                    "version": "1.12.1"
                },
                "name": name,
                "position": {
                    "x": x,
                    "y": y
                }
            }
        };
        try {
            let addProcessUrl = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/process-groups/${pg_ports['processGroupFlow']['id']}/processors`;
            let addProcessResult = await this.http.post(addProcessUrl, processors);
            if (addProcessResult) {
                return "Successfully created the processor";
            }
            else {
                return "Failed to create the processor";
            }
        } catch (error) {
            return { code: 400, error: "Error occured during processor creation" }
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

    async getProcessorGroupPorts(pg_source_id) {
        let url = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/flow/process-groups/${pg_source_id}`
        try {
            let res = await this.http.get(url);
            if (res.data) {
                return res.data;
            }
        } catch (error) {
            return { code: 400, error: "coould not get Processor Group Port" }
        }
    }

    async connect(sourceId, destinationId, relationship, pg_source_id) {
        const pg_ports = await this.getProcessorGroupPorts(pg_source_id)
        if (pg_ports) {
            const pg_id = pg_ports['processGroupFlow']['id']
            const json_body = {
                "revision": {
                    "clientId": "",
                    "version": 0
                },
                "disconnectedNodeAcknowledged": "false",
                "component": {
                    "name": "",
                    "source": {
                        "id": sourceId,
                        "groupId": pg_id,
                        "type": "PROCESSOR"
                    },
                    "destination": {
                        "id": destinationId,
                        "groupId": pg_id,
                        "type": "PROCESSOR"
                    },
                    "selectedRelationships": relationship
                }
            };
            let url = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/process-groups/${pg_ports['processGroupFlow']['id']}/connections`;
            try {
                let result = await this.http.post(url, json_body);
                if (result) {
                    return `{message:Successfully connected the processor from ${sourceId} to ${destinationId}}`;
                }
                else {
                    return `{message:Failed connected the processor from ${sourceId} to ${destinationId}}`;
                }
            } catch (error) {
                return { code: 400, message: "Errror occured during connection" };
            }
        }
    }

    async updateScheduleProcessProperty(processor_group_name, processor_name, schedulePeriod) {
        let pcName;
        let pg_details;
        let res = await this.http.get(`${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/process-groups/root`);
        let nifi_root_pg_id = res.data['component']['id'];
        let pg_list = await this.http.get(`${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/flow/process-groups/${nifi_root_pg_id}`);
        if (pg_list['status'] == 200) {
            for (let pg of pg_list['data']['processGroupFlow']['flow']['processGroups']) {
                if (pg['component']['name'] === processor_group_name) {
                    pcName = pg;
                }
            }
        }
        else {
            return { code: 400, error: "Failed to get the processor group list" }
        }
        let result = await this.http.get(`${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/flow/process-groups/${pcName['component']['id']}`);
        pg_details = result;
        for (let details of pg_details['data']['processGroupFlow']['flow']['processors']) {
            if (details['component']['name'] == processor_name) {
                let reqBody = {
                    "component": {
                        "id": details['component']['id'],
                        "name": details['component']['name'],
                        "config": {
                            "concurrentlySchedulableTaskCount": "1",
                            "schedulingPeriod": schedulePeriod,
                            "executionNode": "ALL",
                            "penaltyDuration": "30 sec",
                            "yieldDuration": "1 sec",
                            "bulletinLevel": "WARN",
                            "schedulingStrategy": "CRON_DRIVEN",
                            "comments": "",
                            "runDurationMillis": 0,
                            "autoTerminatedRelationships": []
                        },
                        "state": "STOPPED"
                    },
                    "revision": {
                        "clientId": "",
                        "version": details['revision']['version']
                    },
                    "disconnectedNodeAcknowledged": false
                }
                let url = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/processors/${details?.component?.id}`;
                let resultCode = await this.http.put(url, reqBody);
                if (resultCode['status'] == 200) {
                    return { code: 200, message: "Success" }
                }
                else {
                    return { code: 400, error: "Failed to update the schedule property" }
                }

            }
        }
    }

    async updateProcessorProperty(pg_source_id, processor_name, schedulePeriod) {
        const pg_ports = await this.getProcessorGroupPorts(pg_source_id);
        if (pg_ports) {
            for (let processor of pg_ports['processGroupFlow']['flow']['processors']) {
                if (processor.component.name == processor_name) {
                    let update_processor_property_body;
                    if (processor_name == 'generateFlowFile') {
                        if (schedulePeriod !== undefined) {
                            update_processor_property_body = {
                                "component": {
                                    "id": processor['component']['id'],
                                    "name": processor['component']['name'],
                                    "config": {
                                        "concurrentlySchedulableTaskCount": "1",
                                        "schedulingPeriod": schedulePeriod,
                                        "executionNode": "ALL",
                                        "penaltyDuration": "30 sec",
                                        "yieldDuration": "1 sec",
                                        "bulletinLevel": "WARN",
                                        "schedulingStrategy": "CRON_DRIVEN",
                                        "comments": "",
                                        "runDurationMillis": 0,
                                        "autoTerminatedRelationships": []
                                    },
                                    "state": "STOPPED"
                                },
                                "revision": {
                                    "clientId": "",
                                    "version": processor['revision']['version']
                                },
                                "disconnectedNodeAcknowledged": false
                            }
                        }
                        else {
                            update_processor_property_body = {
                                "component": {
                                    "id": processor.component.id,
                                    "name": processor.component.name,
                                    "config": {
                                        "autoTerminatedRelationships": [
                                            "original"
                                        ],
                                        "schedulingPeriod": "1 day"
                                    }
                                },
                                "revision": {
                                    "clientId": "",
                                    "version": processor.revision.version
                                },
                                "disconnectedNodeAcknowledged": "False"
                            }
                        }

                    }
                    if (processor_name == 'failedLogMessage') {
                        update_processor_property_body = {
                            "component": {
                                "id": processor.component.id,
                                "name": processor.component.name,
                                "config": {
                                    "autoTerminatedRelationships": [
                                        "success"
                                    ],
                                    "properties": {
                                        "log-prefix": "error",
                                        "log-message": "error while executing the ${filename} python code"
                                    }
                                }
                            },
                            "revision": {
                                "clientId": "",
                                "version": processor.revision.version
                            },
                            "disconnectedNodeAcknowledged": "false"

                        }

                    }
                    if (processor_name == 'successLogMessage') {
                        update_processor_property_body = {
                            "component": {
                                "id": processor.component.id,
                                "name": processor.component.name,
                                "config": {
                                    "autoTerminatedRelationships": [
                                        "success"
                                    ],
                                    "properties": {
                                        "log-prefix": "info",
                                        "log-message": "succesfully executed the ${filename} python code"
                                    }
                                }
                            },
                            "revision": {
                                "clientId": "",
                                "version": processor.revision.version
                            },
                            "disconnectedNodeAcknowledged": "false"
                        }
                    }
                    if (processor_name == 'bashScriptCode') {
                        update_processor_property_body = {
                            "component": {
                                "id": processor.component.id,
                                "name": processor.component.name,
                                "config": {
                                    "autoTerminatedRelationships": [
                                        "original"
                                    ],
                                    "properties": {
                                        "Command Arguments": "transformer_exec.sh",
                                        "Command Path": "bash",
                                        "Working Directory": "/opt/nifi/nifi-current/"
                                    }
                                }
                            },
                            "revision": {
                                "clientId": "",
                                "version": processor.revision.version
                            },
                            "disconnectedNodeAcknowledged": "False"
                        }
                    }
                    let url = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi-api/processors/${processor?.component?.id}`;

                    try {
                        let result = await this.http.put(url, update_processor_property_body);
                        if (result) {
                            return `{message:Successfully updated the properties in the ${processor_name}}`;

                        }
                        else {
                            return `{message:Failed to update the properties in the ${processor_name}}`;
                        }

                    } catch (error) {
                        return { code: 400, error: "Could not update the processor" };
                    }


                }
            }
        }
    }

    async processSleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
}