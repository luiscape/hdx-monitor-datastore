#!/bin/bash

#
# Start server.
#
pm2 start server.js

#
# Run tests with istanbul and report coverage.
#
istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec

#
# If one wants to explore the coverage report manually.
#
# open coverage/index.html

#
# Stop and delete server.
#
pm2 stop server && pm2 delete server
