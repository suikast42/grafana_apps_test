package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/acme/demo/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"math"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces - only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
	_ backend.StreamHandler         = (*Datasource)(nil) // Streaming data source needs to implement this
)

// NewDatasource creates a new datasource instance.
func NewDatasource(_ context.Context, _ backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	return &Datasource{}, nil
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct{}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

type queryOps string

const (
	devices           queryOps = "devices"
	devices_per_frame queryOps = "devices_per_frame"
	devices_per_label queryOps = "devices_per_label"
	devices_no_label  queryOps = "devices_no_label"
	devices_default   queryOps = "devices_default"
)

// Regex path

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {

	//var response backend.DataResponse

	// Unmarshal the JSON into our queryModel.
	var qm models.QueryModel

	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}

	//log.DefaultLogger.Debug("DemoDs query", qm.QueryText, qm.Constant)
	log.DefaultLogger.Info("Incoming query: ", qm.String())

	// TODO: Create an issue why a content from grafana ui is not transmitted with field value a=b ??
	switch qm.QueryText {

	case string(devices):
		return QueryDeviceNames(qm, ctx, pCtx, query)
	case string(devices_per_label):
		return QueryDevicesWithLabels(qm, ctx, pCtx, query)
	case string(devices_per_frame):
		return QueryDevicesWithFramesAndLabels(qm, ctx, pCtx, query)
	case string(devices_no_label):
		return QueryDevicesWithoutLabels(qm, ctx, pCtx, query)
	case string(devices_default):
		return QueryDeviceDefault(qm, ctx, pCtx, query)
	default:
		return QueryDeviceDefault(qm, ctx, pCtx, query)
	}

	//// create data frame response.
	//// For an overview on data frames and how grafana handles them:
	//// https://grafana.com/developers/plugin-tools/introduction/data-frames
	//frame := data.NewFrame("response")
	//
	//times := []time.Time{}
	//values := []int64{}
	//devices := []string{}
	//
	//for i := 1; i <= 10; i++ {
	//	// add fields.
	//	deviceName := fmt.Sprintf("device_%d", i)
	//	labels := make(map[string]string)
	//	labels["device"] = deviceName
	//	//times = append(times, query.TimeRange.From, query.TimeRange.To)
	//	//values = append(values, 1*int64(i), 2*int64(i))
	//	//devices = append(devices, deviceName, deviceName)
	//
	//	frame.Fields = append(frame.Fields,
	//		data.NewField("time", labels, append(times, query.TimeRange.From, query.TimeRange.To)),
	//		data.NewField("values", labels, append(values, 1*int64(i), 2*int64(i))),
	//		data.NewField("devices", labels, append(devices, deviceName, deviceName)),
	//	)
	//}
	////frame.Fields = append(frame.Fields,
	////	data.NewField("time", nil, times),
	////	data.NewField("values", nil, values),
	////	data.NewField("devices", nil, devices),
	////)
	//// add the frames to the response.
	//response.Frames = append(response.Frames, frame)
	//
	//return response
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	res := &backend.CheckHealthResult{}
	config, err := models.LoadPluginSettings(*req.PluginContext.DataSourceInstanceSettings)

	if err != nil {
		res.Status = backend.HealthStatusError
		res.Message = "Unable to load settings"
		return res, nil
	}

	if config.Secrets.ApiKey == "" {
		res.Status = backend.HealthStatusError
		res.Message = "API key is missing"
		return res, nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Data source is working",
	}, nil
}

// SubscribeStream just returns an ok in this case, since we will always allow the user to successfully connect.
// Permissions verifications could be done here. Check backend.StreamHandler docs for more details.
func (d *Datasource) SubscribeStream(_ context.Context, req *backend.SubscribeStreamRequest) (*backend.SubscribeStreamResponse, error) {
	return &backend.SubscribeStreamResponse{
		Status: backend.SubscribeStreamStatusOK,
	}, nil
}

// PublishStream just returns permission denied in this case, since in this example we don't want the user to send stream data.
// Permissions verifications could be done here. Check backend.StreamHandler docs for more details.
func (d *Datasource) PublishStream(context.Context, *backend.PublishStreamRequest) (*backend.PublishStreamResponse, error) {
	return &backend.PublishStreamResponse{
		Status: backend.PublishStreamStatusPermissionDenied,
	}, nil
}

func (d *Datasource) RunStream(ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {

	var qm models.QueryModel

	err := json.Unmarshal(req.Data, &qm)
	if err != nil {
		log.DefaultLogger.Debug("DemoDs RunStream error", err)
		return err
	}
	log.DefaultLogger.Debug("DemoDs RunStream", qm.String())
	var filter = "All"
	if len(qm.PathFilter) > 0 {
		filter = qm.PathFilter
	}

	//s := rand.NewSource(time.Now().UnixNano())
	//r := rand.New(s)
	ticker := time.NewTicker(time.Duration(250) * time.Millisecond)
	defer ticker.Stop()

	//for {
	//	select {
	//	case <-ctx.Done():
	//		return ctx.Err()
	//	case <-ticker.C:
	//		// we generate a random value using the intervals provided by the frontend
	//		randomValue := r.Float64() * (500)
	//
	//		err := sender.SendFrame(
	//			data.NewFrame(
	//				"response",
	//				data.NewField("time", nil, []time.Time{time.Now()}),
	//				data.NewField("value", nil, []float64{randomValue})),
	//			data.IncludeAll,
	//		)
	//
	//		if err != nil {
	//			log.DefaultLogger.Error("Failed send frame", "error", err)
	//		}
	//	}
	//}
	var degree float64 = 0
	for {
		select {
		case <-ctx.Done():
			var err = ctx.Err()
			if err != nil {
				log.DefaultLogger.Error(err.Error())
			}
			return err
		case <-ticker.C:
			// We generate a sinusoidal value with a period of 2π (360 degrees)
			// `r` is assumed to be the current time or phase in the sine wave

			amplitude := 1.0 // Set the amplitude for the sine wave
			// Calculate the sine wave value
			sinusoidalValue := amplitude * math.Sin(degree*(math.Pi/180))
			degree += 22.5
			if degree >= 360 {
				degree = 0
			}
			singleDataFrameWithLabeledFields(qm, sinusoidalValue, sender, filter)
			//multiDataFramesWithLabeledFields(sinusoidalValue, sender)

		}
	}

}
func allowedForDevice(deviceName string, filter string) bool {
	const filterAll = "All"
	if len(filter) == 0 {
		return true
	}

	if strings.EqualFold(filterAll, filter) {
		return true
	}
	if strings.Contains(filter, deviceName) {
		return true
	}
	return false
}
func singleDataFrameWithLabeledFields(qm models.QueryModel, sinusoidalValue float64, sender *backend.StreamSender, filter string) {
	frame := data.NewFrame("devices-stream")
	for i := 1; i <= 10; i++ {
		deviceName := fmt.Sprintf("device_%d", i)
		if !allowedForDevice(deviceName, qm.PathFilter) {
			//log.DefaultLogger.Debug(fmt.Sprintf("Filter out %s Filter: %s", deviceName, filter))
			continue
		}

		labels := make(map[string]string)
		labels["device"] = deviceName
		//times = append(times, query.TimeRange.From, query.TimeRange.To)
		//values = append(values, 1*int64(i), 2*int64(i))
		//devices = append(devices, deviceName, deviceName)
		//frame := data.NewFrame(deviceName)
		frame.Fields = append(frame.Fields,
			data.NewField("time", labels, []time.Time{time.Now()}),
			data.NewField("devices", labels, []string{deviceName}),
			data.NewField("values", labels, []float64{sinusoidalValue}))
		err := sender.SendFrame(frame, data.IncludeAll)

		if err != nil {
			log.DefaultLogger.Error("Failed to send frame", "error", err)
		}
	}

}
func multiDataFramesWithLabeledFields(sinusoidalValue float64, sender *backend.StreamSender, filter string) {

	for i := 1; i <= 10; i++ {
		deviceName := fmt.Sprintf("device_%d", i)

		if filter != "All" && !strings.Contains(filter, deviceName) {
			continue
		}
		labels := make(map[string]string)
		labels["device"] = deviceName
		//times = append(times, query.TimeRange.From, query.TimeRange.To)
		//values = append(values, 1*int64(i), 2*int64(i))
		//devices = append(devices, deviceName, deviceName)
		//frame := data.NewFrame(deviceName)
		frame := data.NewFrame(deviceName)
		frame.Fields = append(frame.Fields,
			data.NewField("time", labels, []time.Time{time.Now()}),
			data.NewField("devices", labels, []string{deviceName}),
			data.NewField("value", labels, []float64{sinusoidalValue}))
		err := sender.SendFrame(frame, data.IncludeAll)

		if err != nil {
			log.DefaultLogger.Error("Failed to send frame", "error", err)
		}

	}

}
