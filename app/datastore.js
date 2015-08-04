//
// DataTeam monitor interface
// for the DataStore API.
//

module.exports = function (app) {
  var fs = require('fs')
  var csv = require('csv')
  var url = require('url')
  var ckan = require('ckan')
  var crypto = require('crypto')
  var Config = require('../config/dev')
  var http = require('follow-redirects').http
  var https = require('follow-redirects').https

  //
  // Example dataset.
  //
  var resourceInfo = {
    'id': 'foo-bar',
    'schema': { 'fields': [] }
  }

  //
  // Starting CKAN client.
  //
  var client = new ckan.Client(Config.CkanInstance, Config.ApiKey)

  //
  // Fetch the metadata from a resource.
  //
  function FetchDatasetInfo (callback) {
    client.action('resource_show', { id: resourceInfo.id }, function (err, out) {
      if (!err) {
        var resource_data = out.result
        callback(null, resource_data)
      } else {
        var payload = { 'success': false, 'message': 'Failed to fetch resource information.', 'error': err}
        callback(payload)
      }
    })
  }

  //
  // Processes response. Desinged to switch
  // between HTTP and HTTPS based on
  // redirect chains.
  //
  function ProcessResponse (response, callback) {
    if (response.statusCode > 300 && response.statusCode < 400 && response.headers.location) {
      if (url.parse(response.headers.location).protocol === 'https:') {
        var request = https.get(response.headers.location, function (res) {
          ProcessResponse(res)
        })
      } else {
        http.get(response.headers.location, function (res) {
          ProcessResponse(res)
        })
      }
    } else {
      var payload = {'success': true, 'message': 'Redirect successful.', 'url': response.headers.location}
      callback(null, false, payload)
    }

    //
    // If requests finds an error,
    // returns to the user.
    //
    request.on('error', function (error) {
      callback({ 'success': false, 'message': 'Failed to download file.', 'error': error })
    })
  }

  //
  // Download specific file from a CKAN resource.
  //
  function DownloadFile (resource_data, verbose, callback) {
    //
    // Creates a unique file id.
    // Used to store the file locally.
    //
    var file_id = crypto.randomBytes(4).toString('hex')
    var file = fs.createWriteStream(Config.DataFolder + file_id + '.csv')

    //
    // Header options for querying CKAN.
    //
    var options = {
      host: url.parse(resource_data.url).hostname,
      path: url.parse(resource_data.url).pathname,
      headers: { 'X-CKAN-API-Key': Config.ApiKey }
    }
    var request = http.get(options, function (response) {
      if (verbose) {
        console.log('Request headers: ' + JSON.stringify(options))
      }

      //
      // If the header doesn't send a
      // 200 response call ProcessResponse()
      //
      if (response.statusCode > 300 && response.statusCode < 400 && response.headers.location) {
        console.log('Redirected to: ' + response.headers.location)
        ProcessResponse(response, DownloadFile)
      }

      //
      // After file has finished downloading
      // send it back with its temporary path.
      //
      if (response.statusCode === 200) {
        response.pipe(file)
        response.on('end', function () {
          payload = {'success': true, 'message': 'File downloaded successfully.', 'file_name': 'data/' + file_id + '.csv' }
          file.on('finish', function () {
            file.close(callback(null, payload))
          })
        })
      } else {
        var payload = {'success': false, 'message': 'Failed to download file.', 'http_status_code': response.statusCode }
        callback(payload)
      }
    })

    //
    // If requests finds an error,
    // returns to the user.
    //
    request.on('error', function (error) {
      callback({ 'success': false, 'message': 'Failed to download file.', 'error': error })
    })

  }

  //
  // Inferring data types from
  // CSV input.
  //
  function InferDataTypes (file_path, all_text, callback) {
    //
    // Hack to account for missing parameter.
    //
    var file = fs.createReadStream(file_path)

    //
    // Defining CSV parser.
    //
    var parser = csv.parse({columns: true}, function (err, data) {
      if (err) {
        callback({ 'success': false, 'message': 'Data types inference failed.' })
      }

      file.on('close', function () {
        //
        // Forcing all types as text.
        //
        var keys = Object.keys(data[0])
        if (all_text) {
          for (var i = 0; i < keys.length; i++) {
            resourceInfo['schema']['fields'].push({ 'id': keys[i], 'type': 'text' })
          }
        }

        //
        // Send success and close file.
        //
        var payload = { 'success': true, 'message': 'Data types inferred successfully.', 'file_name': file_path, 'keys': resourceInfo }
        file.close(callback(null, payload))
      })
    })

    //
    // Piping file into the CSV parser.
    //
    file.pipe(parser)

  }

  //
  // Creates DataStore on a CKAN instance.
  //
  function CreateDataStore (file_path, callback) {
    var file = fs.createReadStream(file_path)
    var parser = csv.parse({ columns: true }, function (err, data) {
      if (err) {
        callback({ 'success': false, 'message': 'Could not parse CSV file.', 'error': err })
      }
      file.on('close', function () {
        //
        // Closes file and creates DataStore.
        //
        file.close(
          client.action('datastore_create',
            {
              resource_id: resourceInfo.id,
              records: data,
              force: true,
              fields: resourceInfo['schema']['fields']
            },
            function (err) {
              if (err) {
                callback({ 'success': false, 'message': 'There was an error creating the DataStore.', 'error': err })
              } else {
                var payload = Config.CkanInstance + 'api/action/datastore_search?resource_id=' + resourceInfo.id + '&amp;limit=5'
                callback(null, { 'success': true, 'message': 'Created the DataStore successfully.', 'URL': payload })
              }
            })
        )

        //
        // Delete file from file system.
        // TODO: no callback sent!
        //
        DeleteFile(file_path, false)

      })
    })

    //
    // Piping file into the CSV parser.
    //
    file.pipe(parser)
  }

  //
  // Deletes file from file system.
  //
  function DeleteFile (file_path, verbose, callback) {
    fs.unlink(file_path, function (err) {
      if (err) {
        callback({ 'success': false, 'message': 'Failed to delete file.', 'error': err})
      } else {
        if (verbose) {
          console.log('File ' + file_path + ' deleted successfully.')
        }
      }
    })
  }

  //
  // Deletes DataStore.
  // Useful for cleaning before creating.
  //
  function DeleteDataStore (data, verbose, callback) {
    if (verbose) {
      console.log('Deleting datastore.')
    }

    client.action('datastore_delete', {
      resource_id: resourceInfo.id,
      force: true
    }, function (err) {
      if (err) {
        callback({ 'success': false, 'message': 'Could not delete old DataStore.', 'error': err })
      } else {
        callback(null, { 'success': true, 'message': 'DataStore deleted successfully DataStore.', 'url': '/show/' + resourceInfo.id })
      }
    })
  }

  //
  // ROUTES =============================================================
  //
  app.get('/datastore', function (req, res) {
    var payload = {
      'online': true,
      'message': 'Service for creating datastores on a CKAN instance.',
      'CKAN_instance': Config.CkanInstance,
      'version': Config.version,
      'repository': Config.repository
    }
    res.send(payload)
  })

  // Collect resource id from parameter.
  app.param('resource_id', function (req, res, next, id) {
    resourceInfo.id = id
    next()
  })

  // Show a specific dataset.
  app.get('/datastore/show/:resource_id', function (req, res) {
    FetchDatasetInfo(function (err, data) {
      if (err) {
        res.send(err)
      } else {
        res.send(data)
      }
    })
  })

  // Endpoint for deleting DataStores.
  app.get('/delete/:resource_id', function (req, res) {
    DeleteDataStore(null, false, function (err, data) {
      if (err) {
        res.send(err)
      } else {
        res.send(data)
      }
    })
  })

  app.get('/datastore/create/:resource_id', function (req, res) {
    //
    // Checks if the DataStore is active.
    // If it is, delete the active DataStore
    // infer types, and re-create it with
    // new data.
    //
    FetchDatasetInfo(function (err, data) {
      if (err) {
        res.send(err)
      } else {
        if (data.datastore_active) {
          DeleteDataStore(data, false, function (err, data) {
            if (err) {
              res.send(err)
            } else {
              DownloadFile(data, false, function (err, data) {
                if (err) {
                  res.send(err)
                } else {
                  InferDataTypes(data.file_name, Config.InferDataTypes, function (err, data) {
                    if (err) {
                      res.send(err)
                    } else {
                      CreateDataStore(data.file_name, function (err, data) {
                        if (err) {
                          res.send(err)
                        } else {
                          res.send(data)
                        }
                      })
                    }
                  })
                }
              })
            }
          })

        //
        // If DataStore doesn't exist it
        // downloads file, infers data types,
        // and creates DataStore.
        //
        } else {
          DownloadFile(data, false, function (err, data) {
            if (err) {
              res.send(err)
            } else {
              InferDataTypes(data.file_name, Config.InferDataTypes, function (err, data) {
                if (err) {
                  res.send(err)
                } else {
                  CreateDataStore(data.file_name, function (err, data) {
                    if (err) {
                      res.send(err)
                    } else {
                      res.send(data)
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
  })

  //
  // Any other routes redirect
  // to /datastore.
  //
  app.use(function (req, res, next) {
    res.status(404).redirect('/datastore')
  })

}  // module.exports close.
