import React, { useEffect, useState, useRef } from 'react';
import {
  Heart,
  Sparkles,
  Camera,
  Calendar,
  BookOpen,
  MessageCircleHeart,
  Upload,
  ShieldCheck,
  Cloud,
  Star,
  Sun,
  Music,
  Film,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Search,
  Settings,
  MapPin,
  Mic,
  Square,
  ExternalLink,
  Database,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  supabase,
  STORAGE_BUCKET,
  SUPABASE_PROJECT_NAME,
  SUPABASE_PROJECT_REF,
  uploadPersonalMediaToSupabase,
  formatBytes,
  type SiteSettings,
  type MediaItem,
  type Milestone,
  type GuestbookEntry,
  type JournalPost,
} from './lib/supabase';

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  site_title: 'Lil Debbie',
  tagline:
    'A timeless digital sanctuary of precious memories, milestones, heartfelt letters, and family love.',
  about_title: 'Celebrating Lil Debbie',
  about_body:
    "Welcome to Lil Debbie's personal memory sanctuary. Every milestone, story, wish, and keepsake lives here. Personal photos, videos, and voice notes are uploaded directly to our secure Supabase Storage bucket—never committed to GitHub—and preserved permanently with zero automatic expiration.",
  special_date: '2026-11-05',
  special_date_label: 'Celebration & Keepsake Day',
  hero_badge: 'Forever Cherished • Cloud Media Vault',
  hero_image_url: null,
  theme_mode: 'warm-rose',
  updated_at: new Date().toISOString(),
};

const THEME_STYLES: Record<
  SiteSettings['theme_mode'],
  {
    accentBg: string;
    accentHover: string;
    accentText: string;
    accentLight: string;
    accentBorder: string;
    gradientHero: string;
    badgeBg: string;
  }
> = {
  'warm-rose': {
    accentBg: 'bg-rose-600',
    accentHover: 'hover:bg-rose-700',
    accentText: 'text-rose-600',
    accentLight: 'bg-rose-50',
    accentBorder: 'border-rose-200',
    gradientHero: 'from-rose-100/80 via-amber-50/50 to-white',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  'golden-sun': {
    accentBg: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    accentText: 'text-amber-700',
    accentLight: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    gradientHero: 'from-amber-100/80 via-rose-50/40 to-white',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  'lavender-dream': {
    accentBg: 'bg-purple-600',
    accentHover: 'hover:bg-purple-700',
    accentText: 'text-purple-600',
    accentLight: 'bg-purple-50',
    accentBorder: 'border-purple-200',
    gradientHero: 'from-purple-100/80 via-pink-50/40 to-white',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-200',
  },
  'sage-garden': {
    accentBg: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentText: 'text-emerald-700',
    accentLight: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    gradientHero: 'from-emerald-100/80 via-teal-50/40 to-white',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
};

const MEDIA_CATEGORIES = [
  'All',
  'Favorites',
  'Moments',
  'Milestones',
  'Celebrations',
  'Family & Friends',
  'Voice Notes',
];

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Media Vault filter & upload states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('Moments');
  const [uploadLocation, setUploadLocation] = useState<string>('');
  const [uploadDate, setUploadDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [uploadFavorite, setUploadFavorite] = useState<boolean>(false);

  // Browser Voice Note Recorder (uploads straight to Supabase Storage)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Lightbox / Active Readers
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [activeJournal, setActiveJournal] = useState<JournalPost | null>(null);

  // Modals for Milestones, Journal, Site Settings
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [milestoneTitle, setMilestoneTitle] = useState<string>('');
  const [milestoneDesc, setMilestoneDesc] = useState<string>('');
  const [milestoneDate, setMilestoneDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [milestoneBadge, setMilestoneBadge] = useState<string>('Milestone');
  const [milestoneIcon, setMilestoneIcon] = useState<string>('sparkles');
  const [milestoneFile, setMilestoneFile] = useState<File | null>(null);
  const [savingMilestone, setSavingMilestone] = useState<boolean>(false);

  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [journalAuthor, setJournalAuthor] = useState<string>('');
  const [journalTag, setJournalTag] = useState<string>('Dedication Letter');
  const [journalExcerpt, setJournalExcerpt] = useState<string>('');
  const [journalContent, setJournalContent] = useState<string>('');
  const [savingJournal, setSavingJournal] = useState<boolean>(false);

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [heroCoverFile, setHeroCoverFile] = useState<File | null>(null);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Guestbook Form
  const [gbName, setGbName] = useState<string>('');
  const [gbRelation, setGbRelation] = useState<string>('Family & Friend');
  const [gbMessage, setGbMessage] = useState<string>('');
  const [submittingGb, setSubmittingGb] = useState<boolean>(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [settingsRes, mediaRes, milestonesRes, gbRes, journalRes] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
        supabase.from('media_items').select('*').order('created_at', { ascending: false }),
        supabase.from('milestones').select('*').order('event_date', { ascending: false }),
        supabase.from('guestbook_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('journal_posts').select('*').order('published_at', { ascending: false }),
      ]);

      if (!settingsRes.error && settingsRes.data) {
        setSettings(settingsRes.data as SiteSettings);
        setSettingsForm(settingsRes.data as SiteSettings);
      }
      if (!mediaRes.error && mediaRes.data) {
        setMediaItems(mediaRes.data as MediaItem[]);
      }
      if (!milestonesRes.error && milestonesRes.data) {
        setMilestones(milestonesRes.data as Milestone[]);
      }
      if (!gbRes.error && gbRes.data) {
        setGuestbook(gbRes.data as GuestbookEntry[]);
      }
      if (!journalRes.error && journalRes.data) {
        setJournalPosts(journalRes.data as JournalPost[]);
      }

      setConnected(!settingsRes.error && !mediaRes.error);
    } catch (err) {
      console.error('Error loading Supabase data:', err);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const theme = THEME_STYLES[settings.theme_mode] || THEME_STYLES['warm-rose'];

  // Voice Note Recording Helpers
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordedFile = new File(
          [audioBlob],
          `voice-note-${new Date().toISOString().slice(0, 10)}.webm`,
          { type: 'audio/webm' }
        );
        setUploadFile(recordedFile);
        if (!uploadTitle) setUploadTitle('Voice Note for Lil Debbie');
        setUploadCategory('Voice Notes');
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      showNotification(
        'Microphone permission was denied or unavailable. You can still select an audio file from your device.',
        'error'
      );
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Upload Personal Media to Supabase Storage (`lil-debbie-media`)
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showNotification('Please choose a photo, video, or audio file to upload.', 'error');
      return;
    }
    setUploading(true);
    try {
      const { storagePath, publicUrl, mediaType } = await uploadPersonalMediaToSupabase(
        uploadFile,
        'vault'
      );

      const newTitle = uploadTitle.trim() || uploadFile.name.replace(/\.[^/.]+$/, '');
      const { data, error } = await supabase
        .from('media_items')
        .insert({
          title: newTitle,
          caption: uploadCaption.trim(),
          category: uploadCategory,
          media_type: mediaType,
          storage_path: storagePath,
          public_url: publicUrl,
          file_size: uploadFile.size,
          taken_at: uploadDate || new Date().toISOString().split('T')[0],
          location: uploadLocation.trim(),
          is_favorite: uploadFavorite,
        })
        .select()
        .single();

      if (error) throw error;

      setMediaItems((prev) => [data as MediaItem, ...prev]);
      setUploadFile(null);
      setUploadTitle('');
      setUploadCaption('');
      setUploadLocation('');
      setUploadFavorite(false);
      setShowUploadModal(false);
      showNotification(
        'Saved to Supabase Cloud Storage (lil-debbie-media) permanently! Never uploaded to GitHub.'
      );
    } catch (err: any) {
      showNotification(err?.message || 'Failed to upload media to Supabase Storage.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleFavorite = async (item: MediaItem) => {
    const updatedVal = !item.is_favorite;
    const { error } = await supabase
      .from('media_items')
      .update({ is_favorite: updatedVal })
      .eq('id', item.id);

    if (!error) {
      setMediaItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_favorite: updatedVal } : m))
      );
      if (activeMedia?.id === item.id) {
        setActiveMedia({ ...activeMedia, is_favorite: updatedVal });
      }
    }
  };

  const handleDeleteMedia = async (item: MediaItem) => {
    if (
      !window.confirm(
        `Remove "${item.title}" from the Supabase Cloud Vault? (Note: Nothing is ever deleted automatically; this is a manual removal.)`
      )
    ) {
      return;
    }
    try {
      if (item.storage_path) {
        await supabase.storage.from(STORAGE_BUCKET).remove([item.storage_path]);
      }
      const { error } = await supabase.from('media_items').delete().eq('id', item.id);
      if (error) throw error;
      setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
      if (activeMedia?.id === item.id) setActiveMedia(null);
      showNotification('Media item removed.');
    } catch (err: any) {
      showNotification(err?.message || 'Could not remove item.', 'error');
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneDesc.trim()) return;
    setSavingMilestone(true);
    try {
      let mediaUrl: string | null = null;
      if (milestoneFile) {
        const uploaded = await uploadPersonalMediaToSupabase(milestoneFile, 'milestones');
        mediaUrl = uploaded.publicUrl;
      }

      const { data, error } = await supabase
        .from('milestones')
        .insert({
          title: milestoneTitle.trim(),
          description: milestoneDesc.trim(),
          event_date: milestoneDate,
          badge: milestoneBadge.trim() || 'Milestone',
          icon: milestoneIcon,
          media_url: mediaUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setMilestones((prev) =>
        [data as Milestone, ...prev].sort((a, b) =>
          b.event_date.localeCompare(a.event_date)
        )
      );
      setMilestoneTitle('');
      setMilestoneDesc('');
      setMilestoneFile(null);
      setShowMilestoneModal(false);
      showNotification('New milestone saved to Supabase!');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to save milestone.', 'error');
    } finally {
      setSavingMilestone(false);
    }
  };

  // Add Journal Letter / Story
  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;
    setSavingJournal(true);
    try {
      const excerptText =
        journalExcerpt.trim() ||
        journalContent.trim().slice(0, 140) + (journalContent.length > 140 ? '...' : '');

      const { data, error } = await supabase
        .from('journal_posts')
        .insert({
          title: journalTitle.trim(),
          author: journalAuthor.trim() || 'Family',
          tag: journalTag.trim() || 'Letter',
          excerpt: excerptText,
          content: journalContent.trim(),
          published_at: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      setJournalPosts((prev) => [data as JournalPost, ...prev]);
      setJournalTitle('');
      setJournalAuthor('');
      setJournalExcerpt('');
      setJournalContent('');
      setShowJournalModal(false);
      showNotification('Letter published to Lil Debbie’s Journal!');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to save journal entry.', 'error');
    } finally {
      setSavingJournal(false);
    }
  };

  // Sign Guestbook
  const handleSignGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbName.trim() || !gbMessage.trim()) return;
    setSubmittingGb(true);
    try {
      const { data, error } = await supabase
        .from('guestbook_entries')
        .insert({
          author_name: gbName.trim(),
          relationship: gbRelation.trim() || 'Family & Friend',
          message: gbMessage.trim(),
          hearts: 1,
          is_featured: false,
        })
        .select()
        .single();

      if (error) throw error;

      setGuestbook((prev) => [data as GuestbookEntry, ...prev]);
      setGbName('');
      setGbMessage('');
      showNotification('Thank you! Your love note for Lil Debbie has been saved.');
    } catch (err: any) {
      showNotification(err?.message || 'Could not post guestbook wish.', 'error');
    } finally {
      setSubmittingGb(false);
    }
  };

  const handleHeartGuestbook = async (entry: GuestbookEntry) => {
    const nextHearts = entry.hearts + 1;
    setGuestbook((prev) =>
      prev.map((g) => (g.id === entry.id ? { ...g, hearts: nextHearts } : g))
    );
    await supabase
      .from('guestbook_entries')
      .update({ hearts: nextHearts })
      .eq('id', entry.id);
  };

  // Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      let heroImageUrl = settingsForm.hero_image_url;
      if (heroCoverFile) {
        const uploaded = await uploadPersonalMediaToSupabase(heroCoverFile, 'hero');
        heroImageUrl = uploaded.publicUrl;
      }

      const payload = {
        ...settingsForm,
        id: 'default',
        hero_image_url: heroImageUrl,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('site_settings')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      setSettings(data as SiteSettings);
      setSettingsForm(data as SiteSettings);
      setHeroCoverFile(null);
      setShowSettingsModal(false);
      showNotification('Site settings updated in Supabase!');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to update settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered media items
  const filteredMedia = mediaItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Favorites' && item.is_favorite) ||
      (selectedCategory === 'Voice Notes' && item.media_type === 'audio') ||
      item.category === selectedCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const totalStorageBytes = mediaItems.reduce((acc, m) => acc + (m.file_size || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-sanctuary-grid">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${
              toast.type === 'error'
                ? 'bg-red-950 text-red-100 border-red-800'
                : 'bg-stone-900 text-white border-stone-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Privacy & Architecture Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-medium text-white">
              Supabase: {SUPABASE_PROJECT_NAME}
            </span>
            <span className="hidden sm:inline text-stone-400">
              ({SUPABASE_PROJECT_REF} • Free Tier • Permanent Retention)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Personal Media Stored Only in Supabase Storage (Never on GitHub)
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2.5 group">
            <div
              className={`w-10 h-10 rounded-2xl ${theme.accentBg} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-stone-900 block leading-none">
                {settings.site_title}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                Memory Sanctuary & Cloud Vault
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <a href="#about" className="hover:text-stone-950 transition">
              Story
            </a>
            <a href="#vault" className="hover:text-stone-950 transition">
              Media Vault ({mediaItems.length})
            </a>
            <a href="#milestones" className="hover:text-stone-950 transition">
              Milestones ({milestones.length})
            </a>
            <a href="#journal" className="hover:text-stone-950 transition">
              Letters ({journalPosts.length})
            </a>
            <a href="#guestbook" className="hover:text-stone-950 transition">
              Guestbook ({guestbook.length})
            </a>
            <a href="#architecture" className="hover:text-stone-950 transition">
              Cloud Status
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white ${theme.accentBg} ${theme.accentHover} shadow-sm transition cursor-pointer`}
            >
              <Upload className="w-4 h-4" />
              <span>Add Media</span>
            </button>
            <button
              onClick={() => {
                setSettingsForm(settings);
                setShowSettingsModal(true);
              }}
              title="Customize Website Settings"
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative bg-gradient-to-b ${theme.gradientHero} pt-12 pb-16 border-b border-stone-200/60`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${theme.badgeBg}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{settings.hero_badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12]">
                {settings.site_title}
              </h1>

              <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl">
                {settings.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white ${theme.accentBg} ${theme.accentHover} shadow-md transition cursor-pointer`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload to Personal Vault</span>
                </button>
                <a
                  href="#guestbook"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 shadow-sm transition"
                >
                  <MessageCircleHeart className="w-4 h-4 text-rose-500" />
                  <span>Leave a Love Note</span>
                </a>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="bg-white/90 backdrop-blur rounded-2xl p-3.5 border border-stone-200/80 shadow-xs">
                  <div className="text-2xl font-bold text-stone-900">{mediaItems.length}</div>
                  <div className="text-xs text-stone-500 font-medium">Cloud Media Keepsakes</div>
                </div>
                <div className="bg-white/90 backdrop-blur rounded-2xl p-3.5 border border-stone-200/80 shadow-xs">
                  <div className="text-2xl font-bold text-stone-900">{milestones.length}</div>
                  <div className="text-xs text-stone-500 font-medium">Cherished Milestones</div>
                </div>
                <div className="bg-white/90 backdrop-blur rounded-2xl p-3.5 border border-stone-200/80 shadow-xs">
                  <div className="text-2xl font-bold text-stone-900">{journalPosts.length}</div>
                  <div className="text-xs text-stone-500 font-medium">Letters & Stories</div>
                </div>
                <div className="bg-white/90 backdrop-blur rounded-2xl p-3.5 border border-stone-200/80 shadow-xs">
                  <div className="text-2xl font-bold text-stone-900">
                    {guestbook.reduce((sum, g) => sum + g.hearts, 0)}
                  </div>
                  <div className="text-xs text-stone-500 font-medium">Hearts & Blessings</div>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Keepsake Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200/90 space-y-5">
                {settings.hero_image_url ? (
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 relative">
                    <img
                      src={settings.hero_image_url}
                      alt={settings.site_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${theme.gradientHero} border border-dashed ${theme.accentBorder} flex flex-col items-center justify-center p-6 text-center`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl ${theme.accentLight} ${theme.accentText} flex items-center justify-center mb-3 shadow-xs`}
                    >
                      <Heart className="w-7 h-7 fill-current" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      {settings.about_title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs">
                      Personal photos & videos are never stored in GitHub. Upload a cover portrait or memory directly to Supabase Storage.
                    </p>
                    <button
                      onClick={() => {
                        setSettingsForm(settings);
                        setShowSettingsModal(true);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-2xs cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Set Hero Portrait in Cloud</span>
                    </button>
                  </div>
                )}

                <div id="about" className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold uppercase tracking-wider text-stone-400">
                      About This Sanctuary
                    </span>
                    {settings.special_date && (
                      <span className="inline-flex items-center gap-1 font-medium text-stone-600">
                        <Calendar className="w-3.5 h-3.5" />
                        {settings.special_date_label}: {settings.special_date}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">
                    {settings.about_title}
                  </h2>
                  <p className="text-sm text-stone-600 leading-relaxed">{settings.about_body}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Media Vault Section */}
      <section id="vault" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">
              <Cloud className="w-4 h-4" />
              <span>Supabase Cloud Storage • Bucket: {STORAGE_BUCKET}</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Personal Media Vault
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Upload photos, video memories, and voice notes directly to your private Supabase bucket. Files are permanently retained with no expiration and never committed to GitHub.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white ${theme.accentBg} ${theme.accentHover} shadow-sm transition cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              <span>Upload Photo / Video / Voice</span>
            </button>
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {MEDIA_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? `${theme.accentBg} text-white shadow-xs`
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories, captions, places..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-stone-200/60 animate-pulse border border-stone-200"
              />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-xl mx-auto">
            <div
              className={`w-14 h-14 rounded-2xl ${theme.accentLight} ${theme.accentText} flex items-center justify-center mx-auto mb-4`}
            >
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              {mediaItems.length === 0
                ? 'Your Personal Cloud Vault is Ready'
                : 'No Matching Memories Found'}
            </h3>
            <p className="text-sm text-stone-600 mt-1.5 mb-6">
              {mediaItems.length === 0
                ? 'To protect your privacy, zero personal photos or videos are stored in the public GitHub repository. Upload your first photo, video, or voice note directly to your Supabase Storage bucket!'
                : 'Try selecting another category tab or clearing your search filter.'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white ${theme.accentBg} ${theme.accentHover} shadow-sm transition cursor-pointer`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload First Memory to Supabase</span>
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div
                  onClick={() => setActiveMedia(item)}
                  className="aspect-[4/3] bg-stone-100 relative overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {item.media_type === 'image' && (
                    <img
                      src={item.public_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}
                  {item.media_type === 'video' && (
                    <video
                      src={item.public_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  )}
                  {item.media_type === 'audio' && (
                    <div className="flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-rose-50 to-amber-50 w-full h-full">
                      <Music className="w-12 h-12 text-rose-500 mb-2" />
                      <span className="text-xs font-semibold text-stone-700">
                        Voice Note / Audio Keepsake
                      </span>
                      <audio
                        src={item.public_url}
                        controls
                        className="mt-3 w-full max-w-[240px]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/65 text-white backdrop-blur-xs">
                      {item.category}
                    </span>
                    {item.media_type === 'video' && (
                      <span className="p-1.5 rounded-full bg-black/65 text-white">
                        <Film className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item);
                    }}
                    title="Toggle Favorite"
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition cursor-pointer ${
                      item.is_favorite
                        ? 'bg-rose-600 text-white'
                        : 'bg-black/50 text-white hover:bg-black/70'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => setActiveMedia(item)}
                        className="font-serif font-bold text-stone-900 hover:text-rose-600 cursor-pointer line-clamp-1"
                      >
                        {item.title}
                      </h3>
                    </div>
                    {item.caption && (
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-2">
                      <span>{item.taken_at}</span>
                      {item.location && (
                        <span className="inline-flex items-center gap-0.5 text-stone-500">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteMedia(item)}
                      title="Delete memory"
                      className="text-stone-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Milestones & Timeline Section */}
      <section
        id="milestones"
        className="py-16 bg-white border-y border-stone-200/80"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                <Star className="w-4 h-4" />
                <span>Chapters & Special Moments</span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-stone-900">
                Milestones & Journey
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Every unforgettable first, celebration, and chapter in Lil Debbie’s story.
              </p>
            </div>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-rose-200 space-y-8">
            {milestones.map((ms) => (
              <div key={ms.id} className="relative group">
                <div
                  className={`w-4 h-4 rounded-full ${theme.accentBg} border-4 border-white shadow-sm absolute -left-[33px] sm:-left-[41px] top-1.5`}
                />
                <div className="bg-stone-50/80 hover:bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs transition">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.badgeBg}`}
                    >
                      {ms.badge}
                    </span>
                    <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {ms.event_date}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    {ms.title}
                  </h3>
                  <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                    {ms.description}
                  </p>
                  {ms.media_url && (
                    <div className="mt-4 rounded-xl overflow-hidden max-h-64 w-fit border border-stone-200">
                      <img
                        src={ms.media_url}
                        alt={ms.title}
                        className="max-h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Letters & Journal Section */}
      <section id="journal" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Keepsake Letters & Stories</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Dear Lil Debbie — Letters & Reflections
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Long-form letters, stories, and reflections written for Lil Debbie to treasure forever.
            </p>
          </div>
          <button
            onClick={() => setShowJournalModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white ${theme.accentBg} ${theme.accentHover} shadow-sm transition cursor-pointer self-start sm:self-auto`}
          >
            <Plus className="w-4 h-4" />
            <span>Write a Letter</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {journalPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setActiveJournal(post)}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${theme.badgeBg}`}>
                    {post.tag}
                  </span>
                  <span>{post.published_at}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-rose-600">
                  {post.title}
                </h3>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed line-clamp-3">
                  {post.excerpt || post.content}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700">Written by {post.author}</span>
                <span className={`font-semibold ${theme.accentText}`}>Read Full Letter →</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Guestbook & Love Notes Section */}
      <section
        id="guestbook"
        className="py-16 bg-gradient-to-b from-white to-rose-50/50 border-t border-stone-200/80"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Guestbook Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm sticky top-24">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">
                  <MessageCircleHeart className="w-4 h-4" />
                  <span>Guestbook & Blessings</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  Leave a Wish for Lil Debbie
                </h2>
                <p className="text-xs text-stone-500 mt-1 mb-5">
                  Share a blessing, favorite memory, or note of encouragement. Saved permanently in Supabase.
                </p>

                <form onSubmit={handleSignGuestbook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={gbName}
                      onChange={(e) => setGbName(e.target.value)}
                      placeholder="e.g., Auntie Sarah"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Relationship / Role
                    </label>
                    <input
                      type="text"
                      value={gbRelation}
                      onChange={(e) => setGbRelation(e.target.value)}
                      placeholder="e.g., Family, Godparent, Friend"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Message or Blessing *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={gbMessage}
                      onChange={(e) => setGbMessage(e.target.value)}
                      placeholder="Write a heartfelt message for Lil Debbie..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingGb}
                    className={`w-full py-3 rounded-xl font-semibold text-sm text-white ${theme.accentBg} ${theme.accentHover} shadow-sm transition cursor-pointer disabled:opacity-50`}
                  >
                    {submittingGb ? 'Posting Note...' : 'Post Love Note to Guestbook'}
                  </button>
                </form>
              </div>
            </div>

            {/* Guestbook Entries List */}
            <div className="lg:col-span-7 space-y-4">
              {guestbook.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base">
                        {entry.author_name}
                      </h3>
                      <span className="text-xs text-stone-500">{entry.relationship}</span>
                    </div>
                    <button
                      onClick={() => handleHeartGuestbook(entry)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>{entry.hearts}</span>
                    </button>
                  </div>
                  <p className="text-sm text-stone-700 mt-3 leading-relaxed whitespace-pre-line">
                    “{entry.message}”
                  </p>
                  <div className="text-[11px] text-stone-400 mt-3">
                    Posted {new Date(entry.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture, Free Plan & Privacy Compliance Panel */}
      <section id="architecture" className="py-14 bg-stone-900 text-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                System Architecture & Free-Tier Compliance
              </span>
              <h2 className="text-2xl font-serif font-bold text-white mt-1">
                Connected Services Overview
              </h2>
            </div>
            <button
              onClick={fetchAllData}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 border border-stone-700 cursor-pointer self-start md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Cloud Status</span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="bg-stone-800/70 rounded-2xl p-5 border border-stone-700/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Database className="w-4 h-4" />
                <span>Existing Supabase Project</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Connected to <strong>{SUPABASE_PROJECT_NAME}</strong> (<code>{SUPABASE_PROJECT_REF}</code>, region <code>eu-west-1</code>, PostgreSQL 17). No duplicate projects created.
              </p>
              <div className="text-[11px] text-stone-400 pt-1">
                Tables: <code>site_settings</code>, <code>media_items</code>, <code>milestones</code>, <code>guestbook_entries</code>, <code>journal_posts</code>
              </div>
            </div>

            <div className="bg-stone-800/70 rounded-2xl p-5 border border-stone-700/80 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <Lock className="w-4 h-4" />
                <span>Zero Personal Media on GitHub</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                GitHub repository <code>Samuel-kayode/lil-debbie-website</code> stores application source code only, with strict <code>.gitignore</code> rules blocking personal photos, videos, and audio files.
              </p>
              <div className="text-[11px] text-stone-400 pt-1">
                Cloud Vault Usage: {formatBytes(totalStorageBytes)} / 1 GB Free Tier
              </div>
            </div>

            <div className="bg-stone-800/70 rounded-2xl p-5 border border-stone-700/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Free Plan • No Auto-Deletion</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Operates entirely on the Free Tier of GitHub and Supabase. Zero paid add-ons enabled, zero charges incurred, and zero automatic deletion or TTL expiration policies.
              </p>
              <div className="text-[11px] text-stone-400 pt-1">
                Retention Policy: Permanent (Manual control only)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-8 text-xs border-t border-stone-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-stone-200 font-medium">{settings.site_title}</span>
            <span>— Crafted with love & backed by Supabase</span>
          </div>
          <div>
            Permanent Cloud Sanctuary • No Personal Media on GitHub • Free Tier Architecture
          </div>
        </div>
      </footer>

      {/* Modal: Upload Media to Supabase Storage */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Upload to Personal Media Vault
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Direct upload to Supabase Storage bucket <code>{STORAGE_BUCKET}</code> (Never committed to GitHub).
                </p>
              </div>
              <button
                onClick={() => {
                  stopVoiceRecording();
                  setShowUploadModal(false);
                }}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMediaUpload} className="space-y-4">
              {/* File Picker or Voice Note Recorder */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-center space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 shadow-2xs cursor-pointer">
                    <ImageIcon className="w-4 h-4 text-rose-500" />
                    <span>Select Photo / Video / Audio</span>
                    <input
                      type="file"
                      accept="image/*,video/*,audio/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setUploadFile(f);
                        if (f && !uploadTitle) {
                          setUploadTitle(f.name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Record Voice Note</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold animate-pulse cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Recording ({recordingSeconds}s)</span>
                    </button>
                  )}
                </div>

                {uploadFile ? (
                  <div className="text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                    Selected: <strong>{uploadFile.name}</strong> ({formatBytes(uploadFile.size)})
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-500">
                    Supports JPG, PNG, WebP, GIF, MP4, WebM, MP3, WAV (up to 50 MB per file on Free Tier).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Afternoon Smiles in the Garden"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    <option value="Moments">Moments</option>
                    <option value="Milestones">Milestones</option>
                    <option value="Celebrations">Celebrations</option>
                    <option value="Family & Friends">Family & Friends</option>
                    <option value="Voice Notes">Voice Notes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date Taken
                  </label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={uploadLocation}
                  onChange={(e) => setUploadLocation(e.target.value)}
                  placeholder="e.g., Home, Port Harcourt, Family Gathering"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Story / Caption
                </label>
                <textarea
                  rows={3}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Add the story behind this moment..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadFavorite}
                  onChange={(e) => setUploadFavorite(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Highlight as a Favorite Keepsake</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white ${theme.accentBg} ${theme.accentHover} shadow-sm cursor-pointer disabled:opacity-50`}
                >
                  {uploading ? 'Uploading to Supabase...' : 'Save to Cloud Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Lightbox Media Viewer */}
      {activeMedia && (
        <div
          onClick={() => setActiveMedia(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-800"
          >
            <div className="bg-stone-950 flex items-center justify-center max-h-[65vh] overflow-hidden relative">
              {activeMedia.media_type === 'image' && (
                <img
                  src={activeMedia.public_url}
                  alt={activeMedia.title}
                  className="max-h-[65vh] w-auto object-contain"
                />
              )}
              {activeMedia.media_type === 'video' && (
                <video
                  src={activeMedia.public_url}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full"
                />
              )}
              {activeMedia.media_type === 'audio' && (
                <div className="p-12 text-center text-white space-y-4">
                  <Music className="w-14 h-14 text-rose-400 mx-auto" />
                  <audio src={activeMedia.public_url} controls autoPlay className="w-72" />
                </div>
              )}
              <button
                onClick={() => setActiveMedia(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
                  {activeMedia.category}
                </span>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span>{activeMedia.taken_at}</span>
                  <a
                    href={activeMedia.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-rose-600 font-semibold hover:underline"
                  >
                    <span>Open Original</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {activeMedia.title}
              </h3>
              {activeMedia.caption && (
                <p className="text-sm text-stone-600 leading-relaxed">{activeMedia.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Journal Reader */}
      {activeJournal && (
        <div
          onClick={() => setActiveJournal(null)}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 my-8"
          >
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
                {activeJournal.tag}
              </span>
              <button
                onClick={() => setActiveJournal(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {activeJournal.title}
            </h3>
            <div className="text-xs text-stone-500 pb-4 border-b border-stone-100">
              Written by <strong>{activeJournal.author}</strong> • {activeJournal.published_at}
            </div>
            <div className="text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line font-serif">
              {activeJournal.content}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Milestone */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Add a Special Milestone
              </h3>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g., First Birthday Celebration"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={milestoneBadge}
                    onChange={(e) => setMilestoneBadge(e.target.value)}
                    placeholder="Celebration"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Describe why this milestone is so special..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Optional Photo (Uploaded to Supabase Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMilestoneFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-stone-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMilestone}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white ${theme.accentBg} cursor-pointer disabled:opacity-50`}
                >
                  {savingMilestone ? 'Saving...' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Write a Journal Letter */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Write a Letter to Lil Debbie
              </h3>
              <button
                onClick={() => setShowJournalModal(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddJournal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Letter Title *
                </label>
                <input
                  type="text"
                  required
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="e.g., Our Wishes for Your Future"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Written By *
                  </label>
                  <input
                    type="text"
                    required
                    value={journalAuthor}
                    onChange={(e) => setJournalAuthor(e.target.value)}
                    placeholder="e.g., Dad & Mom"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={journalTag}
                    onChange={(e) => setJournalTag(e.target.value)}
                    placeholder="Dedication Letter"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Letter Content *
                </label>
                <textarea
                  rows={6}
                  required
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Dearest Lil Debbie..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingJournal}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white ${theme.accentBg} cursor-pointer disabled:opacity-50`}
                >
                  {savingJournal ? 'Publishing...' : 'Publish Letter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customize Site Settings */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Customize Website & Theme
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSettings} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Website Title
                  </label>
                  <input
                    type="text"
                    value={settingsForm.site_title}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, site_title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Color Theme
                  </label>
                  <select
                    value={settingsForm.theme_mode}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        theme_mode: e.target.value as SiteSettings['theme_mode'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    <option value="warm-rose">Warm Rose</option>
                    <option value="golden-sun">Golden Sun</option>
                    <option value="lavender-dream">Lavender Dream</option>
                    <option value="sage-garden">Sage Garden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Hero Tagline
                </label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  About Heading
                </label>
                <input
                  type="text"
                  value={settingsForm.about_title}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, about_title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  About Story Text
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.about_body}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, about_body: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Upload Hero Cover Portrait (Saved to Supabase Storage, not GitHub)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHeroCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-stone-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white ${theme.accentBg} cursor-pointer disabled:opacity-50`}
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
