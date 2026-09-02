# Backend regression suite

The suite uses the built-in Node.js test runner and runs database test files
sequentially. It never resets or migrates the development database.

## Database safety

Set `TEST_DATABASE_URL` to a dedicated PostgreSQL database or schema whose name
contains the standalone marker `test`. It must differ from `DATABASE_URL`.
`TEST_DIRECT_URL` is optional and defaults to `TEST_DATABASE_URL`.

Prepare a new test database explicitly:

```powershell
npm run test:db:prepare
```

This command only runs `prisma migrate deploy` after validating the test URL.
It does not run `migrate reset` or alter the development database.

Run the complete backend regression:

```powershell
npm test
```

Fixtures use generated identifiers and clean only records created by the test.
CI provides an ephemeral PostgreSQL service and test-only credentials.