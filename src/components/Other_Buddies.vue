<template>
    <div>
        <h1>Other Buddies Tab</h1>
        <!-- <Map :active="info_loaded" :target_id="props.target_entry.value" :target_label="target_label" :buddies="buddy_dict"/> -->
    </div>
</template>

<script setup>

import { onMounted } from 'vue'
import { use_find_buddy } from '../composables/use_find_buddy'

// import state
import { state } from '../stores/store.js'
let { find_buddy } = use_find_buddy()

onMounted( () => {
  console.log(find_buddies(5))
})

// return of list of the 'amt' cities closet in population to the target city entry
function find_buddies(amt) {
  let list = state.cities_list.slice()
  let buddies = []
  for (let i = 0; i < amt; i++){
    let buddy = find_buddy(list)
    buddies.push(buddy)
    list = remove(list, buddy)
  }
  return buddies
}

function remove(list, item) {
  let index = list.indexOf(item);
  if (index > -1) {
    list.splice(index, 1);
  }
  return list;
}

</script>

<style>



</style>