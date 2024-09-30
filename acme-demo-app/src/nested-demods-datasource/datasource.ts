import {
    DataSourceInstanceSettings,
    CoreApp,
    ScopedVars, DataQueryRequest, DataQueryResponse, LiveChannelScope,

} from '@grafana/data';
import {DataSourceWithBackend, getGrafanaLiveSrv, getTemplateSrv} from '@grafana/runtime';

import {MyQuery, MyDataSourceOptions, DEFAULT_QUERY} from './types';
import {merge, Observable} from "rxjs";
import {MyQueryStandardVariableSupport} from "../pages/Repeating/components/compomenets";
import {types} from "sass";
import Error = types.Error;

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
    constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
        super(instanceSettings);
        this.variables = new MyQueryStandardVariableSupport()
    }

    getDefaultQuery(_: CoreApp): Partial<MyQuery> {
        return DEFAULT_QUERY;
    }

    applyTemplateVariables(query: MyQuery, scopedVars: ScopedVars) {
        return {
            ...query,
            queryText: getTemplateSrv().replace(query.queryText, scopedVars),
        };
    }

    filterQuery(query: MyQuery): boolean {
        // if no query has been provided, prevent the query from being executed
        return !!query.queryText;
    }

    query(request: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
        if (request.liveStreaming) {
            const observables = request.targets.map((query, index) => {
                return getGrafanaLiveSrv().getDataStream({
                    addr: {
                        scope: LiveChannelScope.DataSource,
                        namespace: this.uid,
                        path: `my-ws/custom-${query.queryText}`, // this will allow each new query to create a new connection
                        data: {
                            ...query,
                        },
                    },
                });
            });
            return merge(...observables);
        }
        const response = super.query(request)
        response.forEach(value => {
            // TODO: create an issue: errors is always undefined
            if (value.error) {
                console.error(`Error for call: ${request.targets[0].queryText}.  Error message is: ${value.error.message}`);
            }


        }).then(r => {
            if (r !== undefined) {
                console.log(r)
            }
        });
        return response
    }
}
