# AAA demo data seed (development/staging only)

The backend's `npm run seed` command creates **fictional demo data** to exercise the application UI, pagination, location/category filters, customer accounts, and business logins. It is deliberately **not** a source of real business listings or customer testimonials.

## Default dataset

- **15** service categories (all values allowed by `Business.businessType`). Existing categories are left unchanged.
- **240** fictional shops (retail/food/beauty/repair/etc.), each with a registered `User` owner.
- **600** fictional service providers, each with a registered `User` owner.
- **1,500** fictional customer/consumer `User` accounts.
- **840** business listings and **3,360** embedded `Business.services` price offerings.
- **12** Pakistan cities, with area names and invented addresses, `PKR` pricing, dummy +000 phone numbers, and reserved `example.com` contact emails.

Every seeded listing starts with `[DEMO SHOP]` or `[DEMO PROVIDER]` and has `verification.isVerified: false`; no reviews or real contact information are fabricated. Accounts are marked `AAA_DEMO_SEED_V2`. The `ServiceProvider` schema is a legacy/unreferenced model; the active API represents providers through `User.userType = "business"` plus their `Business` document.

## Run from PowerShell

First, remove the previously identified malware and rotate any leaked Atlas secrets. Keep the original archive and infected Git history out of public repositories.

1. In `Back-End/server/.env`, set `MONGO_URI` (not `MONGODB_URI`) to a **non-production** database. The URL must explicitly contain its name, e.g. `mongodb+srv://USER:PASS@HOST/aaa_services_demo?retryWrites=true&w=majority`. The database name after `/` is mandatory: without it MongoDB commonly selects `test`.
2. Set `NODE_ENV=development` and verify the Atlas project, database name, and user permissions. The seeder will not run under `NODE_ENV=production` or `RENDER`.
3. In PowerShell, run:

```powershell
cd "C:\Users\ak821\Desktop\AAA\Back-End\server"
npm run seed
```

This is **dry-run only** and performs no database writes.

4. Set a private, strong temporary password for all demo users (minimum 16 characters) using Windows PowerShell and Node's cryptographic RNG:

```powershell
$env:SEED_PASSWORD = node -e "process.stdout.write(require('crypto').randomBytes(24).toString('base64url'))"
```

Keep this value secret if you want to log in as the seeded users; the tool never prints it. With a **remote Atlas database**, explicitly confirm the target:

```powershell
npm run seed -- --write --db aaa_services_demo --allow-remote
```

For a **local MongoDB** URL (`mongodb://localhost:27017/aaa_services_demo`), omit `--allow-remote`.

Optional sizes (maximum 5,000 of each):

```powershell
npm run seed -- --write --db aaa_services_demo --allow-remote --shops 300 --providers 800 --consumers 2000
```

### Using an existing Atlas database named `test`

If Atlas **Browse Collections** confirms that `test` is your *existing AAA application database*, you can seed it without creating a second database. Back it up first; don't seed a database with genuine customers or businesses.

Set `MONGO_URI` in `Back-End/server/.env` to the same Atlas host and credentials you already use, but explicitly include `/test` in the connection-string path (before any `?` options). For example:

```text
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@HOST/test?retryWrites=true&w=majority
```

The database name `test` is otherwise treated as risky because it is MongoDB's common implicit default. To write to that existing database, you must supply *all* explicit confirmation flags:

```powershell
npm run seed -- --write --db test --allow-remote --confirm-test-db
```

The extra flag is necessary **only** for the database literally named `test`. The seeder still blocks production/Render and MongoDB's reserved `admin`, `local`, and `config` databases, and still refuses a mismatch between `MONGO_URI` and `--db`.

The `--db` value **must exactly match the database named in MONGO_URI**. The API must use that same URI to see the seeded data. A Render deployment needs the same explicit database name in its `MONGO_URI` environment variable, but **do not run this seeder on Render/production**.

## Safe reruns and limitations

- **Insert-only**: same generated email/username and seeded tags identify users; same seeded owner/name identifies businesses. Re-running the same counts won't multiply records.
- Existing non-demo users, listings, and categories are **not overwritten or deleted**. On conflicts, the seed aborts rather than claiming a real account. Increasing counts adds records; decreasing counts does not remove earlier ones.
- A partially interrupted run can be restarted with the same options. Do not change `SEED_PASSWORD` between interrupted runs if you need all generated accounts to share a known password; existing hashes are never reset.
- Individual generated contacts and addresses are synthetic and should not be used for outreach, real bookings, or production sales.
- **Never publish this demo database as a trustworthy directory of real providers.** Remove or segregate synthetic listings and users before opening the site to real customers. Business verification was not performed.
- Never commit `.env`, database exports, seed passwords, or real user data to GitHub. In particular, rotate the Atlas user password previously visible in your screenshot before deployment.
