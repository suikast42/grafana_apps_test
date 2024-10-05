import {DataFrame,  PanelPlugin, PanelProps} from "@grafana/data";
import {sceneUtils, VariableValueSingle, VizPanel} from "@grafana/scenes";
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

function DeviceVizPanel(props: DeviceVizProps) {
    const {id, fieldConfig, data, options} = props;
    const dataFrame = data.series;
    console.log(dataFrame);
    if (options.devicename === undefined || options.devicename === '') {
        return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
                                   message={"devicename is not supported in the options"}/>;
    }

    if (dataFrame.length === 0) {
        return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
                                   message={"No data send from backend"}/>;
    }

    if (dataFrame.length > 1) {
        return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
                                   message={"🤬 Unexpected size of dataFrame: " + dataFrame.length}/>;
    }
    const device = mapLastDeviceValues(options.devicename, dataFrame)


    if (device === null || device === undefined) {

        return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data}
                                   message={"Could not find a device for " + options.devicename}/>;
    }
    return DeviceRenderer({model: device});
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

export const getDeviceVizPanel = (devicename: VariableValueSingle) => {
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

    const myCustomPanel = new PanelPlugin<DeviceVizOptions, DeviceVizFieldOptions>(DeviceVizPanel)
    try {
        sceneUtils.registerRuntimePanelPlugin({pluginId: 'device-state-viz', plugin: myCustomPanel});
    } catch (e) {
        let handled = false
        if (e instanceof Error) {
            const err = e as Error
            if (err.message === "A runtime panel plugin with id device-state-viz has already been registered") {
                handled = true;
            }
        }

        if (!handled) {
            throw e
        }
        // TODO
    }


    const panel = new VizPanel({
        pluginId: 'device-state-viz',
        title: devicename.toString(),
        displayMode: "transparent",
        options: {devicename: devicename.toString()},
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


const mapLastDeviceValues = (deviceName: string, dfs: DataFrame[] | undefined): Device | undefined => {
    if (dfs === undefined) {
        return undefined;
    }
    return mapLastDeviceValue(deviceName, dfs[dfs.length - 1])
}

const mapLastDeviceValue = (deviceName: string, df: DataFrame | undefined): Device | undefined => {
    try {
        if (df === undefined) {
            return undefined;
        }
        // const timeField = df.fields.find((field) => field.name === 'time')?.values;
        // const name = df.fields.find((field) => field.name === 'devices')?.values;
        // const value = df.fields.find((field) => field.name === 'values')?.values;
        let reverse = df.fields.reverse();
        const timeField = reverse.find(field => field.labels?.['device']===deviceName && field.name === 'time')?.values;
        const value = reverse.find((field) => field.labels?.['device']===deviceName && field.name === 'value')?.values;
        if (!timeField || !value) {
            // console.info(`DD- ${timeField}`)
            // reverse.forEach((field) => console.info(field.labels?.['device'])) // console.info(`DD- ${deviceName}`)
            // reverse.forEach((field) => console.info(field.labels?.['device']))
            return undefined;
        }

        return new Device({
            name: deviceName,
            value : value[df.length-1]
        })
    } catch (e) {
        console.error(e);
        return undefined;
    }
}
