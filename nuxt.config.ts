import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/color-mode', '@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],

  supabase: {
    redirect: false
  },

  colorMode: {
    classSuffix: '',
    dataValue: 'theme',
    preference: 'system',
    fallback: 'light',
  },

  nitro: {
    externals: {
      external: ['cookie'],
    },
  },

  vite: {
    optimizeDeps: {
      exclude: ['@supabase/ssr', 'cookie'],
    },
    plugins: [
      tailwindcss(),
    ]
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL!,
    },
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
})