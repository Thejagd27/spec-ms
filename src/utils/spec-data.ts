export const dimensionSchemaData = {
    "type": "object",
    "properties": {
        "ingestion_type": {
            "type": "string",
            "pattern": "dimension",
            "shouldnotnull": true
        },
        "dimension_name": {
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
                    "properties": {
                        "dimension_name": {
                            "type": "object",
                            "shouldnotnull": true,
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "enum": ["string", "number", "boolean", "integer"],
                                    "shouldnotnull": true
                                }
                            },
                            "required": ["type"]
                        },
                        "dimension": {
                            "type": "object",
                            "shouldnotnull": true,
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "pattern": "array",
                                    "shouldnotnull": true
                                },
                                "items": {
                                    "type": "object",
                                    "shouldnotnull": true,
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": ["object"],
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
                                                    "required": ["type"],
                                                    "shouldnotnull": true
                                                }
                                            }
                                        },
                                        "required": {
                                            "type": "array",
                                            "shouldnotnull": true,
                                        }
                                    },
                                    "required": ["type", "properties", "required"],
                                    "additionalProperties": false
                                },
                                "required": {
                                    "type": "array",
                                    "shouldnotnull": false
                                }
                            },
                            "required": ["type", "items"],
                        },
                        "target_table": {
                            "type": "object",
                            "shouldnotnull": true,
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "pattern": "string",
                                    "shouldnotnull": true
                                },
                                "pattern":{
                                    "type": "string",
                                    "shouldnotnull": true
                                }
                            },
                            "required": ["type", "pattern"]
                        }
                    },
                    "required": ["dimension_name", "dimension"]
                },
                "required": {
                    "type": "array",
                    "items": [{
                        "shouldnotnull": true,
                        "type": "string",
                        "pattern": "dimension_name"
                    }, {"shouldnotnull": true, "type": "string", "pattern": "dimension"}],
                    "shouldnotnull": true,
                    "minItems": 2,
                    "additionalItems": false
                }
            },
            "required": ["type", "properties", "required"],
            "additionalProperties": false
        }
    },
    "required": ["ingestion_type", "dimension_name", "input"],
    "additionalProperties": false
};

export const eventSchemaData = {
    "type": "object",
    "properties": {
        "ingestion_type": {
            "type": "string",
            "pattern": "event",
            "shouldnotnull": true
        },
        "event_name": {
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
                    "properties": {
                        "event_name": {
                            "type": "object",
                            "shouldnotnull": true,
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "enum": ["string", "number", "boolean", "integer"],
                                    "shouldnotnull": true
                                }
                            },
                            "required": ["type"]
                        },
                        "event": {
                            "type": "object",
                            "shouldnotnull": true,
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "pattern": "array",
                                    "shouldnotnull": true
                                },
                                "items": {
                                    "type": "object",
                                    "shouldnotnull": true,
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": ["object"],
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
                                                    "required": ["type"],
                                                    "shouldnotnull": true
                                                }
                                            }
                                        },
                                        "required": {
                                            "type": "array",
                                            "shouldnotnull": true
                                        }
                                    },
                                    "required": ["type", "properties", "required"],
                                    "additionalProperties": false
                                },
                                "required": {
                                    "type": "array",
                                    "shouldnotnull": false
                                }
                            },
                            "required": ["type", "items"],
                        }
                    },
                    "required": ["event_name", "event"],
                    "additionalProperties": false
                },
                "required": {
                    "type": "array",
                    "items": [{
                        "shouldnotnull": true,
                        "type": "string",
                        "pattern": "event_name"
                    }, {"shouldnotnull": true, "type": "string", "pattern": "event"}],
                    "shouldnotnull": true,
                    "minItems": 2,
                    "additionalItems": false
                }
            },
            "required": ["type", "properties", "required"],
            "additionalProperties": false
        }
    },
    "required": ["ingestion_type", "event_name", "input"],
    "additionalProperties": false
};

export const transformerSchemaData = {
    "ingestion_type": "transformer",
    "input": {
        "type": "object",
        "shouldnotnull": true,
        "properties": {
            "ingestion_name": {
                "type": "string",
                "shouldnotnull": true
            },
            "key_file": {
                "type": "string",
                "pattern": "^.*\.(csv)$",
                "shouldnotnull": true
            },
            "program": {
                "type": "string",
                "shouldnotnull": true
            },
            "operation": {
                "type": "string",
                "shouldnotnull": true

            },

        },
        "required": [
            "ingestion_name",
            "key_file",
            "program",
            "operation"
        ]
    }
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

export const datasetSchemaData = {
    "type": "object",
    "properties": {
        "ingestion_type": {
            "type": "string",
            "pattern": "dataset",
            "shouldnotnull": true
        },
        "dataset_name": {
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
                    "properties": {
                        "dataset_name": {
                            "type": "object",
                            "shouldnotnull": true,
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "enum": [
                                        "string"
                                    ],
                                    "shouldnotnull": true
                                }
                            }
                        },
                        "dimensions": {
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
                                    "properties": {
                                        "table": {
                                            "type": "object",
                                            "shouldnotnull": true,
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "pattern": "string",
                                                    "shouldnotnull": true
                                                },
                                                "pattern":{
                                                    "type": "string",
                                                    "shouldnotnull": true
                                                }
                                            },
                                            "required": ["type","pattern"]
                                        },
                                        "column": {
                                            "type": "array",
                                            "shouldnotnull": true,
                                            "items": {
                                                "type": "string",
                                                "shouldnotnull": true
                                            }
                                        },
                                        "merge_on_col": {
                                            "type": "object",
                                            "shouldnotnull": true,
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "pattern": "string",
                                                    "shouldnotnull": true
                                                },
                                                "pattern":{
                                                    "type": "string",
                                                    "shouldnotnull": true
                                                }
                                            },
                                            "required": ["type","pattern"]
                                        }
                                    },
                                    "required": [
                                        "table",
                                        "column",
                                        "merge_on_col"
                                    ]
                                },
                                "required": {
                                    "type": "array",
                                    "shouldnotnull": true,
                                    "minItems": 3,
                                    "maxItems": 3,
                                    "items": [
                                        {
                                            "type": "string",
                                            "pattern": "table",
                                            "shouldnotnull": true
                                        },
                                        {
                                            "type": "string",
                                            "pattern": "column",
                                            "shouldnotnull": true
                                        },
                                        {
                                            "type": "string",
                                            "pattern": "merge_on_col",
                                            "shouldnotnull": true
                                        }
                                    ]
                                }
                            },
                            "required": [
                                "type",
                                "properties",
                                "required"
                            ]
                        },
                        "dataset": {
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
                                    "properties": {
                                        "items": {
                                            "type": "object",
                                            "shouldnotnull": true,
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "pattern": "array",
                                                    "shouldnotnull": true
                                                },
                                                "shouldnotnull": true,
                                                "items": {
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
                                                                            "enum": [
                                                                                "string",
                                                                                "number",
                                                                                "boolean",
                                                                                "integer"
                                                                            ],
                                                                            "shouldnotnull": true
                                                                        }
                                                                    },
                                                                    "required": [
                                                                        "type"
                                                                    ],
                                                                    "shouldnotnull": true
                                                                }
                                                            }
                                                        },
                                                        "required": {
                                                            "type": "array",
                                                            "shouldnotnull": true,
                                                            "items": {
                                                                "type": "string",
                                                                "shouldnotnull": true
                                                            }
                                                        }
                                                    },
                                                    "required": [
                                                        "type",
                                                        "properties",
                                                        "required"
                                                    ]
                                                }
                                            },
                                            "required": [
                                                "type",
                                                "items"
                                            ]
                                        },
                                        "group_by": {
                                            "type": "array",
                                            "shouldnotnull": true,
                                            "items": {
                                                "type": "string",
                                                "shouldnotnull": true
                                            }
                                        },
                                        "aggregate": {
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
                                                    "properties": {
                                                        "function": {
                                                            "type": "array",
                                                            "shouldnotnull": true,
                                                            "items": {
                                                                "type": "string"
                                                            }
                                                        },
                                                        "target_table": {
                                                            "type": "object",
                                                            "shouldnotnull": true,
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "pattern": "string",
                                                                    "shouldnotnull": true
                                                                },
                                                                "pattern":{
                                                                    "type": "string",
                                                                    "shouldnotnull": true
                                                                }
                                                            },
                                                            "required": ["type","pattern"]
                                                        },
                                                        "numerator_col": {
                                                            "type": "object",
                                                            "shouldnotnull": true,
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string"
                                                                }
                                                            },
                                                            "required": ["type"]
                                                        },
                                                        "denominator_col": {
                                                            "type": "object",
                                                            "shouldnotnull": true,
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string"
                                                                }
                                                            },
                                                            "required": ["type"]
                                                        },
                                                        "update_cols": {
                                                            "type": "array",
                                                            "shouldnotnull": true,
                                                            "items": {
                                                                "type": "string"
                                                            }
                                                        },
                                                        "columns": {
                                                            "type": "object",
                                                            "shouldnotnull": true,
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "pattern": "array",
                                                                    "shouldnotnull": true
                                                                },
                                                                "shouldnotnull": true,
                                                                "items": {
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
                                                                            "properties": {
                                                                                "column": {
                                                                                    "type": "array",
                                                                                    "shouldnotnull": true,
                                                                                    "items": {
                                                                                        "type": "string"
                                                                                    }
                                                                                },
                                                                                "table": {
                                                                                    "type": "object",
                                                                                    "shouldnotnull": true,
                                                                                    "properties": {
                                                                                        "type": {
                                                                                            "type": "string"
                                                                                        }
                                                                                    },
                                                                                    "required": ["type"]
                                                                                }
                                                                            },
                                                                            "required": [
                                                                                "column"
                                                                            ]
                                                                        },
                                                                        "required": {
                                                                            "type": "array",
                                                                            "shouldnotnull": true,
                                                                            "maxItems": 1,
                                                                            "items": [
                                                                                {
                                                                                    "type": "string",
                                                                                    "pattern": "column",
                                                                                    "shouldnotnull": true
                                                                                }
                                                                            ]
                                                                        }
                                                                    },
                                                                    "required": [
                                                                        "type",
                                                                        "properties",
                                                                        "required"
                                                                    ]
                                                                }
                                                            },
                                                            "required": [
                                                                "type",
                                                                "items"
                                                            ]
                                                        },
                                                        "filters": {
                                                            "type": "object",
                                                            "shouldnotnull": true,
                                                            "properties": {
                                                                "type": {
                                                                    "type": "string",
                                                                    "shouldnotnull": true
                                                                },
                                                                "properties": {
                                                                    "type": "object",
                                                                    "shouldnotnull": true,
                                                                    "properties": {
                                                                        "type": {
                                                                            "type": "string",
                                                                            "pattern": "object",
                                                                            "shouldnotnull": true
                                                                        },
                                                                        "filter_col": {
                                                                            "type": "object",
                                                                            "shouldnotnull": true,
                                                                            "properties": {
                                                                                "type": {
                                                                                    "type": "string"
                                                                                }
                                                                            },
                                                                            "required": ["type"]
                                                                        },
                                                                        "filter_type": {
                                                                            "type": "object",
                                                                            "shouldnotnull": true,
                                                                            "properties": {
                                                                                "type": {
                                                                                    "type": "string"
                                                                                }
                                                                            },
                                                                            "required": ["type"]
                                                                        },
                                                                        "filter": {
                                                                            "type": "object",
                                                                            "shouldnotnull": true,
                                                                            "properties": {
                                                                                "type": {
                                                                                    "type": "string"
                                                                                }
                                                                            },
                                                                            "required": ["type"]
                                                                        }
                                                                    },
                                                                    "required": [
                                                                        "filter_col",
                                                                        "filter_type",
                                                                        "filter"
                                                                    ]
                                                                }
                                                            },
                                                            "required": [
                                                                "type",
                                                                "properties"
                                                            ]
                                                        }
                                                    },
                                                    "required": [ "target_table"]
                                                },
                                                "required": {
                                                    "type": "array",
                                                    "shouldnotnull": true,
                                                    "maxItems": 1,
                                                    "items": [

                                                        
                                                        {
                                                            "type": "string",
                                                            "pattern": "target_table",
                                                            "shouldnotnull": true
                                                        }
                                                        
                                                    ]
                                                }
                                            },
                                            "required": [
                                                "properties",
                                                "type",
                                                "required"
                                            ]
                                        }
                                    },
                                    "required": [
                                        "items"
                                    ]
                                },
                                "required": {
                                    "type": "array",
                                    "shouldnotnull": true,
                                    "maxItems": 1,
                                    "items": {
                                        "type": "string",
                                        "pattern": "items",
                                        "shouldnotnull": true
                                    }
                                }
                            },
                            "required": [
                                "type",
                                "properties",
                                "required"
                            ]
                        }
                    },
                    "required": [
                        "dataset_name",
                        "dataset"
                    ]
                },
                "required": {
                    "type": "array",
                    "shouldnotnull": true,
                    "maxItems": 2,
                    "items": [
                        {
                            "type": "string",
                            "pattern": "dataset_name",
                            "shouldnotnull": true
                        },
                        {
                            "type": "string",
                            "pattern": "dataset",
                            "shouldnotnull": true
                        }
                    ]
                }
            },
            "required": [
                "type",
                "properties",
                "required"
            ]
        }
    },
    "required": [
        "ingestion_type",
        "dataset_name",
        "input"
    ],
    "additionalProperties": false
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
}