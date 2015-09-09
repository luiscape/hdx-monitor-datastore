var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')

//
// App variables.
//
var _version = 'v.0.1.4'
var port = process.env.PORT || 5000

//
// Load and launch application.
//
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
require('./app/routes.js')(app)
app.listen(port)
console.log('DataStore service running on port: ' + port)
