//
// Tests configuration files.
//
var fs = require('fs')
var path = require('path')
var should = require('should')
var chai = require('chai')
var expect = require('chai').expect
var http = require('http')
var chaiHttp = require('chai-http')

//
// Configuring Chai to use http.
//
chai.use(chaiHttp)

describe('Application routes.', function () {
  var application = chai.request('http://localhost:5000')

  it('GET [/status] should return 200 status.', function (done) {
    application
      .get('/status')
      .end(function (err, res) {
        expect(res.status).to.equal(200)
        done()
      })
  })

  it('GET [/status] to have complete status object.', function (done) {
    application
      .get('/status')
      .end(function (err, res) {
        expect(res.body).to.have.a.property('online')
        expect(res.body).to.have.a.property('message')
        expect(res.body).to.have.a.property('version')
        expect(res.body).to.have.a.property('repository')
        done()
      })
  })

  it('GET [/] should return 200 status.', function (done) {
    application
      .get('/')
      .end(function (err, res) {
        expect(res.status).to.equal(200)
        done()
      })
  })

  it('GET [/] without an ID should provide a warning message.', function (done) {
    application
      .get('/')
      .end(function (err, res) {
        expect(res.body).to.have.a.property('success')
        expect(res.body).to.have.a.property('message')
        done()
      })
  })

  it('GET [/rest/ID] shoud get a 200 redirect HTTP status code.', function (done) {
    application
      .get('/rest/foo-bar-test')
      .end(function (err, res) {
        expect(res.status).to.equal(200)
        done()
      })
  })

  it('POST [/rest/ID] shoud get a 200 redirect HTTP status code.', function (done) {
    application
      .post('/rest/foo-bar-test')
      .end(function (err, res) {
        expect(res.status).to.equal(200)
        done()
      })
  })

  it('DELETE [/rest/ID] shoud get a 200 redirect HTTP status code.', function (done) {
    application
      .delete('/rest/foo-bar-test')
      .end(function (err, res) {
        expect(res.status).to.equal(200)
        done()
      })
  })

  it('GET [/show/ID]  with an id should return a complete object.', function (done) {
    application
      .get('/show/test-foo-bar')
      .end(function (err, res) {
        expect(res.body).to.have.a.property('success')
        done()
      })
  })

  it('GET [/delete/ID] with an id should return a complete object.', function (done) {
    application
      .get('/delete/test-foo-bar')
      .end(function (err, res) {
        expect(res.body).to.have.a.property('success')
        done()
      })
  })

  it('GET [/create/ID] with an id should return a complete object.', function (done) {
    application
      .get('/create/test-foo-bar')
      .end(function (err, res) {
        expect(res.body).to.have.a.property('success')
        done()
      })
  })

  it('GET [/404] should return a 404 status code.', function (done) {
    application
      .get('/foo/404')
      .end(function (err, res) {
        expect(res.status).to.equal(404)
        done()
      })
  })

  it('GET [/404] should return a page not found message.', function (done) {
    application
      .get('/foo/404')
      .end(function (err, res) {
        expect(res.body.success).to.equal(false)
        expect(res.body).to.have.a.property('success')
        expect(res.body).to.have.a.property('message')
        done()
      })
  })

})
