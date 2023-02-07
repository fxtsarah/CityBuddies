import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/404View.vue'
import AboutView from '../views/AboutView.vue'
import Disambiguation from '../components/Disambiguation.vue'
import Buddy_Match from '../components/Buddy_Match.vue'
import City_Not_Found from '../components/City_Not_Found.vue'
import Other_Buddies from '../components/Other_Buddies.vue'
import Search from '../components/Search.vue'

import { use_submit_query } from '../composables/use_submit_query.js'
let { submit_query } = use_submit_query()

const routes = [
  // Home View: Where the user is directed after submitting an input. Shows the user who is buddies with the inputted city
  // as well as prompting the user to choose a city from a disambiguation page if necessary.
  {
    path: '/',
    name: 'home',
    component: HomeView,
    children: [
      {
        path: 'disambiguation/:target_label',
        name: 'disambiguation',
        component: Disambiguation,
        children: [
          {
            path: '',
            name: "disamb-to-search",
            component: Disambiguation,
            redirect: to => {
              return { name: 'search', params: { target_label: to.params.target_label } }
          }
        }
        ]
      },
      {
        path: 'city-not-found/:target_label',
        name: 'city-not-found',
        component: City_Not_Found,
        children: [
          {
            path: '',
            name: "not-found-to-search",
            component: Disambiguation,
            redirect: to => {
              return { name: 'search', params: { target_label: to.params.target_label } }
          }
        }
        ]
      },
      {
        path: 'match/:target_id/:buddy_id',
        name: 'match',
        component: Buddy_Match,
        children: [
          {
            path: '',
            name: "match-to-search",
            component: Disambiguation,
            beforeEnter: async (to, from) => {
              return { name: 'search', params: { target_label: await id_to_label(to.params.target_id) } }
            }
          }
        ]
      },
      
      {
        path: 'other-buddies/:target_id',
        name: 'other-buddies',
        component: Other_Buddies,
        children: [
          {
            path: '',
            name: "other-buddies-to-search",
            component: Disambiguation,
            redirect: async to => {
              return { name: 'search', params: { target_label: await id_to_label(to.params.target_id) } }
          }
        }
        ]
      },
      {
        path: 'search/:target_label',
        name: 'search',
        component: Search
      }
    ]
  },
  // About: Describes what the website is, how to use it, and very generally how it works.
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  // 404: Landing page for any other routes
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// get the name of a city given its ID
async function id_to_label(target_id) {
  var query = `SELECT DISTINCT ?cityLabel {
                VALUES ?city { wd:${target_id}} 
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                }`
  var result = await submit_query(query)
  return result[0]["cityLabel"]
}

export default router
