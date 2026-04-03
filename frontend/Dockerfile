# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN npm install --frozen-lockfile

COPY . .

# Copier la configuration .env pour Docker
COPY .env.docker .env

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env .env
COPY package.json .

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
