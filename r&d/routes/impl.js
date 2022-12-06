const pipeSpec = require('./pipeSpec.json');
const Ajv = require("ajv");
const ajv = new Ajv();
const {query} = require('../dbConfig');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const ObjectsToCsv = require('objects-to-csv');
const path = require('path');
const moment = require('moment');

async function validate(pipeRecord) {
    const validate = ajv.compile(pipeSpec.properties);
    const valid = validate(pipeRecord);
    if (valid) {
        return true;
    }
    console.log(validate.errors);
    return false;
}

async function generateRandomObject() {
    let events = [];
    const limit = 5000;
    const minSchoolId = 9000;
    const maxSchoolId = 9999;
    const minClass = 1;
    const maxClass = 5;
    const minStudentsCount = 60;
    const maxStudentsCount = 65;
    const minStudentsMarked = 20;
    const maxStudentsMarked = 60;

    for (let i = 0; i < limit; i++) {
        let schoolId = randomIntFromInterval(minSchoolId, maxSchoolId);
        events.push({
            Date: getRandomDateFromPreviousFifteenDays(),
            school_id: schoolId,
            school_name: 'SCH_' + schoolId,
            class: randomIntFromInterval(minClass, maxClass),
            total_students: randomIntFromInterval(minStudentsCount, maxStudentsCount),
            students_marked: randomIntFromInterval(minStudentsMarked, maxStudentsMarked)
        });
    }
    return events;
}

function getRandomDateFromPreviousFifteenDays() {
    return moment().subtract(1, 'd').subtract(randomIntFromInterval(1, 15), 'd').toISOString().slice(0, 10);
}


function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

async function eventRoutes(fastify, options, done) {
    fastify.post('/events', async (req, res) => {
        const eventRecords = await generateRandomObject();
        const csv = new ObjectsToCsv(eventRecords);
        await csv.toDisk('./list.csv', {append: false});
        res.send({message:'Events Added Successfully'}).status(200);
    })

    fastify.post('/pipe-spec', async (req, res) => {
        try {
            if (await validate(req.body)) {
                const fileName = req.body[0].fileName;
                const pythonFileName = req.body[0].phytonFile;
                const queryStr = `INSERT INTO cube.pipe_spec(json) VALUES($1) RETURNING *;`;
                const result = await query(queryStr, req.body);

                // Get the root id
                let axiosUrl = `http://localhost:8096/nifi-api/process-groups/root`;
                let axiosResult = await axios.get(axiosUrl);
                const rootId = axiosResult.data.id;

                // Upload the .xml file
                axiosUrl = `http://localhost:8096/nifi-api/process-groups/${rootId}/templates/upload`;
                const xmlFile = fs.readFileSync(`${__dirname}\\${fileName}.xml`);
                const form = new FormData();
                form.append('template', xmlFile, fileName + '.xml');
                await axios.post(axiosUrl, form);

                // Get the template id
                axiosUrl = `http://localhost:8096/nifi-api/flow/templates`;
                axiosResult = await axios.get(axiosUrl);
                let templateId;
                for (let record of axiosResult.data.templates) {
                    if (record.template.name === fileName) {
                        templateId = record.id
                    }
                }
                // Instantiate to display in nifi
                const data = {
                    "originX": 423,
                    "originY": 52,
                    "templateId": templateId
                };
                axiosUrl = `http://localhost:8096/nifi-api/process-groups/${rootId}/template-instance`;
                await axios.post(axiosUrl, data);

                //To get component Id
                axiosUrl = `http://localhost:8096/nifi-api/flow/process-groups/${rootId}`;
                axiosResult = await axios.get(axiosUrl);
                let arr = axiosResult.data.processGroupFlow.flow.processGroups;

                let componentId;
                for (let record of arr) {
                    if (record.component.name === fileName) {
                        componentId = record.component.id;
                    }
                }

                //To get processor Group Details
                axiosUrl = `http://localhost:8096/nifi-api/flow/process-groups/${componentId}`;
                axiosResult = await axios.get(axiosUrl);

                let processorId, processorName, version, clientId;
                const processorArr = axiosResult.data.processGroupFlow.flow.processors;
                for (let record of processorArr) {
                    if (record.component.name === 'config_datasource_call_python_code') {
                        processorName = record.component.name;
                        processorId = record.component.id;
                        version = record.revision.version;
                        clientId = record.revision.clientId;
                    }
                }

                const body = {
                    "component": {
                        "id": processorId,
                        "name": processorName,
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
                            "autoTerminatedRelationships": [
                                "original"
                            ],
                            "properties": {
                                "Command Arguments": pythonFileName
                            }
                        },
                        "state": "STOPPED"
                    },
                    "revision": {
                        "clientId": clientId,
                        "version": version
                    },
                    "disconnectedNodeAcknowledged": false
                };

                // Map Transformer to processor group
                axiosUrl = `http://localhost:8096/nifi-api/processors/${processorId}`;
                axiosResult = await axios.put(axiosUrl, body);

                res.status(200);
            } else {
                console.log('INVALID INPUT');
                res.status(400);
            }
        } catch (e) {
            console.error('impl.: ', e.message);
        }
    });

    done();
}

module.exports = eventRoutes;
