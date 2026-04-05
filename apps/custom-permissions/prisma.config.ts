import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  migrations: {
    directory: 'prisma/migrations',
  },
  studio: {
    port: 5556,
  },
});