import {GenericFunction} from "../genericFunction";
import {Injectable} from "@nestjs/common";
import {GetGrammar} from "../../dto/specData.dto";
import {getGrammar} from '../../queries/queries';
import {DataSource} from "typeorm";

@Injectable()
export class Grammar {
    constructor(private dataSource: DataSource, private service: GenericFunction,) {
    }

    async getGrammar(inputData: GetGrammar) {
        let getGrammarSchema = {
            "type": "object",
            "properties": {
                "grammar_type": {
                    "type": "string",
                    "enum": [
                        "event",
                        "dataset",
                        "dimension"
                    ],
                    "shouldnotnull": true
                },
                "grammar_name": {
                    "type": "string",
                    "shouldnotnull": true
                },

            },
            "required": [
                "grammar_type",
                "grammar_name"
            ]
        };
        const grammarName = inputData.grammar_name;
        const grammarType = inputData.grammar_type;
        const isValidSchema: any = await this.service.ajvValidator(getGrammarSchema, inputData);
        if (isValidSchema.errors) {
            return {code: 400, error: isValidSchema.errors}
        }
        else {
            let tableName;
            switch (grammarType) {
                case 'event':
                    tableName = 'EventGrammar';
                    break;
                case 'dataset':
                    tableName = 'DatasetGrammar';
                    break;
                default:
                    tableName = 'DimesnionGrammar';
                    break;
            }

            try {
                const queryStr = await getGrammar(tableName, grammarName);
                const queryResult = await this.dataSource.query(queryStr.query, queryStr.values);
                if (queryResult.length > 0) {
                    return {
                        "code": 200,
                        "data": queryResult[0]
                    }
                }
                else {
                    return {
                        "code": 400,
                        "error": "No records found"
                    }
                }
            } catch (e) {
                console.error('grammar.service.getGrammar: ', e.message);
                throw new Error(e);
            }
        }
    }
}