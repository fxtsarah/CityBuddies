import { reactive } from 'vue'

export let state = reactive({
    cities_list: [],
    last_submitted_value: "",
    possible_target_cities: [],
    target_city_entry: {"value":"", "population":0}
})