export function useRemoveEuroFormat() {
    // Many of the cities have populations where decimal points replace commas.
    // This function takes those numbers that JS assumed were floats and translates them back into integers.
    function removeEuroFormat(num) {
        let numStr = String(num)

        if (numStr.includes(".")) {
            let numArray = numStr.split(".")
            let arrLen = numArray.length
            let digitsInLastChunk = numArray[arrLen - 1].length
            let zerosNeeded = 3 - digitsInLastChunk
            let zeros = "0".repeat(zerosNeeded)
            let lastChunkUpdated = numArray[arrLen - 1].concat(zeros)
            numArray[arrLen - 1] = lastChunkUpdated
            let finalStr = numArray.join('')
            return finalStr
        }
        return num
    }
    return { removeEuroFormat }
}