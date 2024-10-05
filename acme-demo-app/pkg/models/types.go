package models

import "fmt"

type DS struct {
	Type string `json:"type"`
	UID  string `json:"uid"`
}

type QueryModel struct {
	DataSource    DS      `json:"datasource"`
	DatasourceID  int     `json:"datasourceId"`
	IntervalMs    int     `json:"intervalMs"`
	MaxDataPoints int     `json:"maxDataPoints"`
	QueryText     string  `json:"queryText"`
	RefID         string  `json:"refId"`
	Constant      float64 `json:"constant"`
	PathFilter    string  `json:"pathFilter"`
}

func (q QueryModel) String() string {
	return fmt.Sprintf("QueryModel(DataSource: %v, DatasourceID: %d, IntervalMs: %d, MaxDataPoints: %d, QueryText: '%s', RefID: '%s', Constant: %.2f, PathFilter: '%s')",
		q.DataSource, q.DatasourceID, q.IntervalMs, q.MaxDataPoints, q.QueryText, q.RefID, q.Constant, q.PathFilter)
}
