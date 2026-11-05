import React, { useEffect, useState, useRef } from 'react';
import {
  Lock,
  LogOut,
  Upload,
  Trash2,
  RefreshCw,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Music,
  Film,
  Image as ImageIcon,
  Mic,
  Square,
  FileText,
  KeyRound,
  Sparkles,
  Save,
  X,
} from 'lucide-react';
import {
  supabase,
  STORAGE_BUCKET,
  MEDIA_SECTION_LABELS,
  DEFAULT_BIRTHDAY_CONTENT,
  EXACT_APPROVED_FINAL_SURPRISE_LETTER,
  mergeBirthdayContent,
  uploadPrivateMediaToStorage,
  formatBytes,
  type MediaItem,
  type MediaSectionType,
  type BirthdayContentConfig,
  type SiteSettings,
} from '../lib/supabase';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onDataUpdated: () => void;
}

export function AdminDashboard({ onBackToSite, onDataUpdated }: AdminDashboardProps) {
  const [authChecking, setAuthChecking] = useState(true);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');

  // Login Form (No credentials stored in frontend code)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'media' | 'content' | 'security'>('media');
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Media Items & Settings state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [contentConfig, setContentConfig] = useState<BirthdayContentConfig>(
    DEFAULT_BIRTHDAY_CONTENT
  );
  const [savingContent, setSavingContent] = useState(false);

  // Upload Form State
  const [uploadSection, setUploadSection] = useState<MediaSectionType>('bro_photo');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCaptionStyle, setUploadCaptionStyle] = useState<'sweet' | 'funny' | 'playful'>('sweet');
  const [uploadOrder, setUploadOrder] = useState<number>(1);
  const [uploading, setUploading] = useState(false);

  // Browser Voice Recorder for Admin
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Edit / Replace Item State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // Dual Independent Password Forms
  const [newVisitorPassword, setNewVisitorPassword] = useState('');
  const [savingVisitorPw, setSavingVisitorPw] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [savingAdminPw, setSavingAdminPw] = useState(false);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    window.setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const checkOwnerSession = async () => {
    setAuthChecking(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setIsOwnerAuthenticated(false);
        return;
      }

      const { data: isOwnerRes, error: ownerErr } = await supabase.rpc('is_owner');
      if (!ownerErr && isOwnerRes === true) {
        setIsOwnerAuthenticated(true);
        setOwnerEmail(session.user.email || '');
        await loadAdminData();
      } else {
        await supabase.auth.signOut();
        setIsOwnerAuthenticated(false);
      }
    } finally {
      setAuthChecking(false);
    }
  };

  const loadAdminData = async () => {
    setLoadingMedia(true);
    try {
      const [settingsRes, mediaRes] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
        supabase
          .from('media_items')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false }),
      ]);

      if (!settingsRes.error && settingsRes.data) {
        const s = settingsRes.data as SiteSettings;
        setContentConfig(mergeBirthdayContent(s.birthday_content));
      }

      if (!mediaRes.error && mediaRes.data) {
        const items = mediaRes.data as MediaItem[];
        const withSigned = await Promise.all(
          items.map(async (item) => {
            if (!item.storage_path) return item;
            const { data } = await supabase.storage
              .from(STORAGE_BUCKET)
              .createSignedUrl(item.storage_path, 3600);
            return {
              ...item,
              signed_url: data?.signedUrl || null,
            };
          })
        );
        setMediaList(withSigned);
      }
    } catch (err: any) {
      notify(err?.message || 'Error loading dashboard data.', 'error');
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    checkOwnerSession();
  }, []);

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error || !data.user) {
        setLoginError(error?.message || 'Invalid administrator credentials.');
        return;
      }

      const { data: ownerCheck, error: rpcErr } = await supabase.rpc('is_owner');
      if (rpcErr || ownerCheck !== true) {
        await supabase.auth.signOut();
        setLoginError('This account is not authorized as the project owner.');
        return;
      }

      setIsOwnerAuthenticated(true);
      setOwnerEmail(data.user.email || '');
      setLoginPassword('');
      await loadAdminData();
      notify('Signed in to Owner Administrator Dashboard!');
    } catch (err: any) {
      setLoginError(err?.message || 'Sign-in failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleOwnerLogout = async () => {
    await supabase.auth.signOut();
    setIsOwnerAuthenticated(false);
    setOwnerEmail('');
    setMediaList([]);
  };

  // Voice Recording inside Admin Dashboard
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-recording-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        setUploadFile(file);
        if (!uploadTitle) setUploadTitle('Bro Voice Recording for Lil Debbie');
        if (uploadSection !== 'bro_voice' && uploadSection !== 'friend_morning_voice') {
          setUploadSection('bro_voice');
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      notify('Microphone access unavailable. You can still upload an audio file.', 'error');
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

  // Upload New Media to Private Bucket
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      notify('Please select a file to upload first.', 'error');
      return;
    }
    setUploading(true);
    try {
      const { storagePath, signedUrl, mediaType } = await uploadPrivateMediaToStorage(
        uploadFile,
        uploadSection
      );

      const cleanTitle =
        uploadTitle.trim() ||
        MEDIA_SECTION_LABELS[uploadSection].label.split('—')[1]?.trim() ||
        uploadFile.name.replace(/\.[^/.]+$/, '');

      const { data, error } = await supabase
        .from('media_items')
        .insert({
          title: cleanTitle,
          caption: uploadCaption.trim(),
          category: MEDIA_SECTION_LABELS[uploadSection].group,
          section: uploadSection,
          caption_style: uploadCaptionStyle,
          display_order: Number(uploadOrder) || 1,
          is_visible: true,
          media_type: mediaType,
          storage_path: storagePath,
          public_url: `private://${STORAGE_BUCKET}/${storagePath}`,
          file_size: uploadFile.size,
          taken_at: new Date().toISOString().split('T')[0],
          location: '',
          is_favorite: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: MediaItem = {
        ...(data as MediaItem),
        signed_url: signedUrl,
      };

      setMediaList((prev) => [newItem, ...prev]);
      setUploadFile(null);
      setUploadTitle('');
      setUploadCaption('');
      onDataUpdated();
      notify(`Uploaded "${cleanTitle}" to private bucket (${STORAGE_BUCKET})!`);
    } catch (err: any) {
      notify(err?.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Replace an Existing Media File In-Place
  const handleReplaceFile = async (item: MediaItem, newFile: File) => {
    setReplacingId(item.id);
    try {
      const oldPath = item.storage_path;
      const { storagePath, signedUrl, mediaType } = await uploadPrivateMediaToStorage(
        newFile,
        item.section || 'bro_photo'
      );

      const { data, error } = await supabase
        .from('media_items')
        .update({
          storage_path: storagePath,
          public_url: `private://${STORAGE_BUCKET}/${storagePath}`,
          media_type: mediaType,
          file_size: newFile.size,
        })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;

      if (oldPath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);
      }

      setMediaList((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...(data as MediaItem), signed_url: signedUrl } : m
        )
      );
      onDataUpdated();
      notify(`Replaced file for "${item.title}" in private storage!`);
    } catch (err: any) {
      notify(err?.message || 'Could not replace file.', 'error');
    } finally {
      setReplacingId(null);
    }
  };

  // Save Caption / Section / Order Edits
  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const { data, error } = await supabase
        .from('media_items')
        .update({
          title: editingItem.title.trim(),
          caption: editingItem.caption,
          section: editingItem.section,
          category: MEDIA_SECTION_LABELS[editingItem.section]?.group || 'Bro Section',
          caption_style: editingItem.caption_style || 'sweet',
          display_order: Number(editingItem.display_order) || 0,
          is_visible: editingItem.is_visible,
        })
        .eq('id', editingItem.id)
        .select()
        .single();

      if (error) throw error;

      setMediaList((prev) =>
        prev.map((m) =>
          m.id === editingItem.id
            ? { ...(data as MediaItem), signed_url: m.signed_url }
            : m
        )
      );
      setEditingItem(null);
      onDataUpdated();
      notify('Media details updated!');
    } catch (err: any) {
      notify(err?.message || 'Failed to update media details.', 'error');
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (item: MediaItem) => {
    const nextVis = !item.is_visible;
    const { error } = await supabase
      .from('media_items')
      .update({ is_visible: nextVis })
      .eq('id', item.id);

    if (!error) {
      setMediaList((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_visible: nextVis } : m))
      );
      onDataUpdated();
      notify(nextVis ? `"${item.title}" is now visible.` : `"${item.title}" hidden from visitors.`);
    }
  };

  // Delete Individual Media Item
  const handleDeleteItem = async (item: MediaItem) => {
    if (!window.confirm(`Permanently delete "${item.title}" from private storage?`)) {
      return;
    }
    try {
      if (item.storage_path) {
        await supabase.storage.from(STORAGE_BUCKET).remove([item.storage_path]);
      }
      const { error } = await supabase.from('media_items').delete().eq('id', item.id);
      if (error) throw error;

      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
      onDataUpdated();
      notify(`Deleted "${item.title}".`);
    } catch (err: any) {
      notify(err?.message || 'Failed to delete media.', 'error');
    }
  };

  // Save Structured Content Config to site_settings
  const handleSaveContentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_title: contentConfig.homepage.headline,
          birthday_content: contentConfig,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'default');

      if (error) throw error;
      onDataUpdated();
      notify('Saved website letters, captions, and audio settings!');
    } catch (err: any) {
      notify(err?.message || 'Failed to save content settings.', 'error');
    } finally {
      setSavingContent(false);
    }
  };

  // Change Visitor Birthday Password (Independent System #2)
  const handleUpdateVisitorPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitorPassword || newVisitorPassword.trim().length < 4) {
      notify('Visitor password must be at least 4 characters.', 'error');
      return;
    }
    setSavingVisitorPw(true);
    try {
      const { error } = await supabase.rpc('set_birthday_password', {
        new_password: newVisitorPassword.trim(),
      });
      if (error) throw error;
      setNewVisitorPassword('');
      notify('Birthday Visitor Entrance Password updated on backend! (Your Admin login was not changed.)');
    } catch (err: any) {
      notify(err?.message || 'Could not update visitor password.', 'error');
    } finally {
      setSavingVisitorPw(false);
    }
  };

  // Change Owner Administrator Password (Independent System #1)
  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword || newAdminPassword.length < 6) {
      notify('Supabase Auth requires administrator passwords to be at least 6 characters.', 'error');
      return;
    }
    setSavingAdminPw(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newAdminPassword,
      });
      if (error) throw error;
      setNewAdminPassword('');
      notify('Owner Administrator Login Password updated! (Lil Debbie’s visitor password was not changed.)');
    } catch (err: any) {
      notify(err?.message || 'Could not update administrator password.', 'error');
    } finally {
      setSavingAdminPw(false);
    }
  };

  const filteredMedia = mediaList.filter((item) => {
    if (filterGroup === 'All') return true;
    const sectionMeta = MEDIA_SECTION_LABELS[item.section as MediaSectionType];
    return sectionMeta?.group === filterGroup || item.category === filterGroup;
  });

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFF3D1] flex items-center justify-center p-6">
        <div className="scrapbook-card rounded-3xl p-8 bg-white text-center max-w-sm w-full">
          <RefreshCw className="w-8 h-8 text-[#F15B48] animate-spin mx-auto mb-3" />
          <p className="font-display text-xl text-[#2B1E1A]">
            Verifying Owner Session...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated Owner Login Screen
  if (!isOwnerAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFF3D1] flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="max-w-md w-full scrapbook-card rounded-3xl p-6 sm:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B1E1A] hover:text-[#F15B48] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Birthday Site</span>
            </button>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFC928] border border-[#2B1E1A] text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Supabase Owner Auth
            </span>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#F15B48] text-white border-2 border-[#2B1E1A] shadow-[3px_3px_0px_#2B1E1A] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#2B1E1A]">
              Owner Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#2B1E1A]/75">
              Sign in with your Supabase Owner account to upload, preview, replace, and organise private media in <code>{STORAGE_BUCKET}</code>.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-[#F15B48] text-xs font-bold text-[#F15B48] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleOwnerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                Owner Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your Supabase owner email"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#2B1E1A] bg-[#FFF3D1]/40 text-sm font-medium focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                Administrator Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your administrator password"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#2B1E1A] bg-[#FFF3D1]/40 text-sm font-medium focus:outline-none focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="storybook-btn w-full py-3.5 rounded-2xl bg-[#F15B48] text-white font-display text-lg tracking-wide cursor-pointer disabled:opacity-50"
            >
              {loggingIn ? 'Authenticating with Supabase...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Owner Dashboard
  return (
    <div className="min-h-screen bg-[#FFF3D1] pb-20">
      {/* Status Toast */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md">
          <div
            className={`storybook-btn flex items-center gap-3 px-4 py-3 rounded-2xl ${
              statusMessage.type === 'error'
                ? 'bg-[#F15B48] text-white'
                : 'bg-[#FFC928] text-[#2B1E1A]'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{statusMessage.text}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="ml-auto cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#FFC928] border-b-2 border-[#2B1E1A] px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToSite}
              className="storybook-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-xs font-bold text-[#2B1E1A] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Preview Birthday Website</span>
            </button>
            <div>
              <h1 className="font-display text-lg sm:text-xl text-[#2B1E1A] leading-none">
                Lil Debbie — Owner Admin Dashboard
              </h1>
              <span className="text-[11px] font-bold text-[#2B1E1A]/75">
                Signed in as {ownerEmail} • Private Bucket: {STORAGE_BUCKET}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAdminData}
              className="storybook-btn p-2 rounded-xl bg-white text-[#2B1E1A] cursor-pointer"
              title="Refresh Media & Settings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleOwnerLogout}
              className="storybook-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F15B48] text-white text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`storybook-btn px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === 'media'
                ? 'bg-[#F15B48] text-white'
                : 'bg-white text-[#2B1E1A]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. Upload & Manage Media ({mediaList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`storybook-btn px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === 'content'
                ? 'bg-[#F15B48] text-white'
                : 'bg-white text-[#2B1E1A]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Letters, Captions & Music Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`storybook-btn px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#F15B48] text-white'
                : 'bg-white text-[#2B1E1A]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>3. Passwords & Security</span>
          </button>
        </div>

        {/* ===================================================================
            TAB 1: UPLOAD & MANAGE PRIVATE MEDIA
            =================================================================== */}
        {activeTab === 'media' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Beginner-Friendly Upload Form */}
            <div className="lg:col-span-5 scrapbook-card rounded-3xl p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#2B1E1A]">
                  Upload New Personal Media
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF3D1] border border-[#2B1E1A] text-[11px] font-bold">
                  Private Storage
                </span>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    1. Which Section Does This File Belong To? *
                  </label>
                  <select
                    value={uploadSection}
                    onChange={(e) => setUploadSection(e.target.value as MediaSectionType)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#2B1E1A] bg-[#FFF3D1]/60 text-xs sm:text-sm font-bold"
                  >
                    {(Object.keys(MEDIA_SECTION_LABELS) as MediaSectionType[]).map((key) => (
                      <option key={key} value={key}>
                        {MEDIA_SECTION_LABELS[key].label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#2B1E1A]/75 mt-1">
                    {MEDIA_SECTION_LABELS[uploadSection].description}
                  </p>
                </div>

                {/* File Selector & Voice Recorder */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-[#2B1E1A] bg-[#FFF3D1]/40 text-center space-y-3">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <label className="storybook-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC928] text-xs font-bold text-[#2B1E1A] cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Choose File From Device</span>
                      <input
                        type="file"
                        accept={MEDIA_SECTION_LABELS[uploadSection].acceptedTypes}
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

                    {(uploadSection === 'bro_voice' ||
                      uploadSection === 'friend_morning_voice') &&
                      (!isRecording ? (
                        <button
                          type="button"
                          onClick={startVoiceRecording}
                          className="storybook-btn inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F15B48] text-white text-xs font-bold cursor-pointer"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Record Voice Now</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopVoiceRecording}
                          className="storybook-btn inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2B1E1A] text-white text-xs font-bold animate-pulse cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop ({recordingSeconds}s)</span>
                        </button>
                      ))}
                  </div>

                  {uploadFile ? (
                    <div className="text-xs font-bold bg-white border-2 border-[#2B1E1A] rounded-xl px-3 py-2">
                      Selected: {uploadFile.name} ({formatBytes(uploadFile.size)})
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#2B1E1A]/70">
                      Photos (JPG, PNG, WebP), Videos (MP4, MOV, WebM), Audio (MP3, M4A, WAV)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    2. Title / Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Sunshine Smile, Red-Gown Concert, Bro Voice Note"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#2B1E1A] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    3. Caption (Shown under photo/video)
                  </label>
                  <textarea
                    rows={3}
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Write a sweet, funny, or playful caption..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#2B1E1A] text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                      Caption Vibe
                    </label>
                    <select
                      value={uploadCaptionStyle}
                      onChange={(e) =>
                        setUploadCaptionStyle(
                          e.target.value as 'sweet' | 'funny' | 'playful'
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-[#2B1E1A] text-xs font-bold bg-white"
                    >
                      <option value="sweet">Sweet ❤️</option>
                      <option value="funny">Funny 😂</option>
                      <option value="playful">Playful ✨</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={uploadOrder}
                      onChange={(e) => setUploadOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border-2 border-[#2B1E1A] text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="storybook-btn w-full py-3.5 rounded-2xl bg-[#F15B48] text-white font-display text-base cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Uploading to Private Storage...' : 'Upload & Save to Website'}
                </button>
              </form>
            </div>

            {/* Right Column: Organised Media Library (Preview, Replace, Edit, Delete) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="scrapbook-card rounded-3xl p-5 bg-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Bro Section', 'Friend Section', 'Background Music', 'Final Surprise'].map(
                    (grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setFilterGroup(grp)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-[#2B1E1A] cursor-pointer ${
                          filterGroup === grp
                            ? 'bg-[#FFC928] text-[#2B1E1A]'
                            : 'bg-[#FFF3D1]/50 text-[#2B1E1A]'
                        }`}
                      >
                        {grp}
                      </button>
                    )
                  )}
                </div>
                <span className="text-xs font-bold text-[#2B1E1A]/70">
                  Showing {filteredMedia.length} file(s)
                </span>
              </div>

              {loadingMedia ? (
                <div className="scrapbook-card rounded-3xl p-12 bg-white text-center">
                  <RefreshCw className="w-7 h-7 animate-spin text-[#F15B48] mx-auto mb-2" />
                  <p className="text-sm font-bold">Loading private media library...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="scrapbook-card rounded-3xl p-10 bg-white text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-[#FF8A32] mx-auto" />
                  <h3 className="font-display text-xl text-[#2B1E1A]">
                    No Files Uploaded in This Section Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2B1E1A]/75 max-w-md mx-auto">
                    Use the upload panel on the left to add Lil Debbie’s photos, the red-gown video, your voice recording, or background music. Meanwhile, the website shows clean placeholders.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredMedia.map((item) => {
                    const secMeta =
                      MEDIA_SECTION_LABELS[item.section as MediaSectionType] ||
                      MEDIA_SECTION_LABELS.bro_photo;
                    return (
                      <div
                        key={item.id}
                        className={`scrapbook-card rounded-2xl overflow-hidden bg-white flex flex-col justify-between ${
                          !item.is_visible ? 'opacity-60' : ''
                        }`}
                      >
                        <div>
                          {/* Media Preview */}
                          <div className="aspect-[4/3] bg-[#FFF3D1] border-b-2 border-[#2B1E1A] relative flex items-center justify-center overflow-hidden">
                            {item.media_type === 'image' && item.signed_url && (
                              <img
                                src={item.signed_url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {item.media_type === 'video' && item.signed_url && (
                              <video
                                src={item.signed_url}
                                controls
                                className="w-full h-full object-cover"
                              />
                            )}
                            {item.media_type === 'audio' && (
                              <div className="p-4 text-center w-full space-y-2">
                                <Music className="w-10 h-10 text-[#F15B48] mx-auto" />
                                {item.signed_url && (
                                  <audio
                                    src={item.signed_url}
                                    controls
                                    className="w-full"
                                  />
                                )}
                              </div>
                            )}

                            <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#FFC928] border border-[#2B1E1A] text-[10px] font-extrabold text-[#2B1E1A]">
                              {secMeta.label}
                            </span>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-display text-base text-[#2B1E1A] truncate">
                                {item.title}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF3D1] border border-[#2B1E1A]">
                                #{item.display_order || 1} • {item.caption_style || 'sweet'}
                              </span>
                            </div>
                            <p className="text-xs text-[#2B1E1A]/80 line-clamp-2">
                              {item.caption || 'No caption added yet.'}
                            </p>
                          </div>
                        </div>

                        {/* Action Bar: Edit Caption/Section, Replace File, Hide/Show, Delete */}
                        <div className="p-3 bg-[#FFF3D1]/60 border-t-2 border-[#2B1E1A] flex flex-wrap items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#2B1E1A] text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-[#FFC928]"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit / Move</span>
                          </button>

                          <label className="px-2.5 py-1.5 rounded-xl bg-[#FF8A32] text-white border border-[#2B1E1A] text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                            <RefreshCw
                              className={`w-3 h-3 ${
                                replacingId === item.id ? 'animate-spin' : ''
                              }`}
                            />
                            <span>
                              {replacingId === item.id ? 'Replacing...' : 'Replace File'}
                            </span>
                            <input
                              type="file"
                              accept={secMeta.acceptedTypes}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleReplaceFile(item, f);
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(item)}
                            title={item.is_visible ? 'Hide from visitors' : 'Show to visitors'}
                            className="p-1.5 rounded-xl bg-white border border-[#2B1E1A] text-[#2B1E1A] cursor-pointer"
                          >
                            {item.is_visible ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-[#F15B48]" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            title="Delete file"
                            className="p-1.5 rounded-xl bg-[#F15B48] text-white border border-[#2B1E1A] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: LETTERS, CAPTIONS, VISIBILITY & AUDIO SETTINGS
            =================================================================== */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveContentConfig} className="space-y-6">
            {/* Section Visibility & Audio Controls */}
            <div className="scrapbook-card rounded-3xl p-6 bg-white space-y-4">
              <h2 className="font-display text-xl text-[#2B1E1A]">
                Section Visibility, Journey & Background Music Settings
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFF3D1]/60 border-2 border-[#2B1E1A] text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentConfig.bro_visible}
                    onChange={(e) =>
                      setContentConfig({ ...contentConfig, bro_visible: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#F15B48]"
                  />
                  <span>Show "Bro Section"</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFF3D1]/60 border-2 border-[#2B1E1A] text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentConfig.friend_visible}
                    onChange={(e) =>
                      setContentConfig({
                        ...contentConfig,
                        friend_visible: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#F15B48]"
                  />
                  <span>Show "Friend Section"</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFF3D1]/60 border-2 border-[#2B1E1A] text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentConfig.require_both_sections_visited}
                    onChange={(e) =>
                      setContentConfig({
                        ...contentConfig,
                        require_both_sections_visited: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#F15B48]"
                  />
                  <span>Unlock Final Surprise Only After Visiting Both Bro & Friend</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFF3D1]/60 border-2 border-[#2B1E1A] text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentConfig.show_password_hint}
                    onChange={(e) =>
                      setContentConfig({
                        ...contentConfig,
                        show_password_hint: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#F15B48]"
                  />
                  <span>Show Subtle Hint on Birthday Password Gate</span>
                </label>

                <div className="sm:col-span-2 p-3 rounded-2xl bg-[#FFF3D1]/60 border-2 border-[#2B1E1A] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold">
                    Background Music Behaviour Across Sections:
                  </span>
                  <select
                    value={contentConfig.music_behavior}
                    onChange={(e) =>
                      setContentConfig({
                        ...contentConfig,
                        music_behavior: e.target.value as 'continue' | 'restart',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl border-2 border-[#2B1E1A] bg-white text-xs font-bold"
                  >
                    <option value="continue">
                      Continue Playing Seamlessly Across Sections
                    </option>
                    <option value="restart">
                      Restart Track When Switching Sections
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bro Section Draft Letter Review */}
            <div className="scrapbook-card rounded-3xl p-6 bg-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl text-[#2B1E1A]">
                    Bro Section — Draft Letter for Your Review
                  </h2>
                  <p className="text-xs text-[#2B1E1A]/75">
                    Drafted from your 8 heartfelt points. You can edit any word below and mark it as approved whenever you are happy with it.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFC928] border-2 border-[#2B1E1A] text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!contentConfig.bro_section.is_draft_for_review}
                    onChange={(e) =>
                      setContentConfig({
                        ...contentConfig,
                        bro_section: {
                          ...contentConfig.bro_section,
                          is_draft_for_review: !e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#F15B48]"
                  />
                  <span>Mark Bro Letter as Approved</span>
                </label>
              </div>

              <textarea
                rows={11}
                value={contentConfig.bro_section.letter_draft}
                onChange={(e) =>
                  setContentConfig({
                    ...contentConfig,
                    bro_section: {
                      ...contentConfig.bro_section,
                      letter_draft: e.target.value,
                    },
                  })
                }
                className="w-full p-4 rounded-2xl border-2 border-[#2B1E1A] bg-[#FFF3D1]/30 text-sm leading-relaxed"
              />
            </div>

            {/* Friend Section Editable Openings & Captions */}
            <div className="scrapbook-card rounded-3xl p-6 bg-white space-y-4">
              <h2 className="font-display text-xl text-[#2B1E1A]">
                Friend Section — Playful Opening & Red-Gown Video Caption
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    Friend Section Opening Line
                  </label>
                  <input
                    type="text"
                    value={contentConfig.friend_section.opening_line}
                    onChange={(e) =>
                      setContentConfig({
                        ...contentConfig,
                        friend_section: {
                          ...contentConfig.friend_section,
                          opening_line: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#2B1E1A] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    Red-Gown Video Suggested Caption
                  </label>
                  <input
                    type="text"
                    value={contentConfig.friend_section.red_gown_caption}
                    onChange={(e) =>
                      setContentConfig({
                        ...contentConfig,
                        friend_section: {
                          ...contentConfig.friend_section,
                          red_gown_caption: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#2B1E1A] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Final Surprise Approved Letter Verification */}
            <div className="scrapbook-card rounded-3xl p-6 bg-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl text-[#2B1E1A]">
                    Final Surprise — Approved Exact Letter (Written Only)
                  </h2>
                  <p className="text-xs text-[#2B1E1A]/75">
                    Pre-loaded with your exact, unchanged approved letter.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContentConfig({
                      ...contentConfig,
                      final_surprise: {
                        ...contentConfig.final_surprise,
                        letter_exact: EXACT_APPROVED_FINAL_SURPRISE_LETTER,
                      },
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#FFF3D1] border-2 border-[#2B1E1A] text-xs font-bold cursor-pointer"
                >
                  Restore Exact Approved Wording
                </button>
              </div>

              <textarea
                rows={10}
                value={contentConfig.final_surprise.letter_exact}
                onChange={(e) =>
                  setContentConfig({
                    ...contentConfig,
                    final_surprise: {
                      ...contentConfig.final_surprise,
                      letter_exact: e.target.value,
                    },
                  })
                }
                className="w-full p-4 rounded-2xl border-2 border-[#2B1E1A] bg-[#FFF3D1]/30 text-sm leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingContent}
                className="storybook-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F15B48] text-white font-display text-lg cursor-pointer disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>
                  {savingContent ? 'Saving Changes...' : 'Save All Text & Audio Settings'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================
            TAB 3: DUAL INDEPENDENT PASSWORDS & SECURITY
            =================================================================== */}
        {activeTab === 'security' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Visitor Birthday Password Card */}
            <div className="scrapbook-card rounded-3xl p-6 bg-white space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC928] border border-[#2B1E1A] text-xs font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>System 1: Visitor Entrance Password</span>
              </div>
              <h3 className="font-display text-xl text-[#2B1E1A]">
                Lil Debbie’s Birthday Gate Password
              </h3>
              <p className="text-xs text-[#2B1E1A]/75 leading-relaxed">
                Currently set to <code>062026</code> (verified server-side via the <code>birthday-gate</code> Edge Function with bcrypt hashing and rate-limiting). Changing this never affects your Admin login.
              </p>

              <form onSubmit={handleUpdateVisitorPassword} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    New Birthday Visitor Password
                  </label>
                  <input
                    type="text"
                    value={newVisitorPassword}
                    onChange={(e) => setNewVisitorPassword(e.target.value)}
                    placeholder="e.g., 062026"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#2B1E1A] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingVisitorPw || !newVisitorPassword.trim()}
                  className="storybook-btn w-full py-3 rounded-xl bg-[#FF8A32] text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {savingVisitorPw
                    ? 'Updating Visitor Password...'
                    : 'Update Birthday Visitor Password'}
                </button>
              </form>
            </div>

            {/* Owner Administrator Password Card */}
            <div className="scrapbook-card rounded-3xl p-6 bg-white space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F15B48] text-white border border-[#2B1E1A] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>System 2: Owner Administrator Login</span>
              </div>
              <h3 className="font-display text-xl text-[#2B1E1A]">
                Your Private Supabase Owner Password
              </h3>
              <p className="text-xs text-[#2B1E1A]/75 leading-relaxed">
                Connected to your Supabase Auth owner account (<code>{ownerEmail}</code>). Changing this updates only your private admin login and never affects Lil Debbie’s birthday gate password.
              </p>

              <form onSubmit={handleUpdateAdminPassword} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    New Administrator Password (min. 6 characters)
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Enter new administrator password"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#2B1E1A] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingAdminPw || newAdminPassword.length < 6}
                  className="storybook-btn w-full py-3 rounded-xl bg-[#F15B48] text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {savingAdminPw
                    ? 'Updating Admin Password...'
                    : 'Update Administrator Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Edit Media Item Caption / Section / Order */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="scrapbook-card rounded-3xl max-w-md w-full p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-[#2B1E1A]">
                Edit Media Details & Section
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-[#FFF3D1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                  Website Section
                </label>
                <select
                  value={editingItem.section || 'bro_photo'}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      section: e.target.value as MediaSectionType,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#2B1E1A] text-xs font-bold bg-[#FFF3D1]/50"
                >
                  {(Object.keys(MEDIA_SECTION_LABELS) as MediaSectionType[]).map((k) => (
                    <option key={k} value={k}>
                      {MEDIA_SECTION_LABELS[k].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#2B1E1A] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                  Caption
                </label>
                <textarea
                  rows={3}
                  value={editingItem.caption}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, caption: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#2B1E1A] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    Caption Vibe
                  </label>
                  <select
                    value={editingItem.caption_style || 'sweet'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        caption_style: e.target.value as 'sweet' | 'funny' | 'playful',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#2B1E1A] text-xs font-bold bg-white"
                  >
                    <option value="sweet">Sweet ❤️</option>
                    <option value="funny">Funny 😂</option>
                    <option value="playful">Playful ✨</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B1E1A] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.display_order || 1}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        display_order: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#2B1E1A] text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border-2 border-[#2B1E1A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="storybook-btn px-5 py-2 rounded-xl bg-[#F15B48] text-white text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
