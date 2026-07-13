<template>
  <div class="boss-portrait" role="img" aria-label="Šéf, vedúci misie">
    <svg viewBox="0 0 112 112" aria-hidden="true">
      <defs>
        <linearGradient id="boss-jacket" x1="30" y1="65" x2="83" y2="108" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1e6388" />
          <stop offset="1" stop-color="#15324d" />
        </linearGradient>
        <linearGradient id="boss-bg" x1="16" y1="10" x2="96" y2="105" gradientUnits="userSpaceOnUse">
          <stop stop-color="#dff7ff" />
          <stop offset="1" stop-color="#bcead9" />
        </linearGradient>
      </defs>
      <circle cx="56" cy="56" r="53" fill="url(#boss-bg)" />
      <path d="M18 110c3-27 18-42 38-42s35 15 38 42Z" fill="url(#boss-jacket)" />
      <path d="M42 68l14 15 14-15-4-8H46Z" fill="#fff" />
      <path d="M52 79h8l4 29H48Z" fill="#31b892" />
      <path d="M36 42c0-19 9-29 21-29s22 10 22 29v8c0 17-10 28-22 28S36 67 36 50Z" fill="#ffd5b5" />
      <path d="M34 42c0-21 9-34 24-34 13 0 23 10 24 28-9-7-26-11-47 1Z" fill="#17364c" />
      <path d="M35 39c-4 5-3 15 2 18M79 39c4 5 3 15-2 18" fill="none" stroke="#f2bd98" stroke-width="5" stroke-linecap="round" />
      <circle cx="49" cy="47" r="2.7" fill="#20303f" />
      <circle cx="66" cy="47" r="2.7" fill="#20303f" />
      <path d="M49 60q8 7 16 0" fill="none" stroke="#9e5c4d" stroke-width="2.8" stroke-linecap="round" />
      <path d="M44 41q5-4 10 0M61 41q5-4 10 0" fill="none" stroke="#17364c" stroke-width="2.2" stroke-linecap="round" />
      <rect x="70" y="78" width="18" height="14" rx="3" fill="#fff" stroke="#31b892" stroke-width="2" />
      <path d="M74 83h10M74 87h6" stroke="#2f80ed" stroke-width="1.7" stroke-linecap="round" />
    </svg>
    <span class="boss-online" aria-hidden="true"></span>
  </div>
</template>
