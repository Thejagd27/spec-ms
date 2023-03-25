import {GenericFunction} from './../genericFunction';
// import {checkDuplicacy, checkName, createTable, insertPipeline, insertSchema} from '../../queries/queries';
import {DataSource} from 'typeorm';
import {InjectDataSource} from '@nestjs/typeorm';
// import {dimensionSchemaData} from "../../../utils/spec-data";
// import {dimensionResponse} from "../../dto/specData.dto";
//
export class DimensionService {
    constructor(@InjectDataSource() private dataSource: DataSource, private specService: GenericFunction) {
    }

    async createDimension(dimensionDTO) {
//         let dbColumns = [];
//         let newObj = this.specService.convertKeysToLowerCase(dimensionDTO);
//         const isValidSchema: any = await this.specService.ajvValidator(dimensionSchemaData, newObj);
//         if (isValidSchema?.errors) {
//             return {"code": 400, error: isValidSchema.errors}
//         } else {
//             let response: dimensionResponse = await this.validateRequiredFields(isValidSchema);
//             if (response.code == 400) {
//                 return {
//                     code: 400,
//                     error: response.error
//                 }
//             } else {
//                 let queryResult: any = checkName('dimension_name', "dimension");
//                 queryResult = queryResult.replace('$1', `${dimensionDTO?.dimension_name.toLowerCase()}`);
//                 const resultDname = await this.dataSource.query(queryResult);
//                 if (resultDname?.length > 0) {
//                     return {"code": 400, "error": "Dimension name already exists"};
//                 }
//                 else {
//                     let values = newObj?.input?.properties?.dimension?.items?.properties;
//                     let duplicacyQuery = checkDuplicacy(['dimension_name', 'dimension_data'], 'dimension', ['dimension_data', "'input'->'properties'->'dimension'->'items'->'properties'"], JSON.stringify(values));
//                     const result = await this.dataSource.query(duplicacyQuery);
//                     if (result?.length == 0) //If there is no record in the DB then insert the first schema
//                     {
//                         const queryRunner = this.dataSource.createQueryRunner();
//                         try {
//                             await queryRunner.connect();
//                             await queryRunner.startTransaction();
//                             let insertQuery = insertSchema(['dimension_name', 'dimension_data'], 'dimension');
//                             insertQuery = insertQuery.replace('$1', `'${dimensionDTO.dimension_name.toLowerCase()}'`);
//                             insertQuery = insertQuery.replace('$2', `'${JSON.stringify(newObj)}'`);
//                             const insertResult = await queryRunner.query(insertQuery);
//                             if (insertResult[0].pid) {
//                                 let dimension_pid = insertResult[0].pid;
//                                 const pipeline_name = dimensionDTO.dimension_name.toLowerCase() + '_pipeline';
//                                 let insertPipeLineQuery = insertPipeline(['pipeline_name', 'dimension_pid'], 'pipeline', [pipeline_name, dimension_pid]);
//                                 const insertPipelineResult = await queryRunner.query(insertPipeLineQuery);
//                                 if (insertPipelineResult[0].pid) {
//                                     let columnProperties = [];
//                                     let columnNames = [];
//                                     columnNames.push(Object.keys(values));
//                                     columnProperties.push(Object.values(values));
//                                     dbColumns = this.specService.getDbColumnNames(columnProperties[0]);
//                                     let tbName: string = newObj?.dimension_name;
//                                     let createQuery = createTable(tbName, columnNames[0], dbColumns);
//                                     await queryRunner.query(createQuery);
//                                     await queryRunner.commitTransaction();
//                                     return {
//                                         "code": 200,
//                                         "message": "Dimension spec created successfully",
//                                         "dimension_name": dimensionDTO.dimension_name,
//                                         "pid": insertResult[0].pid
//                                     };
//                                 }
//                                 else {
//                                     await queryRunner.rollbackTransaction();
//                                     return {"code": 400, "error": "Unable to insert into spec pipeline table"};
//
//                                 }
//                             } else {
//                                 await queryRunner.rollbackTransaction();
//                                 return {"code": 400, "error": "Unable to insert into spec table"};
//                             }
//                         } catch (error) {
//                             await queryRunner.rollbackTransaction();
//                             return {"code": 400, "error": "Something went wrong"}
//                         }
//                         finally {
//                             await queryRunner.release();
//                         }
//                     }
//                     else {
//                         return {"code": 400, "error": "Duplicate dimension not allowed"}
//                     }
//                 }
//             }
//         }
    }

//
//     async validateRequiredFields(inputData) {
//         let responseObj = {
//             code: 200,
//             error: ""
//         };
//         if (inputData?.input?.properties?.dimension?.items?.required &&
//             inputData?.input?.properties?.dimension?.items?.required?.length > 0) {
//             inputData?.input?.properties?.dimension?.items?.required?.map((key) => {
//                 if (!Object.keys(inputData?.input?.properties?.dimension?.items?.properties).includes(key)) {
//                     responseObj = {
//                         "code": 400,
//                         "error": 'One/more invalid required fields'
//                     }
//                 }
//             })
//         }
//         return responseObj;
//     }
}