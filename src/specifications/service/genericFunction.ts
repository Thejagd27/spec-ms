import {Injectable} from "@nestjs/common";
import Ajv from "ajv";
import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats"
import * as fs from 'fs';
import jsonObject from './pipeline-new/jsonObjects.json'

const ajv = new Ajv2019();
addFormats(ajv);
ajv.addKeyword({
    keyword: 'shouldnotnull',
    validate: (schema, data) => {
        if (schema) {
            if (typeof data === 'object') return typeof data === 'object' && Object.keys(data).length > 0
            if (typeof data === 'string') return typeof data === 'string' && data.trim() !== ''
            if (typeof data === 'number') return typeof data === 'number'
        }
        else return true;
    }
});


@Injectable()
export class GenericFunction {
    async ajvValidator(schema, inputData) {
        const isValid = ajv.validate(schema, inputData);
        if (isValid) {
            return inputData;
        } else {
            return {errors: ajv.errors};
        }
    }

// converting all the keys in request body to lowercase to avoid duplication
    convertKeysToLowerCase(dimensionDTO) {
        let json = JSON.stringify(dimensionDTO);
        let obj = json.replace(/"([\w]+)":/g, function ($0, $1) {
            return ('"' + $1.toLowerCase() + '":');
        });
        let newObj = JSON.parse(obj);
        return newObj
    }

    getDbColumnNames(columnProperties) {
        let dbColumns = []
        columnProperties.forEach((element, index) => {
            if (element?.type == "string") {
                dbColumns[index] = 'VARCHAR'
            }
            else if (element?.type == "integer") {
                dbColumns[index] = 'INTEGER';
            }
            else if (element?.type == "json") {
                dbColumns[index] = 'jsonb';
            }
            else if (element?.type === 'number') {
                dbColumns[index] = 'NUMERIC';
            }
            else if (element?.type === 'boolean') {
                dbColumns[index] = 'BOOLEAN';
            }
            else if (element?.type == 'date') {
                dbColumns[index] = 'TIMESTAMP WITH TIME ZONE';
            }
        });
        return dbColumns;
    }


    replaceJsonValues(jsonObjName: any, replacements: any) {
        let jsonObj;
        for (let jsonRecord of jsonObject) {
            if (jsonRecord.name === jsonObjName) {
                jsonObj = jsonRecord.object;
            }
        }
        let jsonString = JSON.stringify(jsonObj);
        const keys = Object.keys(replacements);

        keys.forEach(key => {
            const regex = new RegExp(`\\#\\{${key}\\}`, 'g');
            jsonString = jsonString.replace(regex, replacements[key]);
        });
        return JSON.parse(jsonString);
    }
}
