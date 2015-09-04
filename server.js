var express = require('express')
var cors = require('cors')
var app = express()
var port = process.env.PORT || 5000

//
// App variables.
//
var _version = 'v.0.1.4'

//
// Load and launch application.
//
app.use(cors())
require('./app/routes.js')(app)
app.listen(port)
console.log('DataStore service running on port: ' + port)
