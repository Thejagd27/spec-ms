import { Injectable } from '@nestjs/common';
import { s3DTO } from 'src/specifications/dto/specData.dto';
import { GenericFunction } from '../genericFunction';
import { HttpCustomService } from '../HttpCustomService';
var cronValidator = require('cron-expression-validator');
@Injectable()
export class S3Service {
    constructor(private http: HttpCustomService, private specService: GenericFunction) {}
    async uploadFile(scheduleExpr) {
        const s3Schema = {
            "type": "object",
            "properties": {
                "scheduled_at": {
                    "type": "string",
                    "shouldnotnull": true
                },
                "scheduled_type": {
                    "type": "string",
                    "shouldnotnull": true,
                    "enum": ["archive","error"]
                }

            },
            "required": [
                "scheduled_at",
                "scheduled_type"
            ],
        }
        let isValidSchema: any = await this.specService.ajvValidator(s3Schema, scheduleExpr);
        if (isValidSchema.errors) {
            return { code: 400, error: isValidSchema.errors }
        }
        var result = cronValidator.isValidCronExpression(scheduleExpr.scheduled_at, { error: true });
            if (result.errorMessage) {
                return { code: 400, error: result.errorMessage }
            }
        else {
            try {
                let selectedBucket = scheduleExpr.scheduled_type == 'archive'? process.env.ARCHIVED_BUCKET:process.env.ERROR_BUCKET;
                let selectedFolder = scheduleExpr.scheduled_type == 'archive'? "/archived_data":"/error_data";
                let nifi_root_pg_id, pg_list, pg_source;
                const processor_group_name = "uploadToS3";
                let data = {};
                let res = await this.http.get(`${process.env.URL}/nifi-api/process-groups/root`);
                nifi_root_pg_id = res.data['component']['id'];
                let resp = await this.http.get(`${process.env.URL}/nifi-api/flow/process-groups/${nifi_root_pg_id}`);
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
                        await this.http.put(`${process.env.URL}/nifi-api/flow/process-groups/${pg_source['component']['id']}`, data,)
                        break;
                    }
                }
                if(counter == 0)
                { 
                let response = await this.addProcessorGroup(processor_group_name);
                pg_source = response['data'];
                await this.addProcessor('org.apache.nifi.processors.standard.GetFile', 'GetFile', pg_source['component']['id']);
                await this.addProcessor('org.apache.nifi.processors.aws.s3.PutS3Object', 'PutS3Object', pg_source['component']['id']);
                await this.addProcessor('org.apache.nifi.processors.standard.LogMessage', 'successLogMessage', pg_source['component']['id']);
                await this.addProcessor('org.apache.nifi.processors.standard.LogMessage', 'failedLogMessage', pg_source['component']['id']);
                const GetFileID = await this.getProcessorSourceId(pg_source['component']['id'], 'GetFile');
                const PutS3ObjectID = await this.getProcessorSourceId(pg_source['component']['id'], 'PutS3Object');
                const successLogMessageID = await this.getProcessorSourceId(pg_source['component']['id'], 'successLogMessage');
                const failedLogMessageID = await this.getProcessorSourceId(pg_source['component']['id'], 'failedLogMessage');
                const success_relationship = ["success"];
                const failure_relationship = ["failure"];
                await this.connect(GetFileID, PutS3ObjectID, success_relationship, pg_source['component']['id']);
                await this.connect(PutS3ObjectID, successLogMessageID, success_relationship, pg_source['component']['id']);
                await this.connect(PutS3ObjectID, failedLogMessageID, failure_relationship, pg_source['component']['id']);
                await this.updateProcessorProperty(pg_source['component']['id'], 'PutS3Object',scheduleExpr.scheduled_at,selectedBucket,selectedFolder);
                await this.updateProcessorProperty(pg_source['component']['id'], 'GetFile', scheduleExpr.scheduled_at,selectedBucket, selectedFolder);
                await this.updateProcessorProperty(pg_source['component']['id'], 'successLogMessage');
                await this.updateProcessorProperty(pg_source['component']['id'], 'failedLogMessage');
                data = {
                    "id": pg_source['component']['id'],
                    "state": "RUNNING",  // RUNNING or STOP
                    "disconnectedNodeAcknowledged": false
                };
                await this.http.put(`${process.env.URL}/nifi-api/flow/process-groups/${pg_source['component']['id']}`, data)
                return {
                    code: 200,
                    message: `${processor_group_name} Processor group running successfully`
                }
            }
            else{
                await this.processSleep(5000);
                await this.updateProcessorProperty(pg_source['component']['id'], 'PutS3Object',scheduleExpr.scheduled_at,selectedBucket,selectedFolder);
                await this.updateProcessorProperty(pg_source['component']['id'], 'GetFile', scheduleExpr.scheduled_at,selectedBucket, selectedFolder);
                data = {
                    "id": pg_source['component']['id'],
                    "state": "RUNNING",  // RUNNING or STOP
                    "disconnectedNodeAcknowledged": false
                };
                console.log('pipeline.service.: RUNNING');
                await this.http.put(`${process.env.URL}/nifi-api/flow/process-groups/${pg_source['component']['id']}`, data); 
                return {
                    code: 200,
                    message: `${processor_group_name} Processor group running successfully`
                }
            }
            } catch (error) {
                return {
                    code: 400,
                    error: "Something went wrong"
                }
            }

        }
    }

    async addProcessor(processor_name, name, pg_source_id) {
        let url = `${process.env.URL}/nifi-api/flow/process-groups/${pg_source_id}`;
        let result = await this.http.get(url);
        const pg_ports = result.data;
        const minRange = -250;
        const maxRange = 250; 
        const x = Math.floor(Math.random() * (maxRange - minRange) + minRange);
        const y = Math.floor(Math.random() * (maxRange - minRange) + minRange);
        let processors
        if (name === 'PutS3Object') {
            processors = {
                "revision": {
                    "clientId": "",
                    "version": 0
                },
                "disconnectedNodeAcknowledged": false,
                "component": {
                    "type": "org.apache.nifi.processors.aws.s3.PutS3Object",
                    "bundle": {
                        "group": "org.apache.nifi",
                        "artifact": "nifi-aws-nar",
                        "version": "1.12.1"
                    },
                    "name": "PutS3Object",
                    "position": {
                        "x": 439.9999694371977,
                        "y": -89.99715032537935
                    }
                }
            }
        }
        else {


            processors = {
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
            }
        }
        try {
            let addProcessUrl = `${process.env.URL}/nifi-api/process-groups/${pg_ports['processGroupFlow']['id']}/processors`;
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
        if (processor_name === 'GetFile' || processor_name === 'putS3Object') {
            console.log("pgsource id is:", pg_source_id, processor_name)
        }
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
        let url = `${process.env.URL}/nifi-api/flow/process-groups/${pg_source_id}`;
        try {
            let res = await this.http.get(url);
            if (res.data) {
                return res.data;
            }
        } catch (error) {
            return { code: 400, error: "could not get Processor group port" }
        }


    }

    async connect(sourceId, destinationId, relationship, pg_source_id) {
        const pg_ports = await this.getProcessorGroupPorts(pg_source_id);
        if (pg_ports) {
            console.log('s3.service.pg_ports: ', pg_ports);
            const pg_id = pg_ports['processGroupFlow']['id'];
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
            let url = `${process.env.URL}/nifi-api/process-groups/${pg_ports['processGroupFlow']['id']}/connections`;
            try {
                let result = await this.http.post(url, json_body);
                if (result) {
                    return `{message:Successfully connected the processor from ${sourceId} to ${destinationId}}`;
                }
                else {
                    return `{message:Failed connected the processor from ${sourceId} to ${destinationId}}`;
                }
            } catch (error) {
                return { code: 400, message: "Error occured during connection" };
            }


        }
    }

    async addProcessorGroup(processor_group_name: string) {
        let url = `${process.env.URL}/nifi-api/process-groups/root`;
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
            };
            try {
                let processurl = `${process.env.URL}/nifi-api/process-groups/${nifi_root_pg_id}/process-groups`;
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
    
    async updateProcessorProperty(pg_source_id, processor_name, scheduleExpr?: string, bucketName?: string,folderSelected?: string) {
        const pg_ports = await this.getProcessorGroupPorts(pg_source_id);
        if (pg_ports) {
            for (let processor of pg_ports['processGroupFlow']['flow']['processors']) {
                if (processor.component.name == processor_name) {
                    let update_processor_property_body;
                    if (processor_name == 'GetFile') {
                        update_processor_property_body = {
                            "component": {
                                "id": processor.component.id,
                                "name": processor.component.name,

                                "config": {
                                    "concurrentlySchedulableTaskCount": "1",
                                    "schedulingPeriod": scheduleExpr,
                                    "executionNode": "ALL",
                                    "penaltyDuration": "30 sec",
                                    "yieldDuration": "1 sec",
                                    "bulletinLevel": "WARN",
                                    "schedulingStrategy": "CRON_DRIVEN",
                                    "comments": "",
                                    "autoTerminatedRelationships": [],
                                    "properties": {
                                        "Input Directory": folderSelected
                                    }
                                },
                                "state": "STOPPED"
                            },
                            "revision": {
                                "clientId": "",
                                "version": processor.revision.version
                            },
                            "disconnectedNodeAcknowledged": false
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
                                        "log-message": "error while uploading the ${filename} to S3"
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
                                        "log-message": "succesfully uploaded the ${filename} to S3"
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
                    if (processor_name == 'PutS3Object') {
                        update_processor_property_body = {
                            "component": {
                                "id": processor.component.id,
                                "name": processor.component.name,
                                "config": {
                                    "concurrentlySchedulableTaskCount": "1",
                                    "schedulingPeriod": "0 sec",
                                    "executionNode": "ALL",
                                    "penaltyDuration": "30 sec",
                                    "yieldDuration": "1 sec",
                                    "bulletinLevel": "WARN",
                                    "schedulingStrategy": "TIMER_DRIVEN",
                                    "comments": "",
                                    "runDurationMillis": 0,
                                    "autoTerminatedRelationships": [],
                                    "properties": {
                                        "Access Key": process.env.AWS_ACCESS_KEY,
                                        "Secret Key": process.env.AWS_SECRET_KEY,
                                        "Bucket": bucketName,
                                        "Region": "ap-south-1"
                                    }
                                },
                                "state": "STOPPED"
                            },
                            "revision": {
                                "clientId": "",
                                "version": processor.revision.version
                            },
                            "disconnectedNodeAcknowledged": false
                        }
                    }
                    let url = `${process.env.URL}/nifi-api/processors/${processor?.component?.id}`;
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
 