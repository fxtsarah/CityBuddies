import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/404View.vue'
import AboutView from '../views/AboutView.vue'
import Disambiguation from '../components/Disambiguation.vue'
import Buddy_Match from '../components/Buddy_Match.vue'

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
        component: Disambiguation
      },
      {
        path: 'match/:target_id',
        component: Buddy_Match
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
