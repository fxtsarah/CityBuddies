<template>
  <div id="disambiguation_info" v-if="props.active">
    <h3 class="above_divider">Choose which <strong>{{ props.target_label }}</strong> you want to search for:</h3>
    <div class="divider"></div>
    <ul class="below_divider" id="disambiguation_list">
      <li v-for="entry in props.cities" :key="entry" @keydown.enter="chosen_target(entry.value)" @click="chosen_target(entry.value)" class ="city_choice" tabindex="0" >
        <h4>{{entry.description}}</h4>
      </li>
    </ul>
  </div>
</template>

<script setup>

const emit = defineEmits(['chosen_target'])
const props = defineProps(['target_label', 'cities', 'active'])

function chosen_target(id) {
    emit("chosen_target", id)
}

</script>

<style>
#disambiguation_list {
    list-style-type: none;
    
}
#disambiguation_info {
    margin-top: 25px;
}
.city_choice {
    width: 55%;
    margin: auto;
    margin-bottom: 20px;
}
.city_choice:hover {
    color: #519872;
}

.city_choice:focus {
    color: #519872;
    outline: none;
}
ul {
  padding-left: 0;
}
@media screen and (max-width: 900px) {
    .city_choice {
      width: 90%;
      margin-bottom: 25px;
    }
}
</style>
