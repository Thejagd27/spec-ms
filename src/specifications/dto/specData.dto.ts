import {ApiProperty} from "@nestjs/swagger";

export class obj {
    @ApiProperty()
    type: object
}

export class Pipelineobj {
    @ApiProperty()
    event_name: string
    @ApiProperty()
    dataset_name: string
    @ApiProperty()
    dimension_name: string
    @ApiProperty()
    transformer_name: string
}

export class specDimensionDTO {
    @ApiProperty()
    program: string;
    @ApiProperty()
    input: obj
}

export class specDataset {
    @ApiProperty()
    ingestion_type: string;
    @ApiProperty()
    dataset_name: string;
    @ApiProperty()
    input: obj
}

export class specEventDTO {
    @ApiProperty()
    ingestion_type: string;
    @ApiProperty()
    event_name: JSON;
    @ApiProperty()
    input: obj
}

export class specTrasformer {
    @ApiProperty()
    ingestion_name: string;
    @ApiProperty()
    key_file: string;
    @ApiProperty()
    program: string;
    @ApiProperty()
    operation: string;
}

export class eventResponse {
    code: number;
    error?: string;
}

export class dimensionResponse {
    code: number;
    error?: string;
}

export class datasetResponse {
    code: number;
    error?: string;
}

export class pipelineDto {
    @ApiProperty()
    pipeline_name: string;
    @ApiProperty()
    pipeline_type: string;
    @ApiProperty({isArray: true, type: () => Pipelineobj})
    pipeline: object[]
}

export class Result {
    code: number;
    message?: string;
    error?: string;
}

export class scheduleDto {
    @ApiProperty()
    processor_group_name?: string;
    @ApiProperty()
    scheduled_at?: string;
}


export class s3DTO {
    @ApiProperty()
    scheduled_at?: string;
    @ApiProperty()
    scheduled_type: string;
}

export class GetGrammar {
    @ApiProperty()
    grammar_type: string;
    @ApiProperty()
    grammar_name: string;
}