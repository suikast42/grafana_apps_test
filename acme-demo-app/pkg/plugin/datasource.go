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

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {

	var response backend.DataResponse

	// Unmarshal the JSON into our queryModel.
	var qm models.QueryModel

	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}
	log.DefaultLogger.Debug("DemoDs query", qm.QueryText, qm.Constant)

	// TODO: Create an issue why a content from grafana ui is not transmitted with field value a=b ??
	if qm.QueryText == "devices" {
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
	// create data frame response.
	// For an overview on data frames and how grafana handles them:
	// https://grafana.com/developers/plugin-tools/introduction/data-frames
	frame := data.NewFrame("response")

	// add fields.
	frame.Fields = append(frame.Fields,
		data.NewField("time", nil, []time.Time{query.TimeRange.From, query.TimeRange.To}),
		data.NewField("values", nil, []int64{1, 200}),
	)

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
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
	log.DefaultLogger.Debug("DemoDs RunStream", req.Path, req.Data, ctx)

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
			return ctx.Err()
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
			err := sender.SendFrame(
				data.NewFrame(
					"response",
					data.NewField("time", nil, []time.Time{time.Now()}),
					data.NewField("value", nil, []float64{sinusoidalValue})),
				data.IncludeAll,
			)

			if err != nil {
				log.DefaultLogger.Error("Failed to send frame", "error", err)
			}
		}
	}
}
