package plugin

import (
	"context"
	"fmt"
	"github.com/acme/demo/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"regexp"
	"slices"
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

	var filter = "All"
	if len(qm.PathFilter) > 0 {
		filter = qm.PathFilter
	}
	for i := 1; i <= 10; i++ {
		deviceName := fmt.Sprintf("device_%d", i)
		// add fields.
		if filter != "All" && !strings.Contains(filter, deviceName) {
			continue
		}

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

func QueryDevicesWithFramesAndLabelsFiltered(qm models.QueryModel, ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse
	filter := deviceFilterFromQuery(qm.QueryText)
	if len(filter) == 0 {
		return QueryDevicesWithFramesAndLabels(qm, ctx, pCtx, query)
	}

	for i := 1; i <= 10; i++ {
		times := []time.Time{}
		values := []int64{}
		devices := []string{}
		deviceName := fmt.Sprintf("device_%d", i)
		var disableFilter = false
		if len(filter) == 1 && filter[0] == "All" {
			disableFilter = true
		}
		if !disableFilter {
			var fsw = false
			for _, filterVar := range filter {
				fsw = filterVar == deviceName
				if fsw {
					break
				}
			}
			if !fsw {
				continue
			}
		}

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

func deviceFilterFromQuery(queryText string) []string {

	// Empty means no filtering active
	var result = []string{}
	var re = regexp.MustCompile(`^.*/({[^}]*})`)
	var re2 = regexp.MustCompile(`^.*\?(.+)`)
	//var re3 = regexp.MustCompile(`^.*/({[^}]*})`)
	var devices = regexp.MustCompile(`[^,{}]+`)
	{ // Case 1 service/endpoint/{a,b,c,d} -> [a,b,c,d]

		var testStr = queryText
		firstMatch := re.FindAllStringSubmatch(testStr, -1)
		if len(firstMatch) == 1 && len(firstMatch[0]) == 2 {
			devicesListMatch := firstMatch[0][1]
			for _, submatch := range devices.FindAllString(devicesListMatch, -1) {
				if !slices.Contains(result, submatch) {
					result = append(result, submatch)
				}
			}

		} else {
			log.DefaultLogger.Error("Case 1 service/endpoint/{a,b,c,d} -> [a,b,c,d] does not compile")
		}

	}

	{
		// Case 2 service/endpoint?All -> [All]
		var testStr = queryText
		firstMatch := re2.FindAllStringSubmatch(testStr, -1)
		if len(firstMatch) == 1 && len(firstMatch[0]) == 2 {
			devicesListMatch := firstMatch[0][1]
			for _, submatch := range devices.FindAllString(devicesListMatch, -1) {
				if !slices.Contains(result, submatch) {
					result = append(result, submatch)
				}
			}
		} else {
			log.DefaultLogger.Error("Case 2 service/endpoint?All -> [All] does not compile")
		}

	}
	{ // Case 3 service/endpoint?service_1 -> [service_1]
		var testStr = queryText
		firstMatch := re2.FindAllStringSubmatch(testStr, -1)
		if len(firstMatch) == 1 && len(firstMatch[0]) == 2 {
			devicesListMatch := firstMatch[0][1]
			for _, submatch := range devices.FindAllString(devicesListMatch, -1) {
				if !slices.Contains(result, submatch) {
					result = append(result, submatch)
				}
				//fmt.Println("\t\t", submatch, ": str3 found at index", ii, " parent idx:", 1)
			}
		} else {
			log.DefaultLogger.Error("Case 3 service/endpoint?service_1 -> [service_1]  does not compile")
		}

	}
	return result
}
func (d *Datasource) RunStreamDevices(qm models.QueryModel, ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {

	return nil
}
