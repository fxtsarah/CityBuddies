const axios = require("axios")
const wbk = require("wikibase-sdk")

console.log("Node server started")

const express = require('express')
const cors = require('cors')
const body_parser = require('body-parser')
const submitQueryRouter = require('./routers/submitQueryRouter.js')

const app = express()
app.use(cors())
app.use(body_parser.json())

app.post('/submit_query', async (req, res) => {
    const wdk = wbk({
                  instance: 'https://www.wikidata.org',
                  sparqlEndpoint: 'https://query.wikidata.org/sparql'
                  })
              
    const url = wdk.sparqlQuery(req.body.sparql)
    const results = await axios.get(url)
    let simplifiedResults = wbk.simplify.sparqlResults(results.data)
    res.send(simplifiedResults)
})

app.listen(process.env.port || 3000)