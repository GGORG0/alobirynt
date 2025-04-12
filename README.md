# ALObirynt

This was a math game made for the open days of the Academic High School of Wrocław University of Science and Technology.

## Running

1. Install Node.js
2. Install the dependencies: `pnpm i`
3. Deploy a SurrealDB instance or use SurrealDB Cloud
4. Create a namespace system user with the owner permission used for applying DB schemas
5. Prepare the `.env`: copy `.env.template` to `.env`, put in your SurrealDB connection info and the system user you've just created
6. Apply the DB schemas: `pnpm applySchemas` (`--clean` to delete the tables before applying)
7. Run the app in dev mode: `pnpm dev`
8. Build the app in production mode: `pnpm build`
9. Run the production-built app: `pnpm start`
10. To log into the admin panel (`/admin`), create a namespace level system user with the desired username and password and the editor permission
