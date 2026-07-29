FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g npm@11.6.2

COPY frontend/package.json frontend/package-lock.json* frontend/pnpm-lock.yaml* frontend/yarn.lock* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY frontend/ .

COPY .env.docker .env

RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env .env
COPY frontend/package.json .

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
