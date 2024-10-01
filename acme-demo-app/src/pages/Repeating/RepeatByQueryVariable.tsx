import React, {  } from 'react';
import {
    EmbeddedScene,
    QueryVariable,
    SceneApp,
    SceneAppPage, SceneByVariableRepeater, SceneControlsSpacer,
    SceneFlexLayout, SceneQueryRunner, SceneRefreshPicker, SceneTimePicker, SceneTimeRange,
    SceneVariableSet,
    useSceneApp, VariableValueSelectors
} from '@grafana/scenes';
import {DATASOURCE_CUSTOMDS_REF, ROUTES} from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';
import {VariableRefresh} from "@grafana/data";
import {getDeviceVizPanel} from "./components/DeviceVizPanel";

const getTab1Scene = () => {
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
        liveStreaming: false,
        $timeRange: new SceneTimeRange({from: 'now-24h', to: 'now'}),
        queries: [
            {
                refId: 'A',
                queryText: "timeseries",
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





const getScene = () =>
    new SceneApp({
        pages: [
            new SceneAppPage({
                title: 'Examples ho to repeat panels and scenes objects',
                subTitle: 'This scene showcases a basic tabs functionality.',
                // Important: Mind the page route is ambiguous for the tabs to work properly
                url: prefixRoute(`${ROUTES.Repeating}`),
                hideFromBreadcrumbs: true,
                getScene: getTab1Scene,
                tabs: [
                    new SceneAppPage({
                        title: 'Repeat by Variable',
                        url: prefixRoute(`${ROUTES.Repeating}`),
                        getScene: getTab1Scene,
                    }),
                    // new SceneAppPage({
                    //     title: 'House locations',
                    //     url: prefixRoute(`${ROUTES.Repeating}/tab-two`),
                    //     getScene: getTab2Scene,
                    // }),
                ],
            }),
        ],
    });

const PageWithRepeating = () => {
    const scene = useSceneApp(getScene);
    return <scene.Component model={scene} />;
};

export default PageWithRepeating;
