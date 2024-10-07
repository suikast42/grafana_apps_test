import {
    DataSourceInstanceSettings,
    CoreApp,
    ScopedVars, DataQueryRequest, DataQueryResponse, LiveChannelScope,

} from '@grafana/data';
import {DataSourceWithBackend, getGrafanaLiveSrv, getTemplateSrv} from '@grafana/runtime';

import {MyQuery, MyDataSourceOptions, DEFAULT_QUERY} from './types';
import {merge, Observable} from "rxjs";
import {
    MyQueryStandardVariableSupport
} from "../pages/Repeating/components/compomenets";

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
    constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
        super(instanceSettings);
        this.variables = new MyQueryStandardVariableSupport()
        // this.variables = new MyQueryCustomVariableSupport(this)
        // this.variables = new MyQueryDataSourceVariableSupport()
    }

    getDefaultQuery(_: CoreApp): Partial<MyQuery> {
        return DEFAULT_QUERY;
    }

    applyTemplateVariables(query: MyQuery, scopedVars: ScopedVars) {
        query.queryText = getTemplateSrv().replace(query.queryText, scopedVars)
        query.pathFilter = getTemplateSrv().replace(query.pathFilter, scopedVars)
        // console.log(getTemplateSrv().replace(query.queryText, scopedVars));
        // console.log( getTemplateSrv().replace(query.pathFilter, scopedVars));
        return {
            ...query,
        };

        // return {
        //     ...query,
        //     queryText: getTemplateSrv().replace(query.queryText, scopedVars),
        //     pathFilter: getTemplateSrv().replace(query.pathFilter, scopedVars),
        // };
    }

    filterQuery(query: MyQuery): boolean {
        // if no query has been provided, prevent the query from being executed
        return !!query.queryText;
    }

    query(request: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
        if (request.liveStreaming) {
            const observables = request.targets.map((query, index) => {
                if (!query.pathFilter) {
                    console.log(`Call liveStreaming: ${query.queryText}`);
                } else {
                    console.log(`Call liveStreaming: ${query.queryText} with pathFilter: ${query.pathFilter}`);
                }

                return getGrafanaLiveSrv().getDataStream({
                    addr: {
                        scope: LiveChannelScope.DataSource,
                        namespace: this.uid,
                        path: `${query.queryText}`, // this will allow each new query to create a new connection
                        data: {
                            ...query,
                        },
                    },
                });
            });
            return merge(...observables);
        }
        const response = super.query(request)
        response.forEach((value) => {
            // TODO: create an issue: errors is always undefined
            if (!request.targets[0].pathFilter) {
                console.log(`Query call queryText: ${request.targets[0].queryText}`);
            } else {
                console.log(`Query call queryText: ${request.targets[0].queryText}/${request.targets[0].pathFilter}`);
            }

            if (value.error) {
                console.error(`Error for call: ${request.targets[0].queryText}.  Error message is: ${value.error.message}`);
            }


        }).then(r => {
            if (r !== undefined) {
                console.error(r)
            }
        });
        return response
    }
}

// function stringToHash(value?: string  ) {
//     return ""
//     // if (!value) {
//     //     value = "All"
//     // }
//     // return value.split('').reduce((hash, char) => {
//     //     return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
//     // }, 0);
// }
