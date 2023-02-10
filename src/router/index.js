// Vue imports.
import { createRouter, createWebHistory } from 'vue-router'

// Import views and components.
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/404View.vue'
import AboutView from '../views/AboutView.vue'
import Disambiguation from '../components/Disambiguation.vue'
import BuddyMatch from '../components/BuddyMatch.vue'
import CityNotFound from '../components/CityNotFound.vue'
import OtherBuddies from '../components/OtherBuddies.vue'
import Search from '../components/Search.vue'
import MatchRedirect from '../components/redirects/MatchRedirect.vue'
import OtherBuddiesRedirect from '../components/redirects/OtherBuddiesRedirect.vue'

// Import composables.
import { useIdToLabel } from '../composables/useIdToLabel.js'

// Extract functions from composables.
let { idToLabel } = useIdToLabel()

// Define routes.
const routes = [
    // Home View: The main landing page for the user.
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            title: 'Home'
        },
        children: [
            // Search: Where the user is directed after submitting an input. Searches for cities that match the user's input.
            {
                path: 'search/:targetLabel',
                name: 'search',
                component: Search
            },
            // Disambiguation: When there are multiple cities with the inputted name, allow the user to choose which city they want.
            {
                path: 'disambiguation/:targetLabel',
                name: 'disambiguation',
                component: Disambiguation,
                children: [
                    // Redirects back to the Seach route if the disambiguation page was access via direct link
                    {
                        path: '',
                        name: 'disambiguation-redirect',
                        component: Disambiguation,
                        redirect: to => {
                            return { name: 'search', params: { targetLabel: to.params.targetLabel } }
                        }
                    }
                ]
            },
            // City Not Found: Informs the user if the inputted value does not match any city
            {
                path: 'city-not-found/:targetLabel',
                name: 'city-not-found',
                component: CityNotFound,
                children: [
                    // Redirects back to the Seach route if the not found page was access via direct link
                    {
                        path: '',
                        name: 'not-found-redirect',
                        component: CityNotFound,
                        redirect: to => {
                            return { name: 'search', params: { targetLabel: to.params.targetLabel } }
                        }
                    }
                ]
            },
            // Match: Displays which city is closesnt in population to the inputted city.
            {
                path: 'match/:targetId/:buddyId',
                name: 'match',
                component: BuddyMatch,
                children: [
                    // Recalculates the city buddy if the match page was access via direct link.
                    {
                        path: '',
                        name: 'match-child',
                        component: BuddyMatch,
                        redirect: to => {
                            return { name: 'match-redirect', params: { targetId: to.params.targetId } }
                        }
                    }
                ]
            },
            // Other Buddies: Displays the closest 5 cities in population to the inputted city.
            {
                path: 'other-buddies/:targetId',
                name: 'other-buddies',
                component: OtherBuddies,
                children: [
                    // Recalculates the other buddies if the other buddies page was access via direct link.
                    {
                        path: '',
                        name: 'other-buddies-child',
                        component: OtherBuddies,
                        redirect: to => {
                            return { name: 'other-buddies-redirect', params: { targetId: to.params.targetId } }
                        }
                    }
                ]
            }, 
            // Match Redirect: Ensures that the target ID is a valid city and has the correct buddy before showing the Match screen.
            // Used when Match is accessed using a direct link.
            {
                path: 'match-redirect/:targetId',
                name: 'match-redirect',
                component: MatchRedirect,
            },
            // Other Buddies Redirect: Ensures that the target ID is a valid city before showing the Other Buddies screen.
            // Used when Other Buddies is accessed using a direct link.
            {
                path: 'other-buddies-redirect/:targetId',
                name: 'other-buddies-redirect',
                component: OtherBuddiesRedirect,
            }
        ]
    },
    // About: Describes what the website is, how to use it, and very generally how it works.
    {
        path: '/about',
        name: 'about',
        component: AboutView,
        meta: {
            title: 'About'
        },
    },
    // 404: Landing page for any other routes.
    {
        path: '/:catchAll(.*)*',
        name: '404',
        component: NotFoundView,
        meta: {
            title: '404'
        }
    }
]

// Define router.
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// Determine the title for the routes.
router.beforeEach(async (to, from, next) => {
    let title = ''

    if (to.params.targetLabel) {
        title = to.params.targetLabel
    }
    else if (to.params.targetId) {
        title = await idToLabel(to.params.targetId)
    }
    else {
        title = to.meta.title
    }

    document.title = `${title} | City Buddies`
    next()
})

export default router