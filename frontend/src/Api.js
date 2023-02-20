// Ensures that all API calls are directed to the localhost at port 3000

import axios from 'axios'

export default () => {
    return axios.create({
        baseURL: `http://localhost:3000`
    })
}