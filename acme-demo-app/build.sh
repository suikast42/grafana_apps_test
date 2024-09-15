#!/bin/bash
mage -v buildApp
mage -v buildDs
docker-compose up --build