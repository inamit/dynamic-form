FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json nx.json ./

# Copy the workspace structure needed for install
COPY apps/microfrontends/backend/package.json ./apps/microfrontends/backend/
COPY apps/microfrontends/backend/prisma/ ./apps/microfrontends/backend/prisma/

# Install dependencies
RUN npm ci

# Copy the actual source code
COPY apps/microfrontends/backend/ ./apps/microfrontends/backend/

WORKDIR /app/apps/microfrontends/backend
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=build /app/apps/microfrontends/backend/package.json ./apps/microfrontends/backend/
RUN npm ci --omit=dev

COPY --from=build /app/apps/microfrontends/backend/dist ./apps/microfrontends/backend/dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app/apps/microfrontends/backend
CMD ["npm", "start"]
