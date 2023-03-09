<template>
    <table class='pop-table'>
        
        <tr class='table-header'>
            <th>City</th>
            <th>Population</th>
        </tr>

        <tr v-for='entry in props.tableDict' :key='entry'>
            <td class='city-cell'><router-link :to="{ name: 'match-redirect', params: { targetId: entry.id } }">{{ entry.label }}, {{ entry.country }}</router-link></td>
            <td>{{ entry.population }}</td>
        </tr>

    </table>
</template>

<script setup>

// Define props.
const props = defineProps(['tableDict'])

</script>

<style lang='scss'>
@import '../../public/constants.scss';


.pop-table {
    margin-left: auto;
    margin-right: auto;
    text-align: left;
    border-collapse: collapse; 
    font-size: 1.75rem;
}
.table-header {
    font-weight: 800;
}

td, th {
    padding: .5rem;
}

.city-cell {
    padding-right: 3rem;
}

.city-cell a {
    color: $primary;
}

.city-cell a:hover, .city-cell a:focus {
    color: $secondary;
    text-decoration: none;
}



</style>
