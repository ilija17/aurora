# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Encryption Overview

This app encrypts all user content in the browser before it is sent to the server.

- A **content encryption key (DEK)** is generated using `AES-GCM` and is only
  kept in memory during the session.
- The DEK is wrapped with a key derived from the user's password using the
  memory-hard `scrypt` algorithm. Both the key encryption key (KEK) and DEK are
  stored in an in-memory keystore, while the salt is cached in `sessionStorage`.
- Base64 helpers rely on the `js-base64` library to work in both Node and browser
  contexts without polyfills.
- Only the ciphertext, IV and salt are stored remotely, ensuring the server never
  sees plaintext or keys.

