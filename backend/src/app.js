const axios = require("axios")
const wbk = require("wikibase-sdk")

console.log("!")

const express = require('express')
const cors = require('cors')
const body_parser = require('body-parser')
// const morgan = require('morgan')

const app = express()
app.use(cors())
// app.use(morgan('combined'))
app.use(body_parser.json())

app.post('/submit_query', async (req, res) => {
    console.log(req)
    console.log(req.query)
    console.log(req.params)
    console.log(req.body)
    console.log(req.body.sparql)
    const wdk = wbk({
                  instance: 'https://www.wikidata.org',
                  sparqlEndpoint: 'https://query.wikidata.org/sparql'
                  })
              
                const url = wdk.sparqlQuery(req.body.sparql)
    const results = await axios.get(url)
    let simplifiedResults = wbk.simplify.sparqlResults(results.data)
    // return simplifiedResults
    res.send(simplifiedResults)
})

app.listen(process.env.port || 3000)
