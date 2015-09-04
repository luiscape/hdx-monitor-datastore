#!/bin/bash

#
# Start server.
#
pm2 start server.js

#
# Run tests with istanbul and report coverage.
#
# istanbul cover _mocha -- -R spec
istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec

#
# If one wants to explore the coverage report manually.
#
# open coverage/lcov-report/index.html

#
# Stop and delete server.
#
pm2 stop server && pm2 delete server
