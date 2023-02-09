<template>
  <div id="map" :class="{ invisible: !props.active }"></div>
</template>

<script setup>

// vue imports
import { watch, onMounted } from 'vue'

// import composables
import { use_submit_query } from '../composables/use_submit_query.js'

// extract functions from composables
let { submit_query } = use_submit_query()

// define props
const props = defineProps(['active', 'target_id', 'target_label', 'buddies'])

// map variables to be accessible from the entire component
let map
let layerGroup

// initializes the map when the component is mounted
onMounted(async () => {
    map = L.map('map').setView([0, 0], get_zoom() )
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    layerGroup = L.layerGroup().addTo(map)
})

// when the user makes a new search, call this function to re-center the map and get rid of the old buddy markers.
async function reset_map() {
    layerGroup.clearLayers()
    map.setView([0, 0], get_zoom() )
}

// determines how far the map should be zoomed in
// map should be zoomed out further on mobile than on desktop
function get_zoom() {
    return (window.innerWidth > 900) ? 2 : 1
}

// add markers on the map at the locations of the target and buddy cities
async function add_markers() {
    // add target marker
    let target_latlong = await id_to_latlong(props.target_id)
    add_marker(target_latlong, props.target_label, true)

    // add buddy markers
    for (let i = 0; i < props.buddies.length; i++) {
        let buddy = props.buddies[i]
        let buddy_latlong = await id_to_latlong(buddy.id)
        add_marker(buddy_latlong, buddy.label, false)
    }
}

// add a single marker to the map with the given coordinate and label.
// if the marker represents the target city, the marker is orange. 
// otherwise, the marker is green.
function add_marker(latlong, label, isTarget) {
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

// get the latitude and longitude of a city given its ID.
async function id_to_latlong(target_id) {
    let query = `SELECT ?city ?long ?lat
                WHERE
                {
                VALUES ?city { wd:${target_id}} 
                ?city p:P625 ?coordinate.
                ?coordinate psv:P625 ?coordinate_node.
                ?coordinate_node wikibase:geoLongitude ?long.
                ?coordinate_node wikibase:geoLatitude ?lat.  
                }`
    let result = await submit_query(query)
    return L.latLng(result[0]["lat"], result[0]["long"])
}

// whenever the target_label is changed, refresh the map with the new data.
watch(()=>props.target_label, async (new_label) => {
    await reset_map()
    await add_markers()
})

// whenever the buddies are changed, refresh the map with the new data.
watch(()=>props.buddies, async (new_buddies) => {
    await reset_map()
    await add_markers()
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