#!/bin/bash
cd "$(dirname "$0")/notion-sync" && go run cmd/sync/main.go
