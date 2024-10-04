import {
    EmbeddedScene,
    QueryVariable, SceneByFrameRepeater,
    SceneControlsSpacer, SceneDataNode, SceneFlexItem,
    SceneFlexLayout,
    SceneQueryRunner, SceneRefreshPicker, SceneTimePicker,
    SceneTimeRange, SceneVariableSet, VariableValueSelectors
} from "@grafana/scenes";
import {DATASOURCE_CUSTOMDS_REF} from "../../constants";
import {VariableRefresh} from "@grafana/data";
import {getDeviceVizPanelPerDataframe} from "./components/DeviceVizPanelPerDataframe";

export const getTabRepeatByDataframe = () => {
    const timeRange = new SceneTimeRange({
        from: 'now-6h',
        to: 'now',
    });
    const queryVariables = new QueryVariable({
        name: 'devices',
        datasource: DATASOURCE_CUSTOMDS_REF,
        query:{
            refId: 'A',
            queryText: "devices",
            constant: 2.1,
            refresh:VariableRefresh.onTimeRangeChanged,
        },
        allValue: "All",
        isMulti: true,
        includeAll: true,
        defaultToAll: true,

    })
    const dataQuery = new SceneQueryRunner({
        datasource: DATASOURCE_CUSTOMDS_REF,
        liveStreaming: true,
        $timeRange: new SceneTimeRange({from: 'now-24h', to: 'now'}),
        queries: [
            {
                refId: 'A',
                queryText: 'devices_per_frame/devices',
                // pathFilter: '$devices',
                constant: 2.78,
            },
        ],

    })


    const body=  new SceneByFrameRepeater({
        body: new SceneFlexLayout({
            direction: 'row',
            wrap: 'wrap',
            children: [],
        }),
        getLayoutChild: (data, frame) => {
            return new SceneFlexItem({
                height: '50%',
                minWidth: '20%',
                body: getDeviceVizPanelPerDataframe(frame.name || 'no device found in frame.',new SceneDataNode({
                    data: {
                        ...data,
                        series: [frame],
                    },
                })),
            });
        },
    });

    return new EmbeddedScene({
        $timeRange: timeRange,
        $variables: new SceneVariableSet({
            variables: [queryVariables],
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

