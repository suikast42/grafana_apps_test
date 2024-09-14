import {
    SceneComponentProps,
    SceneFlexItem,
    SceneObjectBase,
    SceneObjectState
} from "@grafana/scenes";
import React from "react";
import {Badge, Stack} from "@grafana/ui";
import {getBackendSrv} from "@grafana/runtime";
import {PLUGIN_API_BASE_URL} from "../../../constants";

interface HelloWorldState extends SceneObjectState {
    content: any;
}

export class HelloWordComponent extends SceneObjectBase<HelloWorldState> {
    public static Component = HelloWorldRenderer;

    public constructor() {
        super({content: ""});
        this.call()
    }


    public call = async () => {
        const result = await readApis();
        this.setState({
            content: result,
        });
    };
}

function HelloWorldRenderer({model}: SceneComponentProps<HelloWordComponent>) {
    const {content} = model.useState();
    return (
        <div>
            <div>{content}</div>
            <button onClick={model.call}>Refresh</button>
        </div>
    );
}

export function getHelloWordComponentScene() {
    return new SceneFlexItem({
        width: '50%',
        height: 300,
        body: new HelloWordComponent(),
    })
}


async function readApis() {
    const backendSrv = getBackendSrv();

    const resultMapping = () => {
        return Promise.allSettled([
            backendSrv.get(`${PLUGIN_API_BASE_URL}/resources/ping`),
            backendSrv.get(`${PLUGIN_API_BASE_URL}/health`),
            backendSrv.post(`${PLUGIN_API_BASE_URL}/resources/echo`, '{"message":"echoooo"}'),
        ]).then((results) => {
            return results.map((result) => {
                switch (results.indexOf(result)) {
                    case 0:
                        return renderApiCallResult("Ping", result)
                    case 1:
                        return renderApiCallResult("Health Check", result)
                    case 2:
                        return renderApiCallResult("Echo", result)
                    default:
                        return "Not definied"
                }
            });
        });
    };
    const a = await resultMapping()
    return a.flatMap(value => <Stack>{value}</Stack> )
}

function renderApiCallResult(message: string, result: PromiseSettledResult<any>) {
    switch (result.status) {
        case "fulfilled":
            console.debug("Ok renderApiCallResult",result)
            return <Badge color="green" text={"Result of " + message + " " + result.value.message} icon="heart"/>;

        default:
            console.debug("Failed renderApiCallResult",result)
            return <Badge color="red" text={"Result of " + message + " " + result.reason.config.method + " " + result.reason.config.url + " " + result.reason.status + " " + result.reason.statusText + " " + result.reason.data.message} icon="bug"/>;
    }
}