# Lil Debbie — Personal Memory Sanctuary & Cloud Vault

A timeless digital keepsake and memory website built for **Lil Debbie**, connected to your existing Supabase project (**`Samuel-kayode's Project`**, ref `jykolicnbfaddbznijtj`) and your existing GitHub repository (**`Samuel-kayode/lil-debbie-website`**).

---

## 1. Architecture Overview

- **Frontend Application (`Samuel-kayode/lil-debbie-website`)**:
  - Built with **React 19 + TypeScript + Vite + Tailwind CSS v4**.
  - Hosted as a static single-page web application (compatible with GitHub Pages, Cloudflare Pages, Vercel, or Netlify Free tiers).
  - Contains **source code only**—strict `.gitignore` rules prevent any personal photos, videos, or audio files from ever being committed or pushed to GitHub.
- **Database (`Samuel-kayode's Project` — Supabase PostgreSQL 17)**:
  - Stores structured site settings, media metadata, milestone chapters, guestbook blessings, and journal letters with Row Level Security (RLS) enabled.
- **Personal Media Storage (`lil-debbie-media` bucket in Supabase Storage)**:
  - All personal photos, videos, and browser-recorded voice notes are uploaded directly from the browser to Supabase Storage (`lil-debbie-media`), bypassing GitHub completely.
  - **Permanent Retention**: Zero lifecycle expiration or automatic deletion rules are configured.

---

## 2. Resources Created in `"Samuel-kayode's Project"` (`jykolicnbfaddbznijtj`)

1. **PostgreSQL Tables (`public` schema)**:
   - `public.site_settings` — Customizable site title, tagline, story, celebration date, hero portrait reference, and color theme (`warm-rose`, `golden-sun`, `lavender-dream`, `sage-garden`).
   - `public.media_items` — Metadata (`title`, `caption`, `category`, `media_type`, `storage_path`, `public_url`, `file_size`, `taken_at`, `location`, `is_favorite`) for photos, videos, and voice notes stored in Supabase Storage.
   - `public.milestones` — Chronological timeline of special moments and chapters.
   - `public.guestbook_entries` — Love notes, wishes, and blessings from family and friends.
   - `public.journal_posts` — Long-form letters and stories written for Lil Debbie.
2. **Supabase Storage Bucket**:
   - `lil-debbie-media` — Configured for images (`jpeg`, `png`, `webp`, `gif`, `avif`), videos (`mp4`, `webm`, `quicktime`), and audio (`mpeg`, `mp4`, `wav`, `ogg`) with RLS policies and **no automatic deletion or expiration**.
3. **Database Migration**:
   - `init_lil_debbie_schema_and_storage` applied directly to project `jykolicnbfaddbznijtj`.

---

## 3. 100% Free-Tier Operation & Guardrails

- **Supabase Free Plan**: Includes 500 MB PostgreSQL database storage, 1 GB Supabase file storage, and 5 GB bandwidth per month at **$0/month**.
- **GitHub Free Plan**: Hosts the application source code at **$0/month**.
- **No Paid Add-ons**: No paid services, compute add-ons, or billable features are enabled.
- **No Automatic Deletion / Expiration**: Neither database rows nor Storage objects have TTL, cron cleanups, or lifecycle expiration rules.
- **No Personal Media in GitHub**: `.gitignore` blocks all image, video, and audio extensions (`*.jpg`, `*.png`, `*.mp4`, `*.mov`, `*.mp3`, `*.wav`, etc.) and local media directories (`personal-media/`, `uploads/`, `media/`).

---

## 4. Running Locally

```bash
npm install
cp .env.example .env
npm run dev
```
