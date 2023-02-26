<template>
    <div id='about-info' class='text-start'>
        <h5>This web app determines which city is the closest to another in terms of population.</h5>
        <br>
        <h5><strong>How to Use:</strong></h5>
        <h5>Input the name of a city into the 'City Name' search bar.
        If there are multiple cities with the given name, 
        you will be asked to choose which city you would like to search for by clicking on the city's description.</h5>
        <br>
        <h5><strong>How It's Made:</strong></h5>
        <h5>Every time the website is loaded, a query is made to <a href='https://www.wikidata.org/wiki/Wikidata:Main_Page' target='_blank'>Wikidata</a>
        that returns the list of all the cities in its database, as well as their populations.
        This list allows the 'buddy' - the city with the closest population to another - to be calculated. <br><br>
        Once the buddy is found, another query to Wikidata is sent to ask for the location of both the inputted city and the buddy. Those locations are used by <a href='https://leafletjs.com/' target='_blank'>Leaflet</a> to show where the cities are on a map.
        </h5>
        <br>
        <h5><a href='https://github.com/sjkkolasa/CityBuddies' target='_blank'>View the City Buddies repository on GitHub!</a></h5>

    </div>
</template>

<style lang='scss'>
@import '../../public/constants.scss';

#about-info {
    padding: min(2.5rem, 6vw);
}

a {
    color: $secondary;
}

</style>
