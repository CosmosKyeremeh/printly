<div align="center">
  <h1>🖨️ PrintLy</h1>
  <p><strong>Centralized assignment submission and printing for university classes</strong></p>

  ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
  ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=flat-square&logo=supabase)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
  ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

  <br />

  <p>
    <a href="https://classprint-hub-oh62.vercel.app">Live Demo</a> ·
    <a href="#features">Features</a> ·
    <a href="#tech-stack">Tech Stack</a> ·
    <a href="#getting-started">Getting Started</a> ·
    <a href="#database-schema">Database Schema</a>
  </p>
</div>

---

## The Problem

In many university classes across Ghana, students print assignments individually at the campus printer. This creates:

- Long queues and wasted time
- Confusion for the printing manager handling mixed file types
- No centralized tracking of who submitted what
- Manual cash collection for printing fees
- Missed deadlines due to poor communication

## The Solution

ClassPrint Hub is a web application that centralizes the entire printing workflow. Students upload files once. The admin (class rep or printing manager) sees everything organized, manages a print queue, and collects payments — all from one dashboard.

---

## Features

### For Students

- **File Upload** — Drag and drop multiple files (PDF, DOCX, PPTX, XLSX, ZIP, images up to 50MB)
- **File Conversion** — Convert PDF to DOCX or DOCX to PDF directly in the browser
- **File Management** — View, download, and delete uploaded files with real-time status tracking
- **Payments** — View payment status and history for printing fees
- **Notifications** — Receive announcements and deadline reminders from admin
- **Profile** — Update name and password at any time

### For Admins

- **Print Queue** — Live queue with bulk select, mark as printing, done, or cancelled
- **Categories** — Create assignment categories with optional deadlines
- **Notifications** — Send announcements to all students by type (deadline, general, payment, etc.)
- **Payments Overview** — Track collected fees and files awaiting payment
- **Submissions Table** — See all student submissions with status at a glance

### Platform

- Role-based access — students and admins see completely different interfaces
- Mobile-first responsive design
- Row Level Security — students can only access their own files at the database level
- Automatic profile creation on signup via database trigger

---

## Tech Stack

| Layer | Technology | Purpose |
| ------- | ----------- | --------- |
| Frontend | Next.js 16 (App Router) | Server components, routing, API routes |
| Language | TypeScript | Type safety across the entire codebase |
| Styling | Tailwind CSS v4 + shadcn/ui | Design system and accessible components |
| Database | Supabase (Postgres) | Relational data with Row Level Security |
| Auth | Supabase Auth | Email/password with role-based routing |
| Storage | Supabase Storage | Per-user private file buckets |
| File Conversion | ConvertAPI | PDF ↔ DOCX server-side conversion |
| Payments | Stripe + Hubtel (MoMo) | International and Ghana mobile money |
| Email | Resend | Transactional notifications |
| Deployment | Vercel | CI/CD with preview deployments |

---

## Getting Started

### Prerequisites

- Node.js v20+
- npm v9+
- Git
- Supabase account
- Vercel account (for deployment)

### Local Development

**1. Clone the repository**

```bash
git clone https://github.com/CosmosKyeremeh/classprint-hub.git
cd classprint-hub
git checkout develop
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_SIGNUP_CODE=your_admin_code
CONVERT_API_SECRET=your_convertapi_secret
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
HUBTEL_CLIENT_ID=your_hubtel_client_id
HUBTEL_CLIENT_SECRET=your_hubtel_client_secret
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**4. Set up Supabase**

```bash
# Install Supabase CLI (via Scoop on Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Login and link project
supabase login
supabase link --project-ref your_project_ref

# Push migrations
supabase db push
```

**5. Set up storage**

In your Supabase dashboard, create a private bucket named `assignments` then run the storage policies from `supabase/migrations/` in the SQL editor.

**6. Generate TypeScript types**

```bash
supabase gen types typescript --project-id your_project_ref > src/types/supabase.types.ts
```

**7. Start development server**

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Database Schema

```text
profiles          → Extends auth.users with role (student | admin)
categories        → Admin-defined assignment categories with optional deadlines
files             → Uploaded files with metadata, status, and payment status
print_queue       → Queue entries linked to files with print status tracking
payments          → Payment records supporting Stripe and MoMo providers
notifications     → Admin-sent announcements visible to all students
```

All tables have Row Level Security enabled. Students can only read and write their own data. Admins have full read access across all tables.

---

## Project Structure

```text
src/
├── app/
│   ├── (auth)/           # Login and signup pages
│   ├── (student)/        # Student dashboard, upload, files, payments, profile
│   ├── (admin)/admin/    # Admin dashboard, queue, categories, notifications, payments
│   └── api/              # API routes (files, payments, notifications, queue)
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── shared/           # Navbar, StatusBadge, ProfileForm, EmptyState
│   ├── student/          # UploadZone, FileList, ConvertButton
│   └── admin/            # PrintQueue, CategoryManager, NotificationForm
├── lib/
│   ├── supabase/         # Browser and server clients
│   ├── payments/         # Stripe and MoMo provider abstraction
│   ├── conversion/       # ConvertAPI wrapper
│   ├── storage/          # File upload and signed URL helpers
│   ├── notifications/    # Resend email wrapper
│   └── validations/      # Zod schemas
├── hooks/                # useFiles, useQueue, usePayment
├── types/                # Supabase generated types + custom types
└── config/               # Constants and site config
supabase/
└── migrations/           # 4 versioned SQL migration files
```

---

## Git Flow

This project follows a strict Git flow:

```text
main          ← production releases only
develop       ← integration branch (default)
feature/*     ← individual features branched from develop
release/*     ← release preparation
hotfix/*      ← emergency production fixes
```

**Branch naming:**

```bash
feature/42-upload-zone
fix/38-admin-redirect
chore/update-deps
```

**Commit conventions:**

```bash
feat(files): add drag-drop upload zone
fix(auth): admin redirect after login
chore: bump version to 0.2.0
docs: update README with deployment steps
```

---

## Deployment

The app is deployed on Vercel with automatic deployments on push to `main`.

**Required environment variables on Vercel:**

- All variables from `.env.example` with production values
- `NEXT_PUBLIC_APP_URL` should be your Vercel deployment URL

**To deploy a new release:**

```bash
git checkout develop
git checkout -b release/vX.X.X
npm version minor --no-git-tag-version
git add package.json
git commit -m "chore: bump version to X.X.X"
git checkout main
git merge release/vX.X.X --no-ff
git tag -a vX.X.X -m "Release vX.X.X"
git push origin main --tags
git checkout develop
git merge main --no-ff
git push origin develop
```

---

## Roadmap

### v0.2 — Payments

- [ ] Stripe checkout integration
- [ ] Hubtel MoMo payment flow
- [ ] Payment webhooks and auto-status updates
- [ ] Receipt generation

### v0.3 — Notifications

- [ ] Email delivery via Resend
- [ ] 24-hour deadline reminders (cron job)
- [ ] In-app notification bell with unread count

### v0.4 — Polish

- [ ] File preview (PDF viewer)
- [ ] Bulk download as ZIP for admin
- [ ] Submission analytics dashboard
- [ ] SMS receipts via Hubtel

### Future

- Multi-school support
- Direct printer hardware integration
- Mobile app (React Native)

---

## Contributing

1. Fork the repository
2. Create a feature branch from `develop`: `git checkout -b feature/your-feature`
3. Commit with conventional commits: `feat(area): description`
4. Push and open a PR targeting `develop`
5. Ensure CI passes before requesting review

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for full guidelines.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ </p>
  <p>by <a href="https://github.com/CosmosKyeremeh">BonGr8</a></p>
</div>
