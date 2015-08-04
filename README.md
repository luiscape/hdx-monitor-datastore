## HDX Monitor Datastore
DataStore micro-service for the HDX Monitor application. This service is designed to run as a `Docker` container. See the `Dockerfile` for instructions on how to run it.

[![Build Status](https://travis-ci.org/luiscape/hdx-monitor-datastore.svg)](https://travis-ci.org/luiscape/hdx-monitor-datastore) [![Coverage Status](https://coveralls.io/repos/luiscape/hdx-monitor-datastore/badge.svg?branch=master&service=github)](https://coveralls.io/github/luiscape/hdx-monitor-datastore?branch=master)

### Creating DataStores
By default, all datastores are created using an all-text schema. There are three API endpoints useful for making DataStores:

* /datastore/show/[RESOURCE_ID]
* /datastore/create/[RESOURCE_ID]
* /datastore/delete/[RESOURCE_ID]

The first will display metadata from the resource at hand. The second will create a DataStore. You should see a success (or failure) message when the process is complete.


### Secrets
Secrets are kept in the [`/config`](/config) directory. It should be a JavaScript file containing the following:

```javascript
// expose our config directly to our application using module.exports
module.exports = {

    'CkanInstance': 'https://data.hdx.rwlabs.org/',
    'ApiKey': 'XXXXXXX'

}
```

For now, that is how the API key is used to create datastores.

### Coding Standard
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
