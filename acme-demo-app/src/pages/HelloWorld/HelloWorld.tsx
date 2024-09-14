import React, {useMemo} from 'react';
import {getHellloWorldScene} from './helloWorldScene';
import {SceneApp, SceneAppPage} from "@grafana/scenes";
import {prefixRoute} from "../../utils/utils.routing";
import {ROUTES} from "../../constants";

const HelloWorld = () => {
    // const scene = getScene();
    const scene = useMemo(() => getScene(), []);
    return <scene.Component model={scene}/>;
};

export default HelloWorld;

const getScene = () =>
    new SceneApp({
        pages: [
            new SceneAppPage({
                title: 'Page with tabs',
                subTitle: 'This scene showcases a basic tabs functionality.',
                // Important: Mind the page route is ambiguous for the tabs to work properly
                url: prefixRoute(`${ROUTES.HelloWorld}`),
                hideFromBreadcrumbs: true,
                getScene: getHellloWorldScene,

            }),
        ],
    });
