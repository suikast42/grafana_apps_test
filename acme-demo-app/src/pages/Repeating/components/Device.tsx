import {Grid} from "@grafana/ui";
import React from "react";
import {SceneComponentProps, SceneObjectBase, SceneObjectState} from "@grafana/scenes";

interface DeviceState extends SceneObjectState {
    name: string;
}


export class Device extends SceneObjectBase<DeviceState> {
    public static Component = DeviceRenderer;

    public constructor(state?: Partial<DeviceState>) {

        super({
            name: "UNKNOWN",
            ...state
        });
    }

    onUpdate = (update: Device) => {
        super.setState({
            name: update.state.name
        });

    }

}


export function DeviceRenderer({model}: SceneComponentProps<Device>) {
    const deviceState = model.useState();
    // console.log(deviceState);
    // const deviceJsn = JSON.stringify(model.state)
    return (
        <>
            <Grid columns={1}>
                <Grid columns={2} gap={2} alignItems={'start'}>
                    <text > Last Refresh:</text>
                    <text > {new Date().toLocaleTimeString()}</text>

                    {/*<text style={{color: colorOfDate(deviceStatus.lastDeviceStatusSince)}}>Last Event time:</text>*/}
                    {/*<text style={{color: colorOfDate(deviceStatus.lastDeviceStatusSince)}}>{deviceStatus.lastDeviceStatusSince?.toLocaleTimeString() || 'UNKOWN'}</text>*/}

                    <text>Device Name:</text>
                    <text> {deviceState.name}</text>
                    {/*{render &&*/}
                    {/*    <h2>*/}
                    {/*     Render*/}
                    {/*    </h2>*/}
                    {/*}*/}


                </Grid>
            </Grid>
        </>
    );
}


// function colorOfDate(date: Date | undefined): string {
//     if (date === undefined) {
//         return "gray"
//     }
//     const diff = Date.now().valueOf() - date.valueOf();
//     if (diff < 5000) {
//         return "gray"
//     }
//     return "green"
// }
