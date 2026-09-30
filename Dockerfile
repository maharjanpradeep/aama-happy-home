# Railway deploy for the frontend. Hostinger still deploys via GitHub Actions
# (FTP); this file only matters to Railway.

FROM node:20-bookworm-slim AS build
# System libraries for the Chromium that react-snap (postbuild prerender) bundles.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
      libcups2 libdrm2 libgbm1 libgtk-3-0 libnss3 libx11-xcb1 libxcomposite1 \
      libxdamage1 libxrandr2 libxss1 libxshmfence1 libxtst6 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite bakes these in at build time; Railway passes service variables as build args.
ARG VITE_CHECKIN_API_URL
ARG VITE_GA_MEASUREMENT_ID
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
