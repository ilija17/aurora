// https://nuxt.com/docs/api/configuration/nuxt-config
import { publicRoutes } from './utils/publicRoutes'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  vite: {
    resolve: {
      alias: {
        cookie: 'cookie/index.js'
      }
    }
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,

    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: publicRoutes,
    }
  },
})
