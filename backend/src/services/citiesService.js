// Import services.
const submitQueryService = require('./submitQueryService.js')

// Extract functions from services.
const { submitQuery } = submitQueryService

// Given a string, output all the cities with a label or alternate label that matches the input.
exports.findPossibleMatches = async (label) => {
    // Escape any quotes present in the input so the query doesn't break.
    let noQuotes = label.replace("\'", "\\'");
        
    let query = `SELECT DISTINCT ?city ?cityLabel ?population ?cityDescription
                WHERE { 
                    ?city wdt:P31/wdt:P279* wd:Q515 .
                    { ?city skos:altLabel \'${noQuotes}\'@en }
                    UNION
                    { ?city rdfs:label \'${noQuotes}\'@en }
                    ?city wdt:P1082 ?population .
                                        
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                } ORDER BY DESC (?population)`

    try {
        let result = await submitQuery(query)
        // Remove duplicate cities from the result.
        let noDupes = await deleteDupes(result)
        return noDupes
    }
    catch(error) {
        throw new Error(error)
    }
}

// Get the list of all the cities. Each entry includes the ID and population.
exports.getCitiesList = async() => {
    let citiesDupes = await getCitiesDupes()
    let citiesNoDupes = await deleteDupes(citiesDupes)
    let citiesPopSorted = sortByPop(citiesNoDupes)
    return citiesPopSorted
}

// Get a list of all the cities from wikidata, without removing duplicate entries.
// Cities without a population, without a point in time associated with that population, 
// or with a point in time earlier that 2000 are excluded.
// Sort these cities by the date at which their population was recorded so that when we remove duplicates,
// we keep the most recent population from every city.
async function getCitiesDupes() {
    let query = `SELECT DISTINCT ?city ?cityPopulation WHERE { 
                ?city wdt:P31/wdt:P279* wd:Q515 . 
                ?city p:P1082 ?populationStatement . 
                ?populationStatement ps:P1082 ?cityPopulation.
                ?populationStatement pq:P585 ?date
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } 
                FILTER("2000-01-01"^^xsd:dateTime <= ?date)
                } 
                ORDER BY DESC(?date)`
                // This code excludes cities that don't have a label, although it makes the program run more slowly.
                // filter exists {                          
                //   ?city rdfs:label ?enLabel .                    
                //   filter(langMatches(lang(?enLabel),"en"))   
                // }
    let result = await submitQuery(query)

    // remove euro format
    let resultNoEuro = result.map(entry => {
        return { city: { value: entry.city.value, population: removeEuroFormat(entry.city.population)}}
    })

    return resultNoEuro

}

// Many of the cities have populations where decimal points replace commas.
// This function takes those numbers that JS assumed were floats and translates them back into integers.
function removeEuroFormat(num) {
    let numStr = String(num)

    if (numStr.includes('.')) {
        let numArray = numStr.split('.')
        let arrLen = numArray.length
        let digitsInLastChunk = numArray[arrLen - 1].length
        let zerosNeeded = 3 - digitsInLastChunk
        let zeros = '0'.repeat(zerosNeeded)
        let lastChunkUpdated = numArray[arrLen - 1].concat(zeros)
        numArray[arrLen - 1] = lastChunkUpdated
        let finalStr = numArray.join('')
        return finalStr
    }
    return num
}

// Deletes duplicates from the list that get_cities_dupes() returns.
// By only taking the first instance of every id in the list, only the most recent population record is saved,
// since the list is sorted by population date.
async function deleteDupes(listWithDupes) {
    // The working list of all the cities, without any cities with the same ID.
    let listNoDupes = []
    // The list of the city IDs that have already been added.
    let citiesAdded = []

    // Loop though every city one, beginning with the ones that have the most recent population record.
    for (let i = 0; i < listWithDupes.length; i++) {
        let entry = listWithDupes[i]
        // If a city with this ID, has not already been added, add this entry to the list.
        if (!citiesAdded.includes(entry.city.value)) {
            citiesAdded.push(entry.city.value)
            listNoDupes.push(entry.city)
        } 
    }
    return listNoDupes    
}

// Sorts a list of all the cities by population.
function sortByPop(list) {
    list.sort(
        (first, second) => { 
        return first.population - second.population }
    );
    return list
}
