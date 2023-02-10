// import composables
import { useRemoveEuroFormat } from './useRemoveEuroFormat.js'

// extract functions from composables
let { removeEuroFormat } = useRemoveEuroFormat()

export function useFormatPopulation() {
    // format a population with comma separators
    function formatPopulation(pop) {
        return Number(removeEuroFormat(pop)).toLocaleString("en-US")
    }

    return { formatPopulation }
}