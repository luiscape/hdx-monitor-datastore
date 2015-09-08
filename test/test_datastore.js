/*
 /   Testing the DataStore application.
/                                        */

/* Dependencies */
var path = require('path')
var http = require('http')
var expect = require('chai').expect
var supertest = require('supertest')

/* Application */
var Config = require('../config/dev')
var Datastore = require('../app/datastore.js')

//
// Helper function.
//
EvaluateObjectCallbacks = function (err, data) {
  var result
  if (err) {
    result = err
  } else {
    result = data
  }
  expect(typeof result).to.equal(typeof {})
}

describe('DataStore core service scripts.', function () {
  it('Configuration file type should be an object.', function (done) {
    expect(typeof Config).to.equal('object')
    done()
  })

  it('FetchDatasetInfo() should return an object', function (done) {
    Datastore.FetchDatasetInfo(EvaluateObjectCallbacks)
    done()
  })

  // it('ProcessResponse() should return an object', function (done) {
  //   var url = 'http://www.google.com'
  //   EvaluateCallback = function (err, logical, payload) {
  //     var result
  //     if (err) {
  //       result = err
  //     } else {
  //       result = payload
  //     }
  //     expect(typeof result).to.equal(typeof {})
  //     expect(typeof logical).to.equal(typeof true)
  //   }
  //   http.get(url, function (response) {
  //     var body = ''
  //     response.on('data', function (chunk) {
  //       body += chunk
  //     })
  //     response.on('end', function () {
  //       Datastore.ProcessResponse(response, EvaluateCallback)
  //       done()
  //     })
  //   })
  // })

  // it('DownloadFile() should return an object', function (done) {
  //   Datastore.ProcessResponse(EvaluateObjectCallbacks)
  //   done()
  // })

  // it('InferDataTypes() should return an object', function (done) {
  //   Datastore.ProcessResponse(EvaluateObjectCallbacks)
  //   done()
  // })

  // it('DeleteFile() should return an object', function (done) {
  //   Datastore.ProcessResponse(EvaluateObjectCallbacks)
  //   done()
  // })

  // it('DeleteDataStore() should return an object', function (done) {
  //   Datastore.ProcessResponse(EvaluateObjectCallbacks)
  //   done()
  // })

})
