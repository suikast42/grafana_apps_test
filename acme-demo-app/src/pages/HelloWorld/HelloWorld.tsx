import React, {  } from 'react';

import {
    SceneApp,
    SceneAppPage,
    useSceneApp
} from "@grafana/scenes";
import {prefixRoute} from "../../utils/utils.routing";
import {ROUTES} from "../../constants";
import {getHelloWorldScene} from "./helloWorldScene";

const HelloWorld = () => {
    const scene = useSceneApp(getSceneHelloWorld);
    return <scene.Component model={scene}/>;
};

export default HelloWorld;

export const getSceneHelloWorld = () =>
    new SceneApp({
        pages: [
            new SceneAppPage({
                title: 'Simple Hello World',
                subTitle: 'Simple Hello world page.',
                // Important: Mind the page route is ambiguous for the tabs to work properly
                url: prefixRoute(`${ROUTES.HelloWorld}`),
                hideFromBreadcrumbs: true,
                getScene: getHelloWorldScene,
            }),
        ],
    });


