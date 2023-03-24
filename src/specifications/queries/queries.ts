export function checkName(coulmnName: string, tableName: string) {
    const querStr = `SELECT ${coulmnName}, pid FROM spec.${tableName} WHERE ${coulmnName} = '$1'`;
    return querStr
}

export function checkPipelineName(coulmnName: string, tableName: string){
    const querStr = `SELECT ${coulmnName}, pid FROM transformers.${tableName} WHERE ${coulmnName} = '$1'`;
    return querStr 
}

export function checkDuplicacy(columnNames: string[], tableName: string, JsonProperties: string[], conditionData) {
    const querStr = `SELECT ${columnNames[0]},${columnNames[1]} FROM spec.${tableName} WHERE (${JsonProperties[0]}->${JsonProperties[1]}) ::jsonb = ('${conditionData}') ::jsonb `;
    return querStr;
}

export function insertSchema(columnNames: string[], tableName: string) {
    const queryStr = `INSERT INTO spec.${tableName}(${columnNames[0]}, ${columnNames[1]}) VALUES ($1,$2) RETURNING pid`;
    return queryStr;
}

export function insertPipeline(columnNames: string[], tableName: string, columnValues: any[]) {
    let queryStr;
    if (columnNames.length > 1) {
        queryStr = `INSERT INTO spec.${tableName}(${columnNames[0]}, ${columnNames[1]}) VALUES ('${columnValues[0]}',${columnValues[1]}) RETURNING pid`;
    }
    else {
        queryStr = `INSERT INTO spec.${tableName}(${columnNames[0]}) VALUES ('${columnValues[0]}') RETURNING pid`;

    }
    return queryStr;
}

export function checkDatasetDuplicacy(conditionData) {
    let queryStr = `SELECT dataset_name,dataset_data FROM spec.dataset WHERE 
    (dataset_data->'input'->'properties'->'dataset'->'properties'->'items'->'items'->'properties') ::jsonb = ('${conditionData}') ::jsonb`
    return queryStr
}

export function createTable(tableName: string, columnNames: string[], dbColProperties: string[], uniqueColumns?: string[]) {
    let createSubQuery = '';
    let createQueryStr = `CREATE TABLE IF NOT EXISTS ingestion.${tableName} (pid  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            is_deleted BOOLEAN   DEFAULT FALSE,
            event_by   INT NOT NULL DEFAULT 1,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `;
    if (columnNames.length == dbColProperties.length) {
        for (let i = 0; i < columnNames.length; i++) {
            if (i < columnNames.length - 1) {
                createSubQuery = '';
                createSubQuery += columnNames[i] + ' ' + dbColProperties[i] + ',';
                createQueryStr += createSubQuery;
            }
            else {
                createSubQuery = '';
                createSubQuery += columnNames[i] + ' ' + dbColProperties[i]
                if (uniqueColumns?.length > 0) {
                    createSubQuery += ', UNIQUE(' + [...uniqueColumns] + '));'
                }
                else {
                    createSubQuery += ');';
                }
                createQueryStr += createSubQuery;
            }
        }
        console.log("create Query string is:", createQueryStr);
        return createQueryStr;
    }
}

export function insertTransformer(transformer_file: string) {
    const queryStr = `INSERT INTO spec.transformer(transformer_file) VALUES ('${transformer_file}') 
    ON CONFLICT ON CONSTRAINT transformer_transformer_file_key 
    DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING pid; `;
    return queryStr;
}

export function getEventData(eventName: string) {
    const queryStr = `SELECT event_name FROM spec.event WHERE event_name = '${eventName}'`;
    return queryStr;
}

export function getdatasetName(datasetName: string) {
    const queryStr = `SELECT dataset_name FROM spec.dataset where dataset_name='${datasetName}'`;
    return queryStr;
}

export function getPipelineSpec(pipelineName: string) {
    const queryStr = `SELECT pipeline.pid,transformer_file, event_name, dataset_name
    FROM spec.pipeline
    LEFT JOIN spec.event ON event.pid = pipeline.event_pid
    LEFT JOIN spec.dataset ON dataset.pid  = pipeline.dataset_pid
    LEFT JOIN spec.transformer ON transformer.pid = pipeline.transformer_pid
    WHERE pipeline_name = '${pipelineName}'`;
    return queryStr;
}


export function insertIntoSpecPipeline(pipeline_name?: string) {
    const queryStr = `INSERT INTO transformers.pipeline (pipeline_name)
    VALUES ('${pipeline_name}'
    ) RETURNING *`;
    return queryStr
}

export function insertIntoSchedule(columnNames: string[], columnValues: any[]) {
    let queryStr = `INSERT INTO spec.schedule(${columnNames[0]},${columnNames[1]}) VALUES (${columnValues[0]},'${columnValues[1]}') RETURNING pid`;
    return queryStr;
}

export function updateSchedule(schedule_type: string, pid: number) {
    let queryStr = `UPDATE spec.schedule SET scheduled_at = '${schedule_type}' where pid = ${pid}`;
    return queryStr;
}

export function checkRecordExists(coulmnName: string, tableName: string) {
    const querStr = `SELECT ${coulmnName}, pid FROM spec.${tableName} WHERE ${coulmnName} = $1`;
    return querStr;
}

export function getGrammar(tableName, grammarName) {
    const querStr = `SELECT schema FROM spec."${tableName}" WHERE program = $1`;
    return {query: querStr, values: [grammarName]};
}





