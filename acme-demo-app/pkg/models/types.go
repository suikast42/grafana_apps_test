package models

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
}
