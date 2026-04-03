# dynamic-form
## Using Nx

This monorepo has been migrated to use Nx as its task runner and build system. It uses a **Single Version Policy** (all dependencies are centralized in the root `package.json`).

### Running tasks

You can run individual tasks for an application using the following commands:
- Start development server: `npx nx run <app-name>:dev` or `npx nx dev <app-name>` (if supported by plugin)
- Build an application: `npx nx run <app-name>:build` or `npx nx build <app-name>`
- Test an application: `npx nx run <app-name>:test` or `npx nx test <app-name>`
- Start backend / mock api: `npx nx run <app-name>:start`

Example: `npx nx build management-client`

### Running tasks for multiple projects

You can run a task across all applications in the monorepo:
- `npx nx run-many --target=build --all`
- `npx nx run-many --target=lint --all`

### Adding a new package

To add a new application or library:
1. Create a directory under `apps/` or `libs/`.
2. Add a `project.json` in the root of the new directory with the desired targets (`build`, `dev`, etc.).
3. If it's a library, add a path mapping in `tsconfig.base.json` under `compilerOptions.paths`.
