const axios = require("axios")
const wbk = require("wikibase-sdk")
import Api from "../Api"

export function use_submit_query() {
    async function submit_query(sparql) {
      var ret = await Api().post('submit_query', {"sparql": sparql})
      return ret.data
  }

    return { submit_query }
}