import {StandardVariableQuery, StandardVariableSupport} from "@grafana/data";
import {DataSource} from "../../../nested-demods-datasource/datasource";
import {MyDataSourceOptions, MyQuery} from "../../../nested-demods-datasource/types";
import {MyQueryEditor} from "../../../nested-demods-datasource/components/MyQueryEditor";

export class MyQueryStandardVariableSupport extends StandardVariableSupport<DataSource, MyQuery, MyDataSourceOptions> {

    toDataQuery(query: StandardVariableQuery): MyQuery {
        const rquery: MyQuery = {
            refId : query.refId,
            queryText:  query.quertyText,
        };
        return rquery
    }

    editor=  MyQueryEditor;

}
