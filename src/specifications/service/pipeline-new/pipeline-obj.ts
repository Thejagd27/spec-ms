interface ProcessorConnectionRelation {
    relationship: string[];
    to: string;
}

export interface ProcessorGroup {
    processorName: string
    id: string;
    componentName: string
    connectToList: ProcessorConnectionRelation[]
}

export enum ProcessorGroupRelationEnum {
    SUCCESS = 'success',
    PYTHON_FAILURE = 'nonzero status',
    PYTHON_SUCCESS = 'output stream',
    AUTO_TERMINATE = 'success'
}

export const processorObjList: ProcessorGroup[] = [
    {
        processorName: 'generateFlowFile',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.GenerateFlowFile',
        connectToList: [
            {
                relationship: [ProcessorGroupRelationEnum.SUCCESS],
                to: 'pythonCode'
            }
        ]
    },
    {
        processorName: 'pythonCode',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.ExecuteStreamCommand',
        connectToList: [
            {
                relationship: [ProcessorGroupRelationEnum.PYTHON_SUCCESS],
                to: 'successLogMessage'
            },
            {
                relationship: [ProcessorGroupRelationEnum.PYTHON_FAILURE],
                to: 'failedLogMessage'
            }
        ]
    },
    {
        processorName: 'successLogMessage',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.LogMessage',
        connectToList: []
    },
    {
        processorName: 'failedLogMessage',
        id: null,
        componentName: 'org.apache.nifi.processors.standard.LogMessage',
        connectToList: []
    }
];
