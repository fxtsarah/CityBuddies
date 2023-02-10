<template>
  <div id='map' :class='{ invisible: !props.active }'></div>
</template>

<script setup>

// Vue imports.
import { watch, onMounted } from 'vue'

// Import composables.
import { useSubmitQuery } from '../composables/useSubmitQuery.js'

// Extract functions from composables.
let { submitQuery } = useSubmitQuery()

// Define props.
const props = defineProps(['active', 'targetId', 'targetLabel', 'buddies'])

// Map variables to be accessible from the entire component.
let map
let layerGroup

// Initializes the map when the component is mounted.
onMounted(async () => {
    map = L.map('map').setView([0, 0], getZoom() )
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    layerGroup = L.layerGroup().addTo(map)
})

// When the user makes a new search, call this function to re-center the map and get rid of the old buddy markers.
async function resetMap() {
    layerGroup.clearLayers()
    map.setView([0, 0], getZoom() )
}

// Determines how far the map should be zoomed in.
// The map should be zoomed out further on mobile than on desktop.
function getZoom() {
    return (window.innerWidth > 900) ? 2 : 1
}

// Add markers on the map at the locations of the target and buddy cities.
async function addMarkers() {
    // Add target marker.
    let targetLatlong = await idToLatlong(props.targetId)
    addMarker(targetLatlong, props.targetLabel, true)

    // Add buddy markers.
    for (let i = 0; i < props.buddies.length; i++) {
        let buddy = props.buddies[i]
        let buddyLatlong = await idToLatlong(buddy.id)
        addMarker(buddyLatlong, buddy.label, false)
    }
}

// Add a single marker to the map with the given coordinate and label.
// If the marker represents the target city, the marker is orange. 
// Otherwise, the marker is green.
function addMarker(latlong, label, isTarget) {
    let icon = L.icon({
        iconUrl: isTarget ? '/map-marker-orange.png' : '/map-marker-green.png' ,
        shadowUrl: '/marker-shadow.png',

        iconSize:     [25, 40], // size of the icon
        shadowSize:   [40, 50], // size of the shadow
        iconAnchor:   [12.5, 40], // point of the icon which will correspond to marker's location
        shadowAnchor: [12.5, 50],  // the same for the shadow
    });

    let marker = L.marker(latlong, {icon: icon}).addTo(layerGroup);
    marker.bindTooltip(label, {permanent: true, offset: [15, -20] });
}

// Get the latitude and longitude of a city given its ID.
async function idToLatlong(targetId) {
    let query = `SELECT ?city ?long ?lat
                WHERE
                {
                VALUES ?city { wd:${targetId} } 
                ?city p:P625 ?coordinate.
                ?coordinate psv:P625 ?coordinate_node.
                ?coordinate_node wikibase:geoLongitude ?long.
                ?coordinate_node wikibase:geoLatitude ?lat.  
                }`
    let result = await submitQuery(query)
    return L.latLng(result[0].lat, result[0].long)
}

// Whenever the targetLabel is changed, refresh the map with the new data.
watch(() => props.targetLabel, async (newLabel) => {
    await resetMap()
    await addMarkers()
})

// Whenever the buddies are changed, refresh the map with the new data.
watch(() => props.buddies, async (newBuddies) => {
    await resetMap()
    await addMarkers()
})

</script>

<style>

#map { 
    display: block;
    height: 500px; 
    max-height: 500px; 
    margin-top: 50px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden
}

</style>