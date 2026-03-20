const { PGlite } = require("@electric-sql/pglite");

async function seed() {
  const db = new PGlite("./packages/backend/pglite-db");
  await db.waitReady;

  await db.exec(`
    INSERT INTO public."DataSource" (name, "apiUrl", "apiType") VALUES
    ('personAPI', 'http://localhost:3002/api', 'REST')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO public."EntityConfig" (name, "dataSourceId")
    SELECT 'person', id FROM public."DataSource" WHERE name = 'personAPI'
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO public."Field" (name, type, label, "entityConfigId")
    SELECT 'firstName', 'text', 'First Name', id FROM public."EntityConfig" WHERE name = 'person'
    ON CONFLICT ("entityConfigId", name) DO NOTHING;

    INSERT INTO public."Field" (name, type, label, "entityConfigId")
    SELECT 'lastName', 'text', 'Last Name', id FROM public."EntityConfig" WHERE name = 'person'
    ON CONFLICT ("entityConfigId", name) DO NOTHING;
  `);

  console.log("Database seeded");
  process.exit(0);
}
seed();
