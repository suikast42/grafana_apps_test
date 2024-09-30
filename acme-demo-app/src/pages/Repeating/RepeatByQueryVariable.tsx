import React, {  } from 'react';
import {
    EmbeddedScene,
    PanelBuilders, QueryVariable,
    SceneApp,
    SceneAppPage, SceneByVariableRepeater, SceneControlsSpacer, SceneFlexItem,
    SceneFlexLayout, SceneQueryRunner, SceneRefreshPicker, SceneTimePicker, SceneTimeRange,
    SceneVariableSet,
    useSceneApp, VariableValueSelectors
} from '@grafana/scenes';
import {DATASOURCE_CUSTOMDS_REF, DATASOURCE_REF, ROUTES} from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';
import { getBasicScene } from '../Home/scenes';

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
            datasource: DATASOURCE_CUSTOMDS_REF,
            quertyText: "devices",
            constant:1
        },
        allValue: "All",
        isMulti: true,
        includeAll: true,
        defaultToAll: true,

    })
    const dataQuery = new SceneQueryRunner({
        datasource: DATASOURCE_CUSTOMDS_REF,
        liveStreaming: true,
        $timeRange: new SceneTimeRange({from: 'now-20s', to: 'now'}),
        queries: [
            {
                refId: 'A',
                datasource: DATASOURCE_CUSTOMDS_REF,
                quertyText: "timesteries",
                constant: 1,
            },
        ],

    })
   const body=  new SceneByVariableRepeater({
        variableName: 'devices',
        body: new SceneFlexLayout({
            children: [],
        }),
        getLayoutChild: (option) => new SceneFlexLayout({
            children: [
                new SceneFlexItem({
                    body: PanelBuilders.timeseries()
                        // Title is using variable value
                        .setTitle(option.value)
                        .build(),
                }),
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
