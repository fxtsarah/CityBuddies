import { reactive } from 'vue'

export let state = reactive({
    cities_list: null,
    last_submitted_value: null,
    possible_target_cities: null,
    target_city_entry: null,
    buddy_city_entry: null,
    list_loading: true
})