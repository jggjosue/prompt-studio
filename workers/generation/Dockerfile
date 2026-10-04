FROM node:22.13.0-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22.13.0-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# .dockerignore keeps .env*, .git and local node_modules out of the image.
# Secrets arrive at runtime from Secret Manager, never baked in.
USER node
EXPOSE 8080
CMD ["node","--import","tsx","workers/generation/server.ts"]
