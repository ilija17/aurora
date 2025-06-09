import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/color-mode', '@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],

  supabase: {
    redirect: false,
    types: '~/types/database.types.ts'
  },

  colorMode: {
    classSuffix: '',
    dataValue: 'theme',
    preference: 'dark',
    fallback: 'dark',
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
    ],

    server: {
      allowedHosts: ['https://aurora.ilijabosnjak.com']
    }
  },

  runtimeConfig: {
    //ne očekivano al ovo je za spotify
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI,

    openaiApiKey: process.env.OPENAI_API_KEY,

    public: {
      supabaseUrl: process.env.SUPABASE_URL!,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,

      spotifyClientId: process.env.SPOTIFY_CLIENT_ID

    },
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
})
