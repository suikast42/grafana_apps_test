import React from 'react';
import {SceneApp, SceneAppPage, useSceneApp} from '@grafana/scenes';
import {ROUTES} from '../../constants';
import {prefixRoute} from '../../utils/utils.routing';
import {getTabRepeatByQueryVariable} from "./tabRepeatByQueryVariable";
import {getTabRepeatByDataframe} from "./tabRepeatByDataframe";


const getScene = () =>
    new SceneApp({
        pages: [
            new SceneAppPage({
                title: 'Examples ho to repeat panels and scenes objects',
                subTitle: 'This scene showcases a basic tabs functionality.',
                // Important: Mind the page route is ambiguous for the tabs to work properly
                url: prefixRoute(`${ROUTES.Repeating}`),
                hideFromBreadcrumbs: true,
                getScene: getTabRepeatByQueryVariable,
                tabs: [
                    new SceneAppPage({
                        title: 'Repeat by QueryVariable',
                        url: prefixRoute(`${ROUTES.Repeating}`),
                        getScene: getTabRepeatByQueryVariable,
                        titleIcon: "repeat"
                    }),
                    new SceneAppPage({
                        title: 'Repeat by Dataframe',
                        url: prefixRoute(`${ROUTES.Repeating}/tab-two`),
                        getScene: getTabRepeatByDataframe,
                        titleIcon: "repeat"
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
    return <scene.Component model={scene}/>;
};


export default PageWithRepeating;
