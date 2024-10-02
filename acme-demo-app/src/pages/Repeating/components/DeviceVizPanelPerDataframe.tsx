import {DataFrame, PanelPlugin, PanelProps} from "@grafana/data";
import {sceneUtils, VariableValueSingle, VizPanel, VizPanelState} from "@grafana/scenes";
import React from "react";
import {PanelDataErrorView} from "@grafana/runtime";
import {Device, DeviceRenderer} from "./Device";

interface DeviceVizOptions {
    devicename: string;
}

interface DeviceVizFieldOptions {
    numericOption: number;
}

interface DeviceVizProps extends PanelProps<DeviceVizOptions> {
}

function DeviceVizPanelPerDataframe(props: DeviceVizProps) {
    const {id, fieldConfig, data, options} = props;
    const dataFrame = data.series;

    if (options.devicename === undefined || options.devicename === '') {
        return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
                                   message={"devicename is not supported in the options"}/>;
    }

    if (dataFrame.length === 0) {
        return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
                                   message={"No data send from backend"}/>;
    }
    const deviceIndex = dataFrame.findIndex(value => value.name === props.options.devicename)
    if( deviceIndex < 0 ){
        return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
                                   message={"🤷‍♂️ No device found in the frame "}/>;
    }

    const device = mapLastDeviceValue(options.devicename, dataFrame[deviceIndex])


    if (device === null || device === undefined) {
        return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
                                   message={"Could not find a device for " + options.devicename}/>;
    }
    return DeviceRenderer({model: device});
    // return getRoomsTemperatureStats();
    // try {
    //     // dataFrameToJSON(data.series[0]
    //
    //     console.log(dataFrame)
    //     // dataFrame.forEach((value, index) => console.log(value.fields));
    //     return (
    //         <>
    //             <div>
    //                 <text>{dataFrame[0].fields.flatMap(value => value.name)}</text>
    //             </div>
    //             <div>
    //                 <text>{dataFrame.flatMap(value => value.fields[1].values[value.fields[1].values.length - 1])}</text>
    //             </div>
    //         </>
    //     )
    //     // return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
    //     //                            message={"No device found in frame " + new Date().toLocaleTimeString()}/>;
    // } catch (e) {
    //     console.log(e)
    //     return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
    //                                message={"Error occurred: " + e}/>;
    // }
}


export const getDeviceVizPanelPerDataframe = (devicename: VariableValueSingle,data:  VizPanelState['$data']) => {
    // const myCustomPanel = new PanelPlugin<DeviceVizOptions, DeviceVizFieldOptions>(DeviceVizPanel)
    //     .useFieldConfig({
    //     useCustomConfig: (builder) => {
    //         builder.addNumberInput({
    //             path: 'numericOption',
    //             name: 'Numeric option',
    //             description: 'A numeric option',
    //             defaultValue: 1,
    //         });
    //     },
    // });

    const myCustomPanel = new PanelPlugin<DeviceVizOptions, DeviceVizFieldOptions>(DeviceVizPanelPerDataframe)
    try {
        sceneUtils.registerRuntimePanelPlugin({pluginId: 'device-state-df-viz', plugin: myCustomPanel});
    } catch (e) {
        let handled = false
        if (e instanceof Error) {
            const err = e as Error
            if (err.message === "A runtime panel plugin with id device-state-df-viz has already been registered") {
                handled = true;
            }
        }

        if (!handled) {
            throw e
        }
        // TODO
    }


    const panel = new VizPanel({
        pluginId: 'device-state-df-viz',
        title: devicename.toString(),
        displayMode: "transparent",
        $data:data  ,
        options: {

            devicename: devicename.toString()},
        fieldConfig: {
            defaults: {
                unit: 'ms',
                custom: {
                    numericOption: 100,
                },
            },
            overrides: [],
        },
    });



    return panel;
};


// const mapLastDeviceValues = (deviceName: string, dfs: DataFrame[] | undefined): Device | undefined => {
//     if (dfs === undefined) {
//         return undefined;
//     }
//     return mapLastDeviceValue(deviceName, dfs[dfs.length - 1])
// }

const mapLastDeviceValue = (deviceName: string, df: DataFrame | undefined): Device | undefined => {
    try {
        if (df === undefined) {
            return undefined;
        }
        // const timeField = df.fields.find((field) => field.name === 'time')?.values;
        // const name = df.fields.find((field) => field.name === 'devices')?.values;
        // const value = df.fields.find((field) => field.name === 'values')?.values;
        let reversedFields = df.fields.reverse();
        const timeField = reversedFields.find(field => field.labels?.['device'] === deviceName && field.name === 'time')?.values;
        const name = reversedFields.find((field) => field.labels?.['device'] === deviceName && field.name === 'devices')?.values;
        const value = reversedFields.find((field) => field.labels?.['device'] === deviceName && field.name === 'values')?.values;
        if (!timeField || !name || !value) {
            return undefined;
        }
        const devicenameIndex = name.lastIndexOf(deviceName)
        if (devicenameIndex === -1) {
            return undefined;
        }

        // const firstDeviceIndex = name.indexOf(deviceName)

        return new Device({
            name: name[devicenameIndex]
        })
    } catch (e) {
        console.error(e);
        return undefined;
    }
}
