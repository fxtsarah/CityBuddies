import Api from "./services.Api"

export default {
    submit_query(sparql) {
        return Api().post('submit_query', {"sparql": sparql})
    }

}