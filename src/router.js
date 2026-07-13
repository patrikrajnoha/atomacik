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

export const screenMetadata = {
  home: {
    title: 'Atómáčik – vedecká výprava za čistou vodou',
    description: 'Hravá edukačná výprava za odberom vody, laboratórnym meraním a vedeckým záverom.',
  },
  employee: { title: 'Nástup do tímu', description: 'Vytvor si profil mladého vedca a priprav sa na výpravu.' },
  interview: { title: 'Úvodný kvíz', description: 'Krátke overenie základov bezpečného odberu a merania vody.' },
  location: { title: 'Výber lokality', description: 'Vyber si pracovnú lokalitu vedeckej výpravy.' },
  briefing: { title: 'Inštrukcie k misii', description: 'Prečítaj si zadanie a priprav sa na terénny odber vzoriek.' },
  how: { title: 'Ako hra funguje', description: 'Pozri si stručný postup vedeckej výpravy Atómáčik.' },
  map: { title: 'Mapa misie', description: 'Nájdi studne a dokonči terénny odber všetkých vzoriek.' },
  sample: { title: 'Odber vzorky', description: 'Splň odberovú minihru a správne označ vzorku vody.' },
  lab: { title: 'Laboratórium', description: 'Priprav odobraté vzorky na laboratórne meranie.' },
  spectrometer: { title: 'Spektrometer', description: 'Analyzuj spektrum vzoriek a rozpoznaj namerané izotopy.' },
  results: { title: 'Výsledky merania', description: 'Porovnaj výsledky všetkých analyzovaných vzoriek.' },
  conclusion: { title: 'Záver misie', description: 'Urob vedecký záver podľa výsledkov merania.' },
  glossary: { title: 'Vedecký slovník', description: 'Precvič si pojmy o atómoch, radiácii, vode a meraní.' },
  profile: { title: 'Profil hráča', description: 'Pozri si svoj postup, úroveň a získané odznaky.' },
  playlist: { title: 'Playlist do práce', description: 'Hudba na sústredenie počas vedeckej misie.' },
}

const routes = Object.entries(screenPaths).map(([screen, path]) => ({
  path,
  name: screen,
  component: { template: '<span />' },
  meta: { screen, ...screenMetadata[screen] },
}))

routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
