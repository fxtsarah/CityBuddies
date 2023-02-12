console.log('Node server started')

// Node imports.
const express = require('express')
const cors = require('cors')

// Extract bodyParser to parse json
const bodyParser = require('body-parser')

// Exptract routers
const submitQueryRouter = require('./routers/submitQueryRouter.js')
const citiesRouter = require('./routers/citiesRouter.js')
const idRouter = require('./routers/idRouter.js')

// Apply routers and other additions to app
const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/submitQuery', submitQueryRouter)
app.use('/cities', citiesRouter)
app.use('/id', idRouter)

// Tell the server to listen on the given port, or port 3000 as default.
app.listen(process.env.port || 3000)