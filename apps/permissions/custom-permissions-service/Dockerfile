FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json nx.json ./

# Copy the workspace structure needed for install
COPY apps/permissions/custom-permissions-service/package.json ./apps/permissions/custom-permissions-service/
COPY apps/permissions/custom-permissions-service/prisma/ ./apps/permissions/custom-permissions-service/prisma/
COPY libs/ ./libs/

# Install dependencies
RUN npm ci

# Copy the actual source code
COPY apps/permissions/custom-permissions-service/ ./apps/permissions/custom-permissions-service/

WORKDIR /app/apps/permissions/custom-permissions-service
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=build /app/apps/permissions/custom-permissions-service/package.json ./apps/permissions/custom-permissions-service/
COPY libs/ ./libs/
RUN npm ci --omit=dev

COPY --from=build /app/apps/permissions/custom-permissions-service/dist ./apps/permissions/custom-permissions-service/dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app/apps/permissions/custom-permissions-service
CMD ["npm", "start"]
