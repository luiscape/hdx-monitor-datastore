## HDX Monitor Datastore
DataStore micro-service for the HDX Monitor application. This service is designed to run as a `Docker` container. See the `Dockerfile` for instructions on how to run it.

[![Build Status](https://travis-ci.org/luiscape/hdx-monitor-datastore.svg)](https://travis-ci.org/luiscape/hdx-monitor-datastore) [![Coverage Status](https://coveralls.io/repos/luiscape/hdx-monitor-datastore/badge.svg?branch=master&service=github)](https://coveralls.io/github/luiscape/hdx-monitor-datastore?branch=master)

### Creating DataStores
By default, all datastores are created using an all-text schema. There are three API endpoints useful for making DataStores:

* /show/[RESOURCE_ID]
* /create/[RESOURCE_ID]
* /delete/[RESOURCE_ID]

The first will display metadata from the resource at hand. The second will create a DataStore. You should see a success (or failure) message when the process is complete.


### Secrets
Secrets are passed as environment variables. For now, a default API key is used to create DataStores. It can be set as `DEFAULT_API_KEY` when creating the Docker container.

### Coding Standard
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
