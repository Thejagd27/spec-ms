export const masterSchema = {
    "type": "object",
    "properties": {
        "program": {
            "type": "string",
            "shouldnotnull": true
        },
        "input": {
            "type": "object",
            "shouldnotnull": true,
            "properties": {
                "type": {
                    "type": "string",
                    "pattern": "object",
                    "shouldnotnull": true
                },
                "properties": {
                    "type": "object",
                    "shouldnotnull": true,
                    "patternProperties": {
                        "^[a-zA-Z_]*$": {
                            "type": "object",
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "enum": ["string", "number", "boolean", "integer"],
                                    "shouldnotnull": true
                                }
                            },
                            "required": ["type", "unique"],
                            "shouldnotnull": true
                        }
                    }
                }
            }
        }
    }
};

export const scheduleSchema = {
    "type": "object",
    "properties": {
        "pipeline_name": {
            "type": "string",
            "shouldnotnull": true
        },
        "scheduled_at": {
            "type": "string",
            "shouldnotnull": true
        }
    },
    "required": [
        "pipeline_name",
        "scheduled_at",
    ],
};

export const schemaPipeline = {
    "type": "object",
    "properties": {
        "pipeline_name": {
            "type": "string",
            "shouldnotnull": true
        },
        "pipeline_type": {
            "type": "string",
            "enum": ["ingest_to_db", "dimension_to_db", "dataset_to_db"],
            "shouldnotnull": true
        }
    },
    "required": [
        "pipeline_name",
        "pipeline_type",
    ],
};

export const PipelineSchemaDimensiontoDB = {
    "type": "object",
    "properties": {
        "pipeline_name": {
            "type": "string",
            "shouldnotnull": true
        },
        "pipeline_type": {
            "type": "string",
            "shouldnotnull": true
        },
        "pipeline": {
            "type": "array",
            "shouldnotnull": true,

            "items": {
                "type": "object",
                "properties": {
                    "transformer_name": {
                        "type": "string",
                        "shouldnotnull": true
                    },
                    "dimension_name": {
                        "type": "string",
                        "shouldnotnull": true
                    }
                },
                "required": ["transformer_name", "dimension_name"]
            }
        }
    },
    "required": ["pipeline_name", "pipeline_type", "pipeline"]
};

export const PipelineSchemaDatasettoDB = {
    "type": "object",
    "properties": {
        "pipeline_name": {
            "type": "string",
            "shouldnotnull": true
        },
        "pipeline_type": {
            "type": "string",
            "shouldnotnull": true
        },
        "pipeline": {
            "type": "array",
            "shouldnotnull": true,

            "items": {
                "type": "object",
                "properties": {
                    "transformer_name": {
                        "type": "string",
                        "shouldnotnull": true
                    },
                    "dataset_name": {
                        "type": "string",
                        "shouldnotnull": true
                    }
                },
                "required": ["transformer_name", "dataset_name"]
            }
        }
    },
    "required": ["pipeline_name", "pipeline_type", "pipeline"]

};

export const PipelineSchemaIngesttoDB = {
    "type": "object",
    "properties": {
        "pipeline_name": {
            "type": "string",
            "shouldnotnull": true
        },
        "pipeline_type": {
            "type": "string",
            "shouldnotnull": true
        },
        "pipeline": {
            "type": "array",
            "shouldnotnull": true,

            "items": {
                "type": "object",
                "properties": {
                    "transformer_name": {
                        "type": "string",
                        "shouldnotnull": true
                    },
                    "dataset_name": {
                        "type": "string",
                        "shouldnotnull": true
                    },
                    "dimension_name": {
                        "type": "string",
                        "shouldnotnull": true
                    },
                    "event_name": {
                        "type": "string",
                        "shouldnotnull": true
                    },

                },
                "required": ["transformer_name", "dataset_name", "dimension_name", "event_name"]
            }
        }
    },
    "required": ["pipeline_name", "pipeline_type", "pipeline"]

};