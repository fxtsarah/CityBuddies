// import composables
import { use_remove_euro_format } from './use_remove_euro_format.js'

// extract functions from composables
let { remove_euro_format } = use_remove_euro_format()

export function use_format_population() {
  // format a population with comma separators
  function format_population(pop) {
    return Number(remove_euro_format(pop)).toLocaleString("en-US")
  }
  
  return { format_population }
}