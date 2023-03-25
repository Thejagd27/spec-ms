export interface ConnectionGroup {
    source: string;
    sourceType: string;
    destination: string;
    destinationType: string;
    relationship?: string[];
    function: string;
}

export interface ProcessorGroup {
    processorName?: string
    id?: string;
    componentName?: string
}

export interface PortGroup {
    portName?: string
    sourceType: string
}

export enum ProcessorGroupRelationEnum {
    SUCCESS = 'success',
    BASH_FAILURE = 'nonzero status',
    BASH_SUCCESS = 'output stream',
    AUTO_TERMINATE = 'success',
    EVENT_NAME = 'event_name',
    UNMATCHED = 'unmatched',
    PARSE_EVENT_INPUT = 'parse_event_input'
}

export const portObjList: PortGroup[] = [
    {
        portName: 'passEventNameOutput',
        sourceType: 'OUTPUT_PORT'
    },
    {
        portName: 'sendJsonOutput',
        sourceType: 'OUTPUT_PORT'
    },
    {
        portName: 'receivedPortInput',
        sourceType: 'INPUT_PORT'
    }
];

export const processorObjList: ProcessorGroup[] = [
    {
        processorName: 'bashScriptCode',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.ExecuteStreamCommand'
    },
    {
        processorName: 'successLogMessage',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.LogMessage'
    },
    {
        processorName: 'failedLogMessage',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.LogMessage'
    },
    {
        processorName: 'noEventNameError',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.LogMessage'
    },
    {
        processorName: 'routeOnEventName',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.RouteOnAttribute'
    },
    {
        processorName: 'updateEventName',
        id: null,
        componentName: 'org.apache.nifi.processors.attributes.UpdateAttribute'
    },
    {
        processorName: 'getFile',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.GetFile'
    },
    {
        processorName: 'attributesToJson',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.AttributesToJSON'
    },
    {
        processorName: 'addingJsonAttribute',
        id: null,
        componentName: 'org.apache.nifi.processors.attributes.UpdateAttribute'
    },
    {
        processorName: 'routeOnAttribute',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.RouteOnAttribute'
    }

];

export const connectionList: ConnectionGroup[] = [
    {
        source: 'bashScriptCode',
        sourceType: 'PROCESSOR',
        destination: 'successLogMessage',
        destinationType: 'PROCESSOR',
        relationship: [ProcessorGroupRelationEnum.BASH_SUCCESS],
        function: 'connect'
    },
    {
        source: 'bashScriptCode',
        sourceType: 'PROCESSOR',
        destination: 'failedLogMessage',
        destinationType: 'PROCESSOR',
        relationship: [ProcessorGroupRelationEnum.BASH_FAILURE],
        function: 'connect'
    },
    {
        source: 'successLogMessage',
        sourceType: 'PROCESSOR',
        destination: 'addingJsonAttribute',
        destinationType: 'PROCESSOR',
        relationship: [ProcessorGroupRelationEnum.SUCCESS],
        function: 'connect'
    },
    {
        source: 'routeOnEventName',
        sourceType: 'PROCESSOR',
        destination: 'passEventNameOutput',
        destinationType: 'OUTPUT_PORT',
        relationship: [ProcessorGroupRelationEnum.EVENT_NAME],
        function: 'portConnect'
    },
    {
        source: 'routeOnEventName',
        sourceType: 'PROCESSOR',
        destination: 'noEventNameError',
        destinationType: 'PROCESSOR',
        relationship: [ProcessorGroupRelationEnum.UNMATCHED],
        function: 'connect'
    },
    {
        source: 'updateEventName',
        sourceType: 'PROCESSOR',
        destination: 'routeOnEventName',
        destinationType: 'PROCESSOR',
        relationship: [ProcessorGroupRelationEnum.SUCCESS],
        function: 'connect'
    },
    {
        source: 'getFile',
        sourceType: 'PROCESSOR',
        destination: 'updateEventName',
        destinationType: 'PROCESSOR',
        relationship: [ProcessorGroupRelationEnum.SUCCESS],
        function: 'connect'
    },
    {
        source: 'attributesToJson',
        sourceType: 'PROCESSOR',
        destination: 'sendJsonOutput',
        destinationType: 'OUTPUT_PORT',
        relationship: [ProcessorGroupRelationEnum.SUCCESS],
        function: 'portConnect'
    },
    {
        source: 'addingJsonAttribute',
        sourceType: 'PROCESSOR',
        destination: 'attributesToJson',
        destinationType: 'PROCESSOR',
        relationship: [ProcessorGroupRelationEnum.SUCCESS],
        function: 'connect'
    },
    {
        source: 'routeOnAttribute',
        sourceType: 'PROCESSOR',
        destination: 'bashScriptCode',
        destinationType: 'PROCESSOR',
        relationship: [ProcessorGroupRelationEnum.PARSE_EVENT_INPUT],
        function: 'connect'
    },
    {
        source: 'receivedPortInput',
        sourceType: 'INPUT_PORT',
        destination: 'routeOnAttribute',
        destinationType: 'PROCESSOR',
        relationship: [],
        function: 'portConnect'
    }
];