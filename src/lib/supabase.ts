import { createClient } from '@supabase/supabase-js';

// Connected to existing Supabase project: "Samuel-kayode's Project" (ref: jykolicnbfaddbznijtj)
const DEFAULT_SUPABASE_URL = 'https://jykolicnbfaddbznijtj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5a29saWNuYmZhZGRiem5panRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MzkwMjIsImV4cCI6MjEwOTQxNTAyMn0.OUn-TavUKWxVzifqglz5YcBAkFEE_-bLepwuEebeIm4';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
export const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'lil-debbie-media';
export const SUPABASE_PROJECT_REF = 'jykolicnbfaddbznijtj';
export const SUPABASE_PROJECT_NAME = "Samuel-kayode's Project";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SiteSettings {
  id: string;
  site_title: string;
  tagline: string;
  about_title: string;
  about_body: string;
  special_date: string | null;
  special_date_label: string;
  hero_badge: string;
  hero_image_url: string | null;
  theme_mode: 'warm-rose' | 'golden-sun' | 'lavender-dream' | 'sage-garden';
  updated_at: string;
}

export interface MediaItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  media_type: 'image' | 'video' | 'audio';
  storage_path: string;
  public_url: string;
  file_size: number;
  taken_at: string;
  location: string;
  is_favorite: boolean;
  created_at: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  event_date: string;
  badge: string;
  icon: string;
  media_url: string | null;
  created_at: string;
}

export interface GuestbookEntry {
  id: string;
  author_name: string;
  relationship: string;
  message: string;
  hearts: number;
  is_featured: boolean;
  created_at: string;
}

export interface JournalPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tag: string;
  published_at: string;
  created_at: string;
}

/**
 * Uploads a personal media file directly to Supabase Storage (`lil-debbie-media` bucket).
 * Files are never stored in the repository or uploaded to GitHub, and no expiration/TTL is set.
 */
export async function uploadPersonalMediaToSupabase(
  file: File,
  folder: string = 'uploads'
): Promise<{ storagePath: string; publicUrl: string; mediaType: 'image' | 'video' | 'audio' }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 48);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBaseName}.${ext}`;
  const storagePath = `${folder}/${uniqueName}`;

  let mediaType: 'image' | 'video' | 'audio' = 'image';
  if (file.type.startsWith('video/')) {
    mediaType = 'video';
  } else if (file.type.startsWith('audio/')) {
    mediaType = 'audio';
  }

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
    mediaType,
  };
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
