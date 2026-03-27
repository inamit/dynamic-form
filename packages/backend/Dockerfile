FROM node:18-alpine AS builder

WORKDIR /app

# Copy the monorepo package details
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/
# Exclude other packages that are not needed to build the backend

# Install dependencies (only what's strictly necessary if we could, but NPM workspaces might need the whole lockfile)
RUN npm install --workspace=backend

COPY packages/backend/ ./packages/backend/

# Build step if required, backend is running via tsx, so we can just use source.
# If we were compiling tsc we'd do it here.

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app /app

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace=backend"]
