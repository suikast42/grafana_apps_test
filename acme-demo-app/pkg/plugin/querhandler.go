package plugin

import (
	"context"
	"fmt"
	"github.com/acme/demo/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"strings"
	"time"
)

func QueryDeviceDefault(qm models.QueryModel, ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {

	return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("No path implemnted for quertText: %s", qm.QueryText))
}

func QueryDeviceNames(qm models.QueryModel, ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse
	varname := "devices"
	var values = []string{}

	for i := 1; i <= 10; i++ {
		values = append(values, fmt.Sprintf("device_%d", i))
	}
	frame := data.NewFrame(fmt.Sprintf("frame_%s", varname))
	frame.Fields = append(frame.Fields,
		//data.NewField("time", nil, []time.Time{query.TimeRange.From}),
		data.NewField(varname, nil, values),
	)
	response.Frames = append(response.Frames, frame)
	log.DefaultLogger.Info("Result: " + strings.Join(values, " "))
	return response
}

func QueryDevicesWithoutLabels(qm models.QueryModel, tx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse
	frame := data.NewFrame("response")

	times := []time.Time{}
	values := []int64{}
	devices := []string{}

	for i := 1; i <= 10; i++ {
		// add fields.
		deviceName := fmt.Sprintf("device_%d", i)
		times = append(times, query.TimeRange.From, query.TimeRange.To)
		values = append(values, 1*int64(i), 2*int64(i))
		devices = append(devices, deviceName, deviceName)
	}
	frame.Fields = append(frame.Fields,
		data.NewField("time", nil, times),
		data.NewField("values", nil, values),
		data.NewField("devices", nil, devices),
	)
	response.Frames = append(response.Frames, frame)
	return response
}

func QueryDevicesWithLabels(qm models.QueryModel, tx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse
	frame := data.NewFrame("response")

	times := []time.Time{}
	values := []int64{}
	devices := []string{}

	for i := 1; i <= 10; i++ {
		// add fields.
		deviceName := fmt.Sprintf("device_%d", i)
		labels := make(map[string]string)
		labels["device"] = deviceName
		//times = append(times, query.TimeRange.From, query.TimeRange.To)
		//values = append(values, 1*int64(i), 2*int64(i))
		//devices = append(devices, deviceName, deviceName)

		frame.Fields = append(frame.Fields,
			data.NewField("time", labels, append(times, query.TimeRange.From, query.TimeRange.To)),
			data.NewField("values", labels, append(values, 1*int64(i), 2*int64(i))),
			data.NewField("devices", labels, append(devices, deviceName, deviceName)),
		)
	}
	response.Frames = append(response.Frames, frame)
	return response
}

func QueryDevicesWithFramesAndLabels(qm models.QueryModel, ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse
	for i := 1; i <= 10; i++ {
		times := []time.Time{}
		values := []int64{}
		devices := []string{}
		deviceName := fmt.Sprintf("device_%d", i)
		frame := data.NewFrame(deviceName)
		labels := make(map[string]string)
		labels["device"] = deviceName
		frame.Fields = append(frame.Fields,
			data.NewField("time", labels, append(times, query.TimeRange.From, query.TimeRange.To)),
			data.NewField("values", labels, append(values, 1*int64(i), 2*int64(i))),
			data.NewField("devices", labels, append(devices, deviceName, deviceName)),
		)
		response.Frames = append(response.Frames, frame)
	}
	return response
}
