require('console-stamp')(console, '[HH:MM:ss.l]')

var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')

//
// App variables.
//
var port = process.env.PORT || 5000

//
// Configure CORS and body parser.
//
app.use(cors())
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.urlencoded({ extended: false }))

//
// Load routes and start application.
//
require('./app/routes.js')(app)
app.listen(port)
console.log('DataStore service running on port: ' + port)
