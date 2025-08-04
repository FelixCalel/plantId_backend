FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

FROM deps AS builder

WORKDIR /app

COPY tsconfig*.json ./
COPY src ./src
COPY public ./public

RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

COPY --from=deps /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=deps /app/node_modules/.prisma       ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "dist/app.js"]
