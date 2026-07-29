FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

RUN npm install -g npm@11.6.2

COPY backend/package.json backend/package-lock.json* backend/pnpm-lock.yaml* backend/yarn.lock* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY backend/ .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY .env.docker .env
COPY backend/package.json .

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
