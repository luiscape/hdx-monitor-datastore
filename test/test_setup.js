  /*
 /   Testing the setup script.
/                                 */

/* Dependencies */
var fs = require('fs')
var path = require('path')
var should = require('should')
var expect = require('chai').expect

/* Application */
var Dev = require('../config/dev')
var Prod = require('../config/prod')
var Setup = require('../setup/setup')

console.log(Setup.createDataFolder('dev'))

/* Tests */
describe('Setup scripts.', function () {

  it('Setup script should fail appropriately.', function (done) {
    expect(Setup.createDataFolder('foo')).to.equal(false)
    done()
  })

  it('Setup script should succeed appropriately.', function (done) {
    expect(Setup.createDataFolder('dev')).to.not.equal(false)
    expect(Setup.createDataFolder('prod')).to.not.equal(false)
    done()
  })

  it('Data folder should exist.', function (done) {
    var base_directories = fs.readdirSync(path.dirname(__dirname))

    // Dev
    var base_name = path.basename(Dev.DataFolder)
    base_directories.should.containEql(base_name)
    
    // Prod
    base_name = path.basename(Prod.DataFolder)
    base_directories.should.containEql(base_name)
    done()
  })

})
