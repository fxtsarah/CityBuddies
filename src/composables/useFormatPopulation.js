// Import composables.
import { useRemoveEuroFormat } from './useRemoveEuroFormat.js'

// Extract functions from composables.
let { removeEuroFormat } = useRemoveEuroFormat()

export function useFormatPopulation() {
    // Format a population with comma separators.
    function formatPopulation(pop) {
        return Number(removeEuroFormat(pop)).toLocaleString('en-US')
    }

    return { formatPopulation }
}