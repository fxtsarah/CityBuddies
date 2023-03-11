export function useChosenTarget() {
    // Method called when a target city is chosen, 
    // either automatically because there was only one city that matched the inputted name,
    // or manually because the user selected the city from the disambiguation page.
    function chosenTarget(targetId, router) {
        router.push({ name: 'match', params: { targetId: targetId }})
    }
    return { chosenTarget }
}
