#!/bin/bash

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
# Cleaning up.
#
# rm -rf coverage/