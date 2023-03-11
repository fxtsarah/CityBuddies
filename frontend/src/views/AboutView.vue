<template>
    <div id='about-info' class='text-start'>
        
        <p>This web app determines which city is the closest to another in terms of population.</p>
        <br>
        <h5>How to Use:</h5>
        <p>Input the name of a city into the 'City Name' search bar.
        If there are multiple cities with the given name, 
        you will be asked to choose which city you would like to search for by clicking on the city's description.</p>
        <br>
        <h5>How It's Made:</h5>
        <p>Every time the website is loaded, a query is made to <a href='https://www.wikidata.org/wiki/Wikidata:Main_Page' target='_blank'>Wikidata</a>
        that returns the list of all the cities in its database, as well as their populations.
        This list allows the 'buddy' - the city with the closest population to another - to be calculated.
        Once the buddy is found, another query to Wikidata is sent to ask for the location of both the inputted city and the buddy. Those locations are used by <a href='https://leafletjs.com/' target='_blank'>Leaflet</a> to show where the cities are on a map.
        </p>
        <br>
        <p><a href='https://github.com/sjkkolasa/CityBuddies' target='_blank'>View the City Buddies repository on GitHub!</a></p>

    </div>
</template>

<style lang='scss' scoped>
@import '../../public/constants.scss';

#about-info {
    padding: min(2.5rem, 6vw);
}

a {
    color: $secondary;
}

h5, p {
    font-size: 1.8rem;
}

h5 {
    font-weight: bold;
}

</style>
