Run a full QA check on the KOLLAB project. Perform the following steps:

1. **Type Check**: Run `npx tsc --noEmit` and report any TypeScript errors.

2. **Lint**: Run `npx next lint` and report any linting issues.

3. **Build Test**: Run `npm run build` and verify it compiles without errors.

4. **API Endpoint Check**: Verify all API routes exist and have proper exports:
   - `GET /api/profiles` — list/filter profiles
   - `POST /api/profiles` — create profile
   - `GET /api/profiles/[id]` — get single profile

5. **Database Check**: Verify the Prisma schema matches the SQLite table structure and that the db module initializes correctly.

6. **Missing Files Audit**: Check for any imports that reference files that don't exist (broken imports).

7. **Component Check**: Verify all components render without obvious issues (check for missing imports, undefined variables).

8. **Security Quick Scan**: Check for:
   - SQL injection risks (parameterized queries?)
   - Exposed secrets in committed files
   - Missing input validation

Report a summary with:
- Total issues found (critical / warning / info)
- List of each issue with file path and line number
- Suggested fixes for critical issues
