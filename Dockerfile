# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts          # installs *all* deps
COPY . .
RUN npm run build                    # creates .output/

# ---------- Run stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# ① copy deps that were installed in the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.output ./.output

# ② drop privileges *after* files are in place
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
