import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-07',
  srcDir: 'src/',
  ssr: false,
  devtools: {
    enabled: true,
  },
  experimental: {
    payloadExtraction: 'client',
  },
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      htmlAttrs: {
        lang: 'pt-BR',
      },
      title: 'Kana Quiz',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'description',
          content: 'Treine hiragana e katakana com foco em velocidade e memória.',
        },
      ],
    },
  },
})
