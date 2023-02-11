// Given a string, output all the cities with a label or alternate label that matches the input.
exports.findPossibleMatches = async (targetLabel) => {

    // Escape any quotes present in the input so the query doesn't break.
    let noQuotes = targetLabel.replace("\'", "\\'");
        
    let query = `SELECT DISTINCT ?city ?cityLabel ?population ?cityDescription
                WHERE
                { 
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

exports.getCitiesList = async() => {
    let citiesDupes = await getCitiesDupes()
    let citiesNoDupes = await deleteDupes(citiesDupes)
    let citiesPopSorted = await sortByPop(citiesNoDupes)
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
    return result

    // TODO maybe remove all euro formats in the list here?
}

// Sorts a list of all the cities by population.
async function sortByPop(list) {
    list.sort(
        (first, second) => { 
        return removeEuroFormat(first.population) - removeEuroFormat(second.population) }
    );
    return list
}