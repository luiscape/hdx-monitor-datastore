//
// DataTeam monitor interface
// for the DataStore API.
//
var Config = require('../config/dev')
var Datastore = require('./datastore')

module.exports = function (app) {
  //
  // Global variable of dataset.
  //
  var resourceInfo = {
    'schema': {
      'fields': []
    }
  }

  //
  // ROUTES =============================================================
  //

  //
  // Status endpoint.
  //
  app.get('/status', function (req, res) {
    var payload = {
      'online': true,
      'message': 'Service for creating datastores on a CKAN instance.',
      'CKAN_instance': Config.CkanInstance,
      'version': Config.version,
      'repository': Config.repository
    }
    res.send(payload)
  })

  app.get('/', function (req, res) {
    var payload = {
      'success': false,
      'message': 'No resource id provided.'
    }
    res.send(payload)
  })

  //
  // Collect resource id from parameter.
  //
  app.param('resource_id', function (req, res, next, id) {
    if (typeof id === typeof undefined) {
      var payload = { 'success': false, 'message': 'Please provide resource ID.' }
      res.send(payload)
    }
    resourceInfo['id'] = id
    next()
  })

  //
  // REST endpoints.
  //
  app.get('/rest/:resource_id', function (req, res) {
    res.redirect('/show/' + resourceInfo.id)
  })

  app.post('/rest/:resource_id', function (req, res) {
    res.redirect('/create/' + resourceInfo.id)
  })

  app.delete('/rest/:resource_id', function (req, res) {
    res.redirect('/delete/' + resourceInfo.id)
  })

  // Show a specific dataset.
  app.get('/show/:resource_id', function (req, res) {
    Datastore.FetchDatasetInfo(resourceInfo, function (err, data) {
      if (err) {
        res.send(err)
      } else {
        res.send(data)
      }
    })
  })

  // Endpoint for deleting DataStores.
  app.get('/delete/:resource_id', function (req, res) {
    Datastore.DeleteDataStore(null, false, resourceInfo, function (err, data) {
      if (err) {
        res.send(err)
      } else {
        res.send(data)
      }
    })
  })

  app.all('/create/:resource_id', function (req, res) {
    //
    // Cleaning object from memory.
    //
    resourceInfo.schema.fields = []
    console.log('Receiving schema: ' + JSON.stringify(req.query))

    //
    // Checks if the DataStore is active.
    // If it is, delete the active DataStore
    // infer types, and re-create it with
    // new data.
    //
    Datastore.FetchDatasetInfo(resourceInfo, function (err, data) {
      console.log('Fetching resource information from HDX.')
      if (err) {
        console.log('Failed to fetch resource information from HDX.')
        res.send(err)
      } else {
        if (data.datastore_active) {
          console.log('DataStore found. Attempting deletion.')
          Datastore.DeleteDataStore(data, false, resourceInfo, function (err, data) {
            if (err) {
              console.log('Failed to delete old DataStore.')
              res.send(err)
            } else {
              console.log('Attempting to download file from HDX.')
              Datastore.DownloadFile(data, true, function (err, data) {
                if (err) {
                  console.log('Failed to download file from HDX.')
                  res.send(err)
                } else {
                  //
                  // If user sends a request body,
                  // assign that body as a schema.
                  //
                  if (req.query.id !== undefined) {
                    console.log('Attempting to assign schema.')
                    Datastore.AssignSchema(data.file_name, req.query, resourceInfo, function (err, data) {
                      if (err) {
                        console.log('Failed to assign schema.')
                        res.send(err)
                      } else {
                        console.log('Reading data from: ' + data.file_name)
                        Datastore.CreateDataStore(data.file_name, resourceInfo, function (err, data) {
                          if (err) {
                            res.send(err)
                          } else {
                            console.log('Created datastore successfully.')
                            res.send(data)
                          }
                        })
                      }
                    })

                  //
                  // If it doesn't, infer the
                  // schema based on the CSV file.
                  //
                  } else {
                    console.log('Attempting to infer data types.')
                    Datastore.InferDataTypes(data.file_name, Config.InferDataTypes, resourceInfo, function (err, data) {
                      if (err) {
                        console.log('Failed to infer data types.')
                        res.send(err)
                      } else {
                        console.log('Attempting to create DataStore.')
                        Datastore.CreateDataStore(data.file_name, resourceInfo, function (err, data) {
                          if (err) {
                            console.log('Failed to create datastore.')
                            res.send(err)
                          } else {
                            console.log('Datastore created successfully.')
                            res.send(data)
                          }
                        })
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          //
          // If DataStore doesn't exist it
          // downloads file, possibly infers data types,
          // and creates DataStore.
          //
          console.log('Attempting to download file from HDX.')
          Datastore.DownloadFile(data, true, function (err, data) {
            if (err) {
              console.log('Failed to download file.')
              res.send(err)
            } else {
              //
              // If user sends a request body,
              // assign that body as a schema.
              //
              if (req.query.id !== undefined) {
                console.log('Attempting to assign schema.')
                Datastore.AssignSchema(data.file_name, req.query, resourceInfo, function (err, data) {
                  if (err) {
                    console.log('Failed to assign schema.')
                    res.send(err)
                  } else {
                    var file_name = data.file_name
                    console.log('Loading data from: ' + data.file_name)
                    console.log('Attempting to create DataStore.')
                    Datastore.CreateDataStore(data.file_name, resourceInfo, function (err, data) {
                      if (err) {
                        console.log('Failed to create DataStore.')
                        console.log('Attempting to delete file: ' + file_name)
                        Datastore.DeleteFile(file_name, console.log)
                        res.send(err)
                      } else {
                        console.log('Created DataStore successfully.')
                        console.log('Attempting to delete file: ' + file_name)
                        Datastore.DeleteFile(file_name, console.log)
                        res.send(data)
                      }
                    })
                  }
                })

              //
              // If it doesn't, infer the
              // schema based on the CSV file.
              //
              } else {
                console.log('Attempting to infer data types.')
                Datastore.InferDataTypes(data.file_name, Config.InferDataTypes, resourceInfo, function (err, data) {
                  if (err) {
                    console.log('Failed to infer data types.')
                    res.send(err)
                  } else {
                    console.log('Attempting to create DataStore.')
                    var file_name = data.file_name
                    Datastore.CreateDataStore(data.file_name, resourceInfo, function (err, data) {
                      if (err) {
                        console.log('Failed to create DataStore.')
                        console.log('Attempting to delete file: ' + file_name)
                        Datastore.DeleteFile(file_name, console.log)
                        res.send(err)
                      } else {
                        console.log('DataStore created successfully.')
                        console.log('Attempting to delete file: ' + file_name)
                        Datastore.DeleteFile(file_name, console.log)
                        res.send(data)
                      }
                    })
                  }
                })
              }
            }
          })
        }
      }
    })
  })

  //
  // 404 route.
  //
  app.use(function (req, res, next) {
    res.status(404)
    var payload = {
      'success': false,
      'message': 'Endpoint not found.'
    }
    res.send(payload)
  })

}  // module.exports closes.
