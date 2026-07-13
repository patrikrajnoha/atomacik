import { createRouter, createWebHistory } from 'vue-router'

export const screenPaths = {
  home: '/',
  employee: '/nastup',
  interview: '/uvodny-kviz',
  location: '/lokalita',
  briefing: '/instrukcie',
  how: '/ako-to-funguje',
  map: '/misia',
  sample: '/odber',
  lab: '/laboratorium',
  spectrometer: '/spektrometer',
  results: '/vysledky',
  conclusion: '/zaver',
  glossary: '/slovnik',
  profile: '/profil',
  playlist: '/playlist',
}

const routes = Object.entries(screenPaths).map(([screen, path]) => ({
  path,
  name: screen,
  component: { template: '<span />' },
  meta: { screen },
}))

routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
