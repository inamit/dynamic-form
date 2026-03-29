FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# Backend is run from source, no build step required, but we copy everything.

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app /app
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npx", "nx", "start", "backend"]
