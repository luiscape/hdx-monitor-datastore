var express = require('express')
var app = express()
var port = process.env.PORT || 5000

//
// Load and launch application.
//
require('./app/datastore.js')(app)
app.listen(port)
console.log('DataStore service running on port: ' + port)
