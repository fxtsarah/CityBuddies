// vue imports
import { createRouter, createWebHistory } from 'vue-router'

// import views and components
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/404View.vue'
import AboutView from '../views/AboutView.vue'
import Disambiguation from '../components/Disambiguation.vue'
import Buddy_Match from '../components/Buddy_Match.vue'
import City_Not_Found from '../components/City_Not_Found.vue'
import Other_Buddies from '../components/Other_Buddies.vue'
import Search from '../components/Search.vue'
import Match_Redirect from '../components/redirects/Match_Redirect.vue'
import Other_Buddies_Redirect from '../components/redirects/Other_Buddies_Redirect.vue'

// import composables
import { use_id_to_label } from '../composables/use_id_to_label.js'

// extract functions from composables
let { id_to_label } = use_id_to_label()

// define routes
const routes = [
    // Home View: The main landing page for the user.
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            title: "Home"
        },
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
                        name: "disambiguation-redirect",
                        component: Disambiguation,
                        redirect: to => {
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
                        name: "not-found-redirect",
                        component: City_Not_Found,
                        redirect: to => {
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
                    // Recalculates the city buddy if the match page was access via direct link
                    {
                        path: '',
                        name: "match-child",
                        component: Buddy_Match,
                        redirect: to => {
                            return { name: 'match-redirect', params: { target_id: to.params.target_id } }
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
                    // Recalculates the other buddies if the other buddies page was access via direct link
                    {
                        path: '',
                        name: "other-buddies-child",
                        component: Other_Buddies,
                        redirect: to => {
                            return { name: 'other-buddies-redirect', params: { target_id: to.params.target_id } }
                        }
                    }
                ]
            }, 
            {
                path: 'match-redirect/:target_id',
                name: "match-redirect",
                component: Match_Redirect,
            },
            {
                path: 'other-buddies-redirect/:target_id',
                name: "other-buddies-redirect",
                component: Other_Buddies_Redirect,
            }
        ]
    },
    // About: Describes what the website is, how to use it, and very generally how it works.
    {
        path: '/about',
        name: 'about',
        component: AboutView,
        meta: {
            title: "About"
        },
    },
    // 404: Landing page for any other routes
    {
        path: '/:catchAll(.*)*',
        name: '404',
        component: NotFoundView,
        meta: {
            title: "404"
        }
    }
]

// define router
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// determine the title for the routes
router.beforeEach(async (to, from, next) => {
    let title = ""

    if (to.params.target_label) {
        title = to.params.target_label
    }
    else if (to.params.target_id) {
        title = await id_to_label(to.params.target_id)
    }
    else {
        title = to.meta.title
    }

    document.title = `${title} | CityBuddies`
    next()
})

export default router