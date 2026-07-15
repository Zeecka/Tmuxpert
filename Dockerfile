# syntax=docker/dockerfile:1

# --- Stage 1: build the static bundle --------------------------------------
# Tmuxpert is a pure static SPA (no backend), so we compile it once here and
# copy the resulting dist/ into a tiny nginx image below.
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

# Build (tsc -b && vite build -> ./dist).
COPY . .
RUN npm run build

# --- Stage 2: serve the bundle ---------------------------------------------
# The final image contains only nginx + the static files - nothing from the
# build toolchain - so it is small and self-contained.
FROM nginx:1.27-alpine AS runtime

# SPA-aware config (fallback to index.html, long-lived asset caching, gzip).
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine already runs `nginx -g "daemon off;"` as its CMD.
