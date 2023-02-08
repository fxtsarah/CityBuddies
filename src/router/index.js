import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/404View.vue'
import AboutView from '../views/AboutView.vue'
import Disambiguation from '../components/Disambiguation.vue'
import Buddy_Match from '../components/Buddy_Match.vue'
import City_Not_Found from '../components/City_Not_Found.vue'
import Other_Buddies from '../components/Other_Buddies.vue'
import Search from '../components/Search.vue'

// import composables
import { use_id_to_label } from '../composables/use_id_to_label.js'

// extract functions from composables
let { id_to_label } = use_id_to_label()

const routes = [
  // Home View: The main landing page for the user.
  {
    path: '/',
    name: 'home',
    component: HomeView,
    children: [
      // Search: Where the user is directed after submitting an input. Searches for cities that match the user's input
      {
        path: 'search/:target_label',
        name: 'search',
        component: Search
      },
      // Disambiguation: When there are multiple cities with the inputted name, allow the user to choose which city they want
      {
        path: 'disambiguation/:target_label',
        name: 'disambiguation',
        component: Disambiguation,
        children: [
          // Redirects back to the Seach route if the disambiguation page was access via direct link
          {
            path: '',
            name: "disamb-to-search",
            component: Disambiguation,
            redirect: to => {
              console.log("redirecting from diamb page")
              return { name: 'search', params: { target_label: to.params.target_label } }
          }
        }
        ]
      },
      // City Not Found: Informs the user if the inputted value does not match any city
      {
        path: 'city-not-found/:target_label',
        name: 'city-not-found',
        component: City_Not_Found,
        children: [
          // Redirects back to the Seach route if the not found page was access via direct link
          {
            path: '',
            name: "not-found-to-search",
            component: City_Not_Found,
            redirect: to => {
              console.log("redirecting from not found page")
              return { name: 'search', params: { target_label: to.params.target_label } }
          }
        }
        ]
      },
      // Match: Displays which city is closesnt in population to the inputted city
      {
        path: 'match/:target_id/:buddy_id',
        name: 'match',
        component: Buddy_Match,
        children: [
          // Redirects back to the Seach route if the match page was access via direct link
          {
            path: '',
            name: "match-to-search",
            component: Buddy_Match,
            beforeEnter: async (to, from) => {
              console.log("redirecting from buddy match page")
              return { name: 'search', params: { target_label: await id_to_label(to.params.target_id) } }
            }
          }
        ]
      },
      // Other Buddies: Displays the closest 5 cities in population to the inputted city
      {
        path: 'other-buddies/:target_id',
        name: 'other-buddies',
        component: Other_Buddies,
        children: [
          // Redirects back to the Seach route if the other buddies page was access via direct link
          {
            path: '',
            name: "other-buddies-to-search",
            component: Other_Buddies,
            beforeEnter: async (to, from) => {
              console.log("redirecting from other buddies page")
              return { name: 'search', params: { target_label: await id_to_label(to.params.target_id) } }
            }
        }
        ]
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

export default router
