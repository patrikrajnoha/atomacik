<template>
  <svg class="atomacik-logo" viewBox="0 0 72 72" role="img" aria-label="Logo Atómáčik">
    <defs>
      <linearGradient id="atomacik-drop" x1="22" y1="16" x2="48" y2="56" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7ce6ff" />
        <stop offset="1" stop-color="#2f80ed" />
      </linearGradient>
      <filter id="atomacik-shadow" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.2" flood-color="#154c70" flood-opacity=".24" />
      </filter>
    </defs>

    <g class="logo-orbits" fill="none" stroke="#1858a8" stroke-width="2.7">
      <ellipse cx="36" cy="36" rx="29" ry="12" />
      <ellipse cx="36" cy="36" rx="29" ry="12" transform="rotate(60 36 36)" />
      <ellipse cx="36" cy="36" rx="29" ry="12" transform="rotate(120 36 36)" />
    </g>

    <g class="logo-electrons">
      <circle cx="64" cy="36" r="4.2" fill="#ffd166" stroke="#fff" stroke-width="2" />
      <circle cx="20" cy="12" r="4.2" fill="#55d6aa" stroke="#fff" stroke-width="2" />
      <circle cx="19" cy="59" r="4.2" fill="#ff806e" stroke="#fff" stroke-width="2" />
    </g>

    <g class="logo-drop" filter="url(#atomacik-shadow)">
      <path d="M36 15C27 27 22 34 22 43a14 14 0 0 0 28 0c0-9-5-16-14-28Z" fill="url(#atomacik-drop)" stroke="#fff" stroke-width="2.5" />
      <circle cx="31.2" cy="41" r="2.1" fill="#15324d" />
      <circle cx="40.8" cy="41" r="2.1" fill="#15324d" />
      <path d="M31.5 47.2c2.7 2.6 6.3 2.6 9 0" fill="none" stroke="#15324d" stroke-width="2.2" stroke-linecap="round" />
      <path d="M29 31c2-4 4.5-7.5 7-11" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="3" stroke-linecap="round" />
    </g>
  </svg>
</template>
