# AAA real-data visibility and safe import

The earlier seed added **840 fictional business listings** and **2,340 fictional users** to the `test` Atlas database. They are **not real registered providers** and must not be presented as verified. The public directory and admin dashboard now query the same `Business` collection. Public listing cards visibly label fictional demo records.

## Verify the current database (no writes)

From `Back-End/server`, run `npm run data:report` with a valid local `MONGO_URI` pointing to `/test`. It prints live counts and separates demonstration listings from other records. On the public site, open `/businesses` and `/service-categories`. For admins, open `/admin/dashboard#service-providers` after login. The backend also exposes admin-authenticated `/api/admin/dashboard-stats`.

## Import owner-provided real business records

Only import real business details supplied or authorized by a **genuinely registered**, email-verified business account. The importer does not create fake users, generate real-looking phones, fabricate reviews, or assign verification badges. For any non-registered company you found online, request authorization and account registration first.

Prepare a local `businesses.json` file (do not commit contact details without permission):

```json
[
  {
    "ownerEmail": "owner-of-real-business@example.org",
    "businessName": "Business name supplied by its owner",
    "businessType": "plumbing",
    "description": "A factual business description supplied and approved by the owner.",
    "contact": {
      "phone": "+923001234567",
      "email": "public-business@example.org",
      "website": "https://example.org"
    },
    "location": {
      "address": "Owner-provided real business address",
      "city": "Lahore",
      "area": "Business district"
    },
    "services": [
      { "name": "Service offered", "description": "Owner-provided description", "priceType": "negotiable", "currency": "PKR" }
    ]
  }
]
```

The values above are an **illustrative template**, not real businesses and should never be imported as-is.

Dry run (no MongoDB changes):

```powershell
npm run import:registered -- --file .\businesses.json
```

After confirming the owner has consented, the exact Atlas database is correct, and you have a backup:

```powershell
npm run import:registered -- --file .\businesses.json --write --db test --allow-remote --confirm-test-db --attest-owner-consent
```

Rows matching existing owner/business combinations are skipped; unexpected account collisions stop the run. Newly imported businesses are **active but unverified** and appear in the public directory and admin provider list. Re-run the read-only report afterward.

Use the normal user/business registration pages for new customers and service providers. Genuine customer records should not be fabricated for a public deployment.
