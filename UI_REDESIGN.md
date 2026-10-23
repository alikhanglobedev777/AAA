# AAA interface refresh

The UI refresh is frontend-only. It does not change Atlas data, roles, API paths, or backend behavior.

## Included

- A shared design system (`Front End/src/styles/design-system.css`): forest/emerald palette, typography, surfaces, contrast, inputs, buttons, focus states, and reduced-motion support.
- Responsive navigation, homepage, category discovery, and sign-in pages.
- Rebuilt directory cards and filter controls with accessible labels, skeleton loading, empty/error states, and pagination.
- Cohesive admin, provider, and consumer dashboards.
- Home copy now avoids sample testimonials, fictitious satisfaction metrics, and blanket verification promises.
- Admin sign-in adds visible password control and an easy route back to the public site.

## QA checklist

From `Front End`, run `npm ci && npm run build`. Then `npm run dev` and check:

- `/home` at desktop (1440px) and mobile (390px)
- `/businesses` with search, city, category and pagination
- `/service-categories` and `/services`
- `/login`, `/signup`, `/service-provider-signup`
- `/admin` and authenticated `/admin/dashboard` (overview, providers, verification, users)
- `/business/dashboard` and `/customer-dashboard` with appropriate accounts
- Keyboard Tab navigation, skip link, and browser back/forward

The directory still marks fictional seeded listings as demo. A working backend and valid account credentials are required for data-dependent screens.
