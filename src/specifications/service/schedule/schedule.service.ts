import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {scheduleDto} from '../../dto/specData.dto';
import {scheduleSchema} from '../../../utils/spec-data';
import {DataSource} from 'typeorm';
import {GenericFunction} from '../genericFunction';
import {HttpCustomService} from "../HttpCustomService";

let cronValidator = require('cron-expression-validator');

@Injectable()
export class ScheduleService {
    nifiUrl: string = `${process.env.NIFI_HOST}:${process.env.NIFI_PORT}`;

    constructor(@InjectDataSource() private dataSource: DataSource, private specService: GenericFunction, private http: HttpCustomService) {
    }

    async scheduleProcessorGroup(scheduleData: scheduleDto) {
        let isValidSchema: any;
        isValidSchema = await this.specService.ajvValidator(scheduleSchema, scheduleData);
        if (isValidSchema.errors) {
            return {code: 400, error: isValidSchema.errors}
        } else {
            let result = cronValidator.isValidCronExpression(scheduleData.scheduled_at, {error: true});
            if (result.errorMessage) {
                return {code: 400, error: result.errorMessage}
            } else {
                let result = await this.CreateSchedule(scheduleData?.processor_group_name, scheduleData.scheduled_at);
                if (result.code === 200) {
                    return {code: 200, "message": "Successfully updated the schedule"}
                } else {
                    return {
                        code: 400,
                        error: `${result.message} with name ${scheduleData.processor_group_name}`
                    }
                }
            }
        }
    }

    async CreateSchedule(processorGroupName, scheduledAt) {
        const processorGroups = await this.getRootDetails();
        let pg_list = processorGroups.data;
        let counter = 0;
        let data = {};
        let pg_group = pg_list['processGroupFlow']['flow']['processGroups'];
        for (let pg of pg_group) {
            if (pg.component.name == processorGroupName) {
                let pg_source = pg;
                counter = counter + 1;
                data = {
                    "id": pg_source['component']['id'],
                    "state": "STOPPED",  // RUNNING or STOP
                    "disconnectedNodeAcknowledged": false
                };
                await this.http.put(`${this.nifiUrl}/nifi-api/flow/process-groups/${pg_source['component']['id']}`, data,);
                return await this.updateProcessorProperty(pg_source['component']['id'], processorGroupName, scheduledAt)
            }
        }
        return {
            code: 100, message: 'Processor Group does not exists'
        }
    }

    async getRootDetails() {
        let res = await this.http.get(`${this.nifiUrl}/nifi-api/process-groups/root`);
        let nifi_root_pg_id = res.data['component']['id'];
        let resp = await this.http.get(`${this.nifiUrl}/nifi-api/flow/process-groups/${nifi_root_pg_id}`);
        return resp;
    }

    async updateProcessorProperty(pg_source_id, processorGroupName, schedulePeriod) {
        const pg_ports = await this.getProcessorGroupPorts(pg_source_id);
        if (pg_ports) {
            for (let processor of pg_ports['processGroupFlow']['flow']['processors']) {
                if (processor.component.name == await this.getProcessorName(processorGroupName)) {
                    let update_processor_property_body = {
                        "component": {
                            "id": processor['component']['id'],
                            "name": processor['component']['name'],
                            "config": {
                                "schedulingPeriod": schedulePeriod,
                                "schedulingStrategy": "CRON_DRIVEN"
                            },
                            "state": "STOPPED"
                        },
                        "revision": {
                            "clientId": "",
                            "version": processor['revision']['version']
                        },
                        "disconnectedNodeAcknowledged": "false"
                    };
                    let url = `${this.nifiUrl}/nifi-api/processors/${processor?.component?.id}`;
                    try {
                        let result = await this.http.put(url, update_processor_property_body);
                        if (result) {
                            let data = {
                                "id": pg_source_id,
                                "state": "RUNNING",  // RUNNING or STOP
                                "disconnectedNodeAcknowledged": false
                            };
                            await this.http.put(`${this.nifiUrl}/nifi-api/flow/process-groups/${pg_source_id}`, data);
                            return {
                                code: 200,
                                message: `Successfully updated the properties in the ${processorGroupName}`
                            };
                        } else {
                            return {code: 100, message: `Failed to update the properties in the ${processorGroupName}`};
                        }
                    } catch (error) {
                        return {code: 400, error: "Could not update the processor"};
                    }
                }
            }
        }
    }

    async getProcessorGroupPorts(pg_source_id) {
        let url = `${this.nifiUrl}/nifi-api/flow/process-groups/${pg_source_id}`;
        try {
            let res = await
                this.http.get(url);
            if (res.data) {
                return res.data;
            }
        } catch (error) {
            return {code: 400, error: "could not get Processor Group Port"}
        }
    }

    async getProcessorName(processorGroupName) {
        switch (processorGroupName) {
            case 'Plugin Student Attendance aws':
            case  'Plugin Teachers Attendance aws':
            case 'Plugin Rev-and-monitor aws':
                return 'Lists3';
                break;
            case 'Plugin Student Attendance local':
            case 'Plugin Teachers Attendance local':
            case 'Plugin Rev-and-monitor local':
                return 'Lists3_local';
                break;
        }
    }
}