# City Buddies

This Vue JS web app determines which city is the closest to another in terms of population.

*The 'using-backend' branch contains a version of the website that utilizes Node JS + Express for the backend, but does not work on MacOS. The functionality is the same as the main branch.*

## Live site
Visit the website live at https://citybuddies.netlify.app/ (runs the main branch)

## Functionality

Every time the website is loaded, an API query is made to the [Wikidata Query Service](https://query.wikidata.org/) that returns the list of all the cities in its database, as well as their populations. This list allows the 'buddy' - the city with the closest population to another - to be calculated. 

In the website banner, the user can search for the name of any city.






## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
