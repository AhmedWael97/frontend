FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Force cache-bust: copy package.json first so src changes always invalidate the build layer
COPY package.json ./
COPY . .

# Build-time env vars (NEXT_PUBLIC_* are baked into the JS bundle at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_VERSION=v1
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_PUBLIC_KEY
ARG NEXT_PUBLIC_APP_SECRET_KEY
ARG NEXT_PUBLIC_REVERB_APP_KEY
ARG NEXT_PUBLIC_REVERB_HOST
ARG NEXT_PUBLIC_REVERB_PORT
ARG NEXT_PUBLIC_REVERB_SCHEME

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_API_VERSION=$NEXT_PUBLIC_API_VERSION \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_APP_PUBLIC_KEY=$NEXT_PUBLIC_APP_PUBLIC_KEY \
    NEXT_PUBLIC_APP_SECRET_KEY=$NEXT_PUBLIC_APP_SECRET_KEY \
    NEXT_PUBLIC_REVERB_APP_KEY=$NEXT_PUBLIC_REVERB_APP_KEY \
    NEXT_PUBLIC_REVERB_HOST=$NEXT_PUBLIC_REVERB_HOST \
    NEXT_PUBLIC_REVERB_PORT=$NEXT_PUBLIC_REVERB_PORT \
    NEXT_PUBLIC_REVERB_SCHEME=$NEXT_PUBLIC_REVERB_SCHEME \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build -- --no-lint

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
