var fs = require('fs')
var csv = require('csv')
var url = require('url')
var ckan = require('ckan')
var crypto = require('crypto')
var Config = require('../config/dev')
var http = require('follow-redirects').http
var https = require('follow-redirects').https

//
// Starting CKAN client.
//
var client = new ckan.Client(Config.CkanInstance, Config.ApiKey)

//
// Fetch the metadata from a resource.
//
var FetchDatasetInfo = function (resource, callback) {
  client.action('resource_show', { id: resource.id }, function (err, out) {
    if (!err) {
      var resource_data = out.result
      callback(null, resource_data)
    } else {
      var payload = { 'success': false, 'message': 'Failed to fetch resource information.', 'error': err }
      callback(payload)
    }
  })
}

//
// Processes response. Desinged to switch
// between HTTP and HTTPS based on
// redirect chains.
//
var ProcessResponse = function (response, callback) {
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
    var payload = { 'success': true, 'message': 'Redirect successful.', 'url': response.headers.location }
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
var DownloadFile = function (resource_data, verbose, callback) {
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
    path: url.parse(resource_data.url).path,
    headers: { 'X-CKAN-API-Key': Config.ApiKey }
  }
  var request = https.get(options, function (response) {
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
        payload = { 'success': true, 'message': 'File downloaded successfully.', 'file_name': 'data/' + file_id + '.csv' }
        file.on('finish', function () {
          file.close(callback(null, payload))
        })
      })
    } else {
      var payload = { 'success': false, 'message': 'Failed to download file.', 'http_status_code': response.statusCode }
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

var AssignSchema = function (file_path, request_data, resource, callback) {
  console.log('Assigning schema from request body: ' + JSON.stringify(request_data))
  if (request_data === null) {
    var payload = {
      'success': false,
      'message': 'No schema data provided in the request.'
    }
    callback(payload)
  }
  if (typeof request_data !== typeof {}) {
    var payload = {
      'success': false,
      'message': 'Request data does not seem to be an object.'
    }
    callback(payload)
  }
  if (request_data.type === undefined || request_data.id === undefined) {
    var payload = {
      'success': false,
      'message': 'Request data does not seem to contain the fields `type` and `id`.'
    }
    callback(payload)
  } else {
    //
    // Add keys to resouce variable.
    //
    for (i = 0; i < request_data.id.length; i++) {
      resource['schema']['fields'].push({ 'id': request_data.id[i], 'type': request_data.type[i] })
    }

    //
    // Send success.
    //
    var payload = { 'success': true, 'message': 'Data types assigned successfully..', 'file_name': file_path, 'keys': resource }
    callback(null, payload)
  }
}

//
// Inferring data types from
// CSV input.
//
var InferDataTypes = function (file_path, all_text, resource, callback) {
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
          resource['schema']['fields'].push({ 'id': keys[i], 'type': 'text' })
        }
      }

      //
      // Send success and close file.
      //
      var payload = { 'success': true, 'message': 'Data types inferred successfully.', 'file_name': file_path, 'keys': resource }
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
var CreateDataStore = function (file_path, resource, callback) {
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
            resource_id: resource.id,
            records: data,
            force: true,
            fields: resource['schema']['fields']
          },
          function (err) {
            if (err) {
              callback({
                'success': false,
                'message': 'There was an error creating the DataStore.',
                'error': {
                  'message': err.split(' Message: ')[0],
                  'output': JSON.parse(err.split(' Message: ')[1])
                }
              })
            } else {
              var payload = Config.CkanInstance + 'api/action/datastore_search?resource_id=' + resource.id + '&amp;limit=5'
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
var DeleteFile = function (file_path, verbose, callback) {
  fs.unlink(file_path, function (err) {
    if (err) {
      callback({ 'success': false, 'message': 'Failed to delete file.', 'error': err })
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
var DeleteDataStore = function (data, verbose, resource, callback) {
  if (verbose) {
    console.log('Deleting datastore.')
  }

  client.action('datastore_delete', {
    resource_id: resource.id,
    force: true
  }, function (err) {
    if (err) {
      callback({ 'success': false, 'message': 'Could not delete old DataStore.', 'error': err })
    } else {
      callback(null, { 'success': true, 'message': 'DataStore deleted successfully DataStore.', 'url': '/show/' + resource.id })
    }
  })
}

//
// Exporting functions.
//
module.exports = {
  FetchDatasetInfo: FetchDatasetInfo,
  ProcessResponse: ProcessResponse,
  DownloadFile: DownloadFile,
  AssignSchema: AssignSchema,
  InferDataTypes: InferDataTypes,
  CreateDataStore: CreateDataStore,
  DeleteFile: DeleteFile,
  DeleteDataStore: DeleteDataStore
}
