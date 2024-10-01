import {
    CustomVariableSupport,
    DataQueryRequest,
    DataQueryResponse, DataSourceVariableSupport,
    StandardVariableQuery,
    StandardVariableSupport
} from "@grafana/data";
import {DataSource} from "../../../nested-demods-datasource/datasource";
import {MyDataSourceOptions, MyQuery} from "../../../nested-demods-datasource/types";
import {MyQueryEditor} from "../../../nested-demods-datasource/components/MyQueryEditor";
import {Observable} from "rxjs";

// Works but [query editor](http://localhost:3000/d/fdzgeplnixzi8d/new-dashboard?orgId=1&editview=templating&editIndex=0) in variables editor.
export class MyQueryStandardVariableSupport extends StandardVariableSupport<DataSource, MyQuery, MyDataSourceOptions> {

    toDataQuery(query: StandardVariableQuery): MyQuery {
        // @ts-ignore
        const rquery: MyQuery = {
            refId : query.refId,
            // @ts-ignore
            queryText:  query.queryText,
        };
        return rquery
    }


}

// Not works out of box with [query editor](http://localhost:3000/d/fdzgeplnixzi8d/new-dashboard?orgId=1&editview=templating&editIndex=0) in variables editor.
// Query Ediyor part works but can't create a response. Because Query Aborted Error
// Not works as [scenes variable filter](http://localhost:3000/a/acme-demo-app/page-with-repeats?var-devices=$__all).
// createQueryVariableRunner.js detects only CustomVariableSupport  StandardVariableSupport and LagacyVariableSupport. But not DataSourceVariableSupport
export class MyQueryCustomVariableSupport extends CustomVariableSupport<DataSource, MyQuery, MyQuery> {


    constructor(private readonly datasource: DataSource) {
        super();
        this.datasource = datasource;
        // this.query = this.query.bind(this);
    }

    editor =  MyQueryEditor
    query(request: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
        // response.forEach(row => {console.log(row)})
        return this.datasource.query(request);
    }
}


// Works out of box with [query editor](http://localhost:3000/d/fdzgeplnixzi8d/new-dashboard?orgId=1&editview=templating&editIndex=0) in variables editor.
// Not works as [scenes variable filter](http://localhost:3000/a/acme-demo-app/page-with-repeats?var-devices=$__all).
// createQueryVariableRunner.js detects only CustomVariableSupport  StandardVariableSupport and LagacyVariableSupport. But not DataSourceVariableSupport
export class MyQueryDataSourceVariableSupport extends DataSourceVariableSupport<DataSource, MyQuery, MyDataSourceOptions> {


}
