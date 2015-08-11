  /*
 /   Testing the DataStore application.
/                                        */

/* Dependencies */
var path = require('path')
var expect = require('chai').expect
var supertest = require('supertest')

/* Application */
var Config = require('../config/dev')
var Datastore = require('../app/datastore.js')

/* Tests */

describe('DataStore core service scripts.', function () {

  it('Configuration file type should be an object.', function (done) {
    expect(typeof Config).to.equal('object')
    done()
  })

})
