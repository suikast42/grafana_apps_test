import {
    EmbeddedScene,
    QueryVariable,
    SceneByVariableRepeater, SceneControlsSpacer,
    SceneFlexLayout,
    SceneQueryRunner, SceneRefreshPicker, SceneTimePicker,
    SceneTimeRange, SceneVariableSet, VariableValueSelectors
} from "@grafana/scenes";
import {DATASOURCE_CUSTOMDS_REF} from "../../constants";
import {VariableRefresh} from "@grafana/data";
import {getDeviceVizPanel} from "./components/DeviceVizPanel";

export const getTabRepeatByQueryVariable = () => {
    const timeRange = new SceneTimeRange({
        from: 'now-6h',
        to: 'now',
    });
    const devicesVariable = new QueryVariable({
        name: 'devices',
        datasource: DATASOURCE_CUSTOMDS_REF,
        query:{
            refId: 'A',
            queryText: "devices",
            refresh:VariableRefresh.onTimeRangeChanged,
        },
        allValue: "All",
        isMulti: true,
        includeAll: true,
        defaultToAll: true,

    })
    const dataQuery = new SceneQueryRunner({
        datasource: DATASOURCE_CUSTOMDS_REF,
        liveStreaming: false,
        $timeRange: new SceneTimeRange({from: 'now-24h', to: 'now'}),
        queries: [
            {
                refId: 'A',
                queryText: "devices_per_label",
                pathFilter: '${devices}',
                constant: 4.2,
            },
        ],

    })
    const body=  new SceneByVariableRepeater({
        variableName: 'devices',
        body: new SceneFlexLayout({
            children: [],
        }),
        getLayoutChild: (option) => new SceneFlexLayout({
            minWidth:400,
            maxHeight:400,
            children: [
                // new SceneFlexItem({
                //     body: PanelBuilders.timeseries()
                //         // Title is using variable value
                //         .setTitle(option.value.toString())
                //         .build(),
                // }),
                getDeviceVizPanel(option.value),
            ],
        }),
    })
    return new EmbeddedScene({
        $timeRange: timeRange,
        $variables: new SceneVariableSet({
            variables: [devicesVariable],
        }),
        $data: dataQuery,
        body: body,
        controls: [
            new VariableValueSelectors({}),
            new SceneControlsSpacer(),
            new SceneTimePicker({ isOnCanvas: true }),
            new SceneRefreshPicker({
                intervals: ['5s', '1m', '1h'],
                isOnCanvas: true,
            }),
        ],
    });
};

