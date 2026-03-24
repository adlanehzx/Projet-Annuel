# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN npm install --frozen-lockfile

COPY . .

RUN npx prisma generate

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY .env.docker .env
COPY package.json .

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
