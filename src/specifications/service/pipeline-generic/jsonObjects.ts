export const jsonObject: any = [
    {
        "name": "addProcessorGroup",
        "object": {
            "revision": {
                "clientId": "",
                "version": 0
            },
            "disconnectedNodeAcknowledged": "false",
            "component": {
                "name": "#{processor_group_name}",
                "position": {
                    "x": "#{x}",
                    "y": "#{y}"
                }
            }
        }
    },
    {
        "name": "addProcessor",
        "object": {
            "revision": {
                "clientId": "",
                "version": 0
            },
            "disconnectedNodeAcknowledged": "false",
            "component": {
                "type": "#{processor_name}",
                "bundle": {
                    "group": "org.apache.nifi",
                    "artifact": "nifi-standard-nar",
                    "version": "1.12.1"
                },
                "name": "#{name}",
                "position": {
                    "x": "#{x}",
                    "y": "#{y}"
                }
            }
        }
    },
    {
        "name": "connect",
        "object": {
            "revision": {
                "clientId": "",
                "version": 0
            },
            "disconnectedNodeAcknowledged": "false",
            "component": {
                "name": "",
                "source": {
                    "id": "#{sourceId}",
                    "groupId": "#{groupId}",
                    "type": "PROCESSOR"
                },
                "destination": {
                    "id": "#{destinationId}",
                    "groupId": "#{groupId}",
                    "type": "PROCESSOR"
                },
                "selectedRelationships": ["#{relationship}"]
            }
        }
    },
    {
        "name": "updateScheduleProcessProperty",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {
                    "concurrentlySchedulableTaskCount": "1",
                    "schedulingPeriod": "#{schedulePeriod}",
                    "executionNode": "ALL",
                    "penaltyDuration": "30 sec",
                    "yieldDuration": "1 sec",
                    "bulletinLevel": "WARN",
                    "schedulingStrategy": "CRON_DRIVEN",
                    "comments": "",
                    "autoTerminatedRelationships": [],
                    "properties": {
                        "Input Directory": "/input_data"
                    }
                },
                "state": "STOPPED"
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": false
        }
    },
    {
        "name": "failedLogMessage",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
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
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": "false"
        }
    },
    {
        "name": "successLogMessage",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
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
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": "false"
        }
    },
    {
        "name": "pythonCode",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {
                    "autoTerminatedRelationships": [
                        "original"
                    ],
                    "properties": {
                        "Command Arguments": "#{CommandArguments}",
                        "Command Path": "#{CommandPath}",
                        "Working Directory": "#{WorkingDirectory}"
                    }
                }
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": "False"
        }
    },
    {
        "name": "artifactChange",
        "object": {
            "revision": {
                "clientId": "",
                "version": 0
            },
            "disconnectedNodeAcknowledged": "false",
            "component": {
                "type": "#{processor_name}",
                "bundle": {
                    "group": "org.apache.nifi",
                    "artifact": "#{artifact}",
                    "version": "1.12.1"
                },
                "name": "#{name}",
                "position": {
                    "x": "#{x}",
                    "y": "#{y}"
                }
            }
        }
    },
    {
        "name": "addPort",
        "object": {
            "revision": {
                "clientId": "",
                "version": 0
            },
            "disconnectedNodeAcknowledged": "false",
            "component": {
                "name": "#{portName}",
                "allowRemoteAccess": "false",
                "position": {
                    "x": "#{x}",
                    "y": "#{y}"
                }
            }
        }
    },
    {
        "name": "portConnect",
        "object": {
            "revision": {
                "clientId": "",
                "version": 0
            },
            "disconnectedNodeAcknowledged": "false",
            "component": {
                "name": "",
                "source": {
                    "id": "#{sourceId}",
                    "groupId": "#{sourceGroupId}",
                    "type": "#{sourceType}"
                },
                "destination": {
                    "id": "#{destinationId}",
                    "groupId": "#{destinationGroupId}",
                    "type": "#{destinationType}"
                },
                "selectedRelationships": ["#{relationship}"]
            }
        }
    },
    {
        "name": "getFile",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {
                    "schedulingPeriod": "#{schedulePeriod}",
                    "schedulingStrategy": "CRON_DRIVEN",
                    "properties": {
                        "Input Directory": "/input_data"
                    }
                },
                "state": "STOPPED"
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": false
        }
    },
    {
        "name": "updateEventName",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {
                    "properties": {
                        "event_name": "#{eventName}"
                    }
                },
                "state": "STOPPED"
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": false
        }
    },
    {
        "name": "routeOnEventName",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {
                    "properties": {
                        "event_name": "${filename:startsWith(${event_name})}"
                    }
                },
                "state": "STOPPED"
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": false
        }
    },
    {
        "name": "noEventNameError",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {
                    "autoTerminatedRelationships": [
                        "success"
                    ],
                    "properties": {
                        "log-prefix": "****error****",
                        "log-message": "${filename} is not matched in the routes"
                    }
                },
                "state": "STOPPED"
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": false
        }
    },
    {
        "name": "addingJsonAttribute",
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {
                    "properties": {
                        "file_name": "${filename}",
                        "ingestion_name": "${event_name}",
                        "ingestion_type": "#{ingestionType}",
                        "status": "Completed_#{pipelineName}"
                    }
                },
                "state": "STOPPED"
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": false
        }
    },
    {
        "name": 'attributesToJson',
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {
                    "autoTerminatedRelationships": [
                        "failure"
                    ],
                    "properties": {
                        "Attributes List": "file_name, ingestion_name, ingestion_type, status",
                        "Destination": "flowfile-content"
                    }
                },
                "state": "STOPPED"
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": false
        }
    },
    {
        "name": 'routeOnAttribute',
        "object": {
            "component": {
                "id": "#{componentId}",
                "name": "#{componentName}",
                "config": {

                    "autoTerminatedRelationships": [
                        "unmatched"
                    ],
                    "properties": {
                        "parse_event_input": "${filename:startsWith('#{input_filename}')}"
                    }
                },
                "state": "STOPPED"
            },
            "revision": {
                "clientId": "",
                "version": "#{version}"
            },
            "disconnectedNodeAcknowledged": false
        }
    }
];