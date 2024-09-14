#!/bin/bash
go install golang.org/dl/go${GO_VERSION}@latest
go${GO_VERSION} download
