  /*
 /   Testing the configuration files.
/                                      */

/* Dependencies */
var fs = require('fs')
var path = require('path')
var should = require('should')
var expect = require('chai').expect

/* Application */
var Dev = require('../config/dev')
var Prod = require('../config/prod')

/* Tests */
describe('Configuration files.', function () {

  it('Configuration files should be JSON objects.', function (done) {
    expect(typeof (Dev)).to.equal('object')
    expect(typeof (Prod)).to.equal('object')
    done()
  })

  it('Configuration files should contain CKAN (default) instance.', function (done) {
    expect(Dev).to.have.a.property('CkanInstance')
    expect(Prod).to.have.a.property('CkanInstance')
    done()
  })

  it('Configuration files should contain default data folder (and it should exist).', function (done) {
    var base_directories = fs.readdirSync(path.dirname(__dirname))
    var base_name = path.basename(Dev.DataFolder)
    base_directories.should.containEql(base_name)
    done()
  })

  it('Configuration files should contain InferDataType option.', function (done) {
    expect(Dev).to.have.a.property('InferDataTypes')
    expect(Prod).to.have.a.property('InferDataTypes')
    done()
  })

})
