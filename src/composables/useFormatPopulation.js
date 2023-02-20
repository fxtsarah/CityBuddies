export function useFormatPopulation() {
    // Format a population with comma separators.
    function formatPopulation(pop) {
        return Number(pop).toLocaleString('en-US')
    }

    return { formatPopulation }
}
