<template>
    <div id = "banner">
    <div id="banner_text">
      <h1>City Buddies</h1>
      <p style="font-size: 20px;">See which city is nearest in population to your city</p>
    </div>

    <div id="banner_form">
      <input placeholder="City name" class="form-control" :class="{ disabled_input: list_loading }" id="input_form" v-model="input_value" :tabindex=this.input_tab_index>
      <button class="btn btn-light" :class="{ disabled_button: list_loading }" id="input_button" @click="input_submit">Search For Buddy</button>
      <p v-if="list_loading" id="list_loading"><i>The cities list is loading, please wait...</i></p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Banner',
  props: {
    list_loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      input_value: ""
    }
  },
  methods: {
    input_submit() {
      this.$emit('input_submit', this.input_value)
      this.input_value = ""
    }
  },
  computed: {
    input_tab_index() {
      return this.list_loading ? "-1" : "0";
    }
  }
}
</script>
