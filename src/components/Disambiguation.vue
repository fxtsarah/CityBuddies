<template>
  <div id="disambiguation_info" v-if="active">
    <h3 class="above_divider">Choose which <strong>{{ target_label }}</strong> you want to search for:</h3>
    <div class="divider"></div>
    <div class="below_divider">
      <div v-for="entry in this.cities" :key="entry" @click="chosen_target(entry.value)" class ="city_choice" >
        <h4>{{entry.description}}</h4>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Disambiguation',
  props: {
    target_label: {
        type: String,
        default: ""
    },
    cities: {
        type: Array
    },
    active: {
        type: Boolean
    }

  },
  methods: {
    chosen_target(id) {
        this.$emit("chosen_target", id)
    }
  },
}
</script>
