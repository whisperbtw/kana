<template>
  <NuxtPage />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Noto+Sans+JP:wght@400;700&family=JetBrains+Mono:wght@500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #f3f4f6;
  --bg-2: #e7eaf0;
  --card: rgba(255, 255, 255, 0.82);
  --text: #1f2937;
  --muted: #6b7280;
  --primary: #4b5563;
  --secondary: #7b8794;
  --success: #3f7a5e;
  --error: #9a4d57;
  --border: rgba(75, 85, 99, 0.2);
  --shadow: rgba(17, 24, 39, 0.12);
  --focus: rgba(75, 85, 99, 0.2);
  --tile: rgba(255, 255, 255, 0.8);
}

body.dark {
  --bg: #111317;
  --bg-2: #1b2027;
  --card: rgba(31, 36, 44, 0.8);
  --text: #e5e7eb;
  --muted: #9ca3af;
  --primary: #9aa4b2;
  --secondary: #7f8b9a;
  --success: #5f9f83;
  --error: #c07d88;
  --border: rgba(229, 231, 235, 0.18);
  --shadow: rgba(0, 0, 0, 0.34);
  --focus: rgba(154, 164, 178, 0.24);
  --tile: rgba(40, 46, 55, 0.75);
}

html,
body,
#__nuxt {
  min-height: 100%;
}

body {
  font-family: 'Sora', sans-serif;
  color: var(--text);
  min-height: 100vh;
  padding: 24px 16px 40px;
  background:
    radial-gradient(1100px 380px at -5% -10%, rgba(123, 135, 148, 0.16), transparent 60%),
    radial-gradient(780px 340px at 98% 10%, rgba(75, 85, 99, 0.14), transparent 62%),
    linear-gradient(158deg, var(--bg), var(--bg-2));
  transition:
    background 0.35s ease,
    color 0.35s ease;
  position: relative;
  overflow-x: hidden;
}

button,
select,
input {
  font: inherit;
}

button {
  border: none;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.88);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shimmer {
  from {
    transform: translateX(-120%);
  }

  to {
    transform: translateX(130%);
  }
}

@keyframes correctPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  75% {
    transform: translateX(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@media (max-width: 760px) {
  body {
    padding-top: 76px;
  }
}
</style>
