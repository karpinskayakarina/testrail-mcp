FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY index.js ./
COPY src/ ./src/

USER appuser

EXPOSE 3000

CMD ["node", "index.js"]
