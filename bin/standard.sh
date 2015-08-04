#!/bin/bash

#
# Check for JavaScript standard.
#
standard server.js --verbose | snazzy
standard app/**/*.js --verbose | snazzy
standard test/**/*.js --verbose | snazzy
standard setup/**/*.js --verbose | snazzy
standard config/**/*.js --verbose | snazzy
