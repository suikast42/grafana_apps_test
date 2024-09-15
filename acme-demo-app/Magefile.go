//go:build mage
// +build mage

package main

import (
	// mage:import
	build "github.com/grafana/grafana-plugin-sdk-go/build"
	"github.com/magefile/mage/mg"
)

// Default configures the default target.
var Default = build.BuildAll

func BuildApp() error {
	build.SetBeforeBuildCallback(func(cfg build.Config) (build.Config, error) {
		//cfg.OutputBinaryPath = "dist"
		cfg.RootPackagePath = "./pkg/cmd/app"
		return cfg, nil
	})
	b := build.Build{}
	mg.Deps(b.Linux, b.GenerateManifestFile)
	return nil
}

func BuildDs() error {
	build.SetBeforeBuildCallback(func(cfg build.Config) (build.Config, error) {
		cfg.OutputBinaryPath = "dist/nested-demods-datasource"
		cfg.RootPackagePath = "./pkg/cmd/ds"
		return cfg, nil
	})
	b := build.Build{}
	mg.Deps(b.Linux, b.GenerateManifestFile)
	return nil
}
