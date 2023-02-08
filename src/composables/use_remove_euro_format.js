export function use_remove_euro_format() {
    // many of the cities have populations where decimal points replace commas
    // this function takes those numbers that JS assumed were floats and translates them back into integers
    function remove_euro_format(num) {
      var num_str = String(num)

      if (num_str.includes(".")) {
        var num_array = num_str.split(".")
        var arr_len = num_array.length
        var digits_in_last_chunk = num_array[arr_len - 1].length
        var zeros_needed = 3 - digits_in_last_chunk
        var zeros = "0".repeat(zeros_needed)
        var last_chunk_updated = num_array[arr_len - 1].concat(zeros)
        num_array[arr_len - 1] = last_chunk_updated
        var final_str = num_array.join('')
        return final_str
      }
      return num
    }
    return { remove_euro_format }
}