import React, { useEffect, useState } from 'react';
import {
  Heart,
  Sparkles,
  Star,
  Lock,
  Unlock,
  ArrowLeft,
  Camera,
  Film,
  Smile,
  MessageCircleHeart,
  Gift,
  CheckCircle2,
  AlertCircle,
  X,
  ZoomIn,
  ShieldCheck,
  Sun,
  PhoneCall,
} from 'lucide-react';
import {
  DEFAULT_BIRTHDAY_CONTENT,
  EXACT_APPROVED_FINAL_SURPRISE_LETTER,
  mergeBirthdayContent,
  verifyBirthdayPasswordWithEdge,
  fetchVisitorSessionContent,
  type BirthdayContentConfig,
  type MediaItem,
} from './lib/supabase';
import {
  FestiveBuntingBanner,
  IllustratedBirthdayCake,
  IllustratedBalloons,
  HiddenSurpriseSticker,
  FloatingBirthdayDecor,
} from './components/BirthdayIllustrations';
import {
  BackgroundMusicController,
  CustomVoiceNotePlayer,
} from './components/AudioPlayers';
import { AdminDashboard } from './components/AdminDashboard';

type JourneyStage = 'gate' | 'home' | 'bro' | 'friend' | 'surprise' | 'admin';

const VISITOR_TOKEN_STORAGE_KEY = 'lil_debbie_visitor_session_token';
const VISITED_BRO_KEY = 'lil_debbie_visited_bro';
const VISITED_FRIEND_KEY = 'lil_debbie_visited_friend';

const BRO_PLACEHOLDER_SLOTS = [
  {
    id: 'bro-ph-1',
    vibe: 'Sweet ❤️',
    rotation: '-rotate-2',
    tapeColor: 'bg-[#FFC928]',
    caption:
      'That effortless smile that warms up the whole room before you even say a word. ❤️',
  },
  {
    id: 'bro-ph-2',
    vibe: 'Funny 😂',
    rotation: 'rotate-2',
    tapeColor: 'bg-[#F15B48] text-white',
    caption:
      'The exact face of someone pretending she is completely innocent after causing chaos. 😂',
  },
  {
    id: 'bro-ph-3',
    vibe: 'Playful ✨',
    rotation: '-rotate-1',
    tapeColor: 'bg-[#FF8A32] text-white',
    caption:
      'Growing stronger, wiser, and more radiant every single year—proud of you always, sis! ✨',
  },
];

const FRIEND_EVERYDAY_PLACEHOLDERS = [
  {
    id: 'fr-ev-1',
    badge: 'New Hairstyle Alert 💇🏽‍♀️',
    rotation: '-rotate-1',
    caption:
      'Reserved for your unprompted hairstyle reveal updates that always brighten my phone screen.',
  },
  {
    id: 'fr-ev-2',
    badge: 'After-Work Tired Face 😮‍💨❤️',
    rotation: 'rotate-2',
    caption:
      'Reserved for those cute "I am exhausted" everyday updates you send without me even asking.',
  },
];

export default function App() {
  const [stage, setStage] = useState<JourneyStage>(() => {
    if (window.location.hash === '#admin') return 'admin';
    return 'gate';
  });

  const [visitorAuthenticated, setVisitorAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Password Gate State
  const [passwordInput, setPasswordInput] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [gateError, setGateError] = useState('');
  const [rateLimitedInfo, setRateLimitedInfo] = useState<string | null>(null);

  // Approved Birthday Content & Private Signed Media
  const [content, setContent] = useState<BirthdayContentConfig>(
    DEFAULT_BIRTHDAY_CONTENT
  );
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Section Exploration Tracking for Final Surprise Unlock
  const [visitedBro, setVisitedBro] = useState<boolean>(() => {
    return sessionStorage.getItem(VISITED_BRO_KEY) === 'true';
  });
  const [visitedFriend, setVisitedFriend] = useState<boolean>(() => {
    return sessionStorage.getItem(VISITED_FRIEND_KEY) === 'true';
  });

  // Lightbox Modal for Click-to-Enlarge Photos & Videos
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  const applyGatePayload = (payload: {
    site_settings?: any;
    media_items?: MediaItem[];
  }) => {
    if (payload.site_settings?.birthday_content) {
      setContent(mergeBirthdayContent(payload.site_settings.birthday_content));
    }
    if (Array.isArray(payload.media_items)) {
      setMediaItems(payload.media_items);
    }
  };

  // Validate existing short-lived visitor token on page load
  const restoreOrRefreshVisitorSession = async () => {
    const savedToken = sessionStorage.getItem(VISITOR_TOKEN_STORAGE_KEY);
    if (!savedToken) {
      setCheckingSession(false);
      return;
    }

    try {
      const res = await fetchVisitorSessionContent(savedToken);
      if (res.authenticated) {
        applyGatePayload(res);
        setVisitorAuthenticated(true);
        if (stage === 'gate') {
          setStage('home');
        }
      } else {
        sessionStorage.removeItem(VISITOR_TOKEN_STORAGE_KEY);
        setVisitorAuthenticated(false);
      }
    } catch {
      // Keep gate closed on network error
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    restoreOrRefreshVisitorSession();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setVerifyingPassword(true);
    setGateError('');
    setRateLimitedInfo(null);

    try {
      const res = await verifyBirthdayPasswordWithEdge(passwordInput.trim());

      if (!res.authenticated) {
        if (res.rate_limited) {
          const mins = Math.ceil((res.retry_after_seconds || 900) / 60);
          setRateLimitedInfo(
            `Too many failed attempts. Please wait about ${mins} minutes before trying again.`
          );
        } else {
          const rem =
            typeof res.remaining_attempts === 'number'
              ? ` (${res.remaining_attempts} attempt${
                  res.remaining_attempts === 1 ? '' : 's'
                } remaining)`
              : '';
          setGateError(
            `${res.error || "Hmm, that's not the birthday password!"}${rem}`
          );
        }
        return;
      }

      if (res.visitor_token) {
        sessionStorage.setItem(VISITOR_TOKEN_STORAGE_KEY, res.visitor_token);
      }
      applyGatePayload(res);
      setVisitorAuthenticated(true);
      setPasswordInput('');
      setStage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setGateError('Unable to verify password right now. Please try again.');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const navigateToSection = (nextStage: JourneyStage) => {
    if (nextStage === 'bro') {
      setVisitedBro(true);
      sessionStorage.setItem(VISITED_BRO_KEY, 'true');
    } else if (nextStage === 'friend') {
      setVisitedFriend(true);
      sessionStorage.setItem(VISITED_FRIEND_KEY, 'true');
    }
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Organised media getters (all backed by private signed URLs)
  const backgroundMusicItem =
    mediaItems.find((m) => m.section === 'background_music') || null;
  const broPhotos = mediaItems.filter((m) => m.section === 'bro_photo');
  const broVoiceNote = mediaItems.find((m) => m.section === 'bro_voice') || null;
  const redGownVideo =
    mediaItems.find((m) => m.section === 'friend_red_gown_video') || null;
  const morningVoiceNotes = mediaItems.filter(
    (m) => m.section === 'friend_morning_voice'
  );
  const everydayUpdates = mediaItems.filter(
    (m) => m.section === 'friend_everyday_media'
  );
  const privateGalleryItems = mediaItems.filter(
    (m) => m.section === 'friend_private_gallery'
  );

  const isSurpriseUnlocked =
    !content.require_both_sections_visited || (visitedBro && visitedFriend);

  // ===========================================================================
  // OWNER ADMIN DASHBOARD VIEW
  // ===========================================================================
  if (stage === 'admin') {
    return (
      <AdminDashboard
        onBackToSite={() => {
          window.location.hash = '';
          setStage(visitorAuthenticated ? 'home' : 'gate');
        }}
        onDataUpdated={() => {
          if (visitorAuthenticated) {
            restoreOrRefreshVisitorSession();
          }
        }}
      />
    );
  }

  // ===========================================================================
  // STAGE 1: BIRTHDAY PASSWORD SCREEN
  // ===========================================================================
  if (!visitorAuthenticated || stage === 'gate') {
    return (
      <div className="min-h-screen bg-[#FFC928] relative overflow-hidden flex flex-col justify-between">
        <FestiveBuntingBanner />
        <FloatingBirthdayDecor />

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md scrapbook-card rounded-[32px] bg-[#FFF3D1] p-6 sm:p-8 text-center space-y-6">
            {/* Illustrated Birthday Cake Header */}
            <div className="-mt-4">
              <IllustratedBirthdayCake className="w-44 h-44 sm:w-52 sm:h-52" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F15B48] text-white border-2 border-[#2B1E1A] text-xs font-extrabold tracking-wide shadow-[2px_2px_0px_#2B1E1A]">
                <Sparkles className="w-3.5 h-3.5" />
                PRIVATE BIRTHDAY EXPERIENCE
              </span>

              <h1 className="font-display text-3xl sm:text-4xl text-[#2B1E1A] leading-tight pt-1">
                Something Special For Lil Debbie ❤️
              </h1>

              <p className="text-sm text-[#2B1E1A]/85 leading-relaxed">
                Enter your special birthday passcode below to unlock your birthday surprise.
              </p>

              {content.show_password_hint && content.password_hint_text && (
                <p className="text-xs font-bold text-[#F15B48] italic pt-1">
                  Hint: “{content.password_hint_text}”
                </p>
              )}
            </div>

            {gateError && (
              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#F15B48] text-xs font-bold text-[#F15B48] flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gateError}</span>
              </div>
            )}

            {rateLimitedInfo && (
              <div className="p-3.5 rounded-2xl bg-[#F15B48] text-white border-2 border-[#2B1E1A] text-xs font-bold">
                {rateLimitedInfo}
              </div>
            )}

            {checkingSession ? (
              <div className="py-4 text-xs font-bold text-[#2B1E1A]">
                Checking your birthday invitation...
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter birthday passcode..."
                    aria-label="Birthday Passcode"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-[#2B1E1A] text-center font-display text-xl tracking-widest text-[#2B1E1A] placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-4 focus:ring-[#FF8A32]/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingPassword}
                  className="storybook-btn w-full py-4 rounded-2xl bg-[#F15B48] text-white font-display text-xl tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Gift className="w-5 h-5" />
                  <span>
                    {verifyingPassword
                      ? 'Unlocking Your Surprise...'
                      : 'Open My Birthday Surprise ❤️'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </main>

        {/* Discrete Footer with Owner Admin Access */}
        <footer className="relative z-10 py-4 px-4 text-center flex items-center justify-between max-w-4xl mx-auto w-full text-xs font-bold text-[#2B1E1A]/80">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protected Private Experience
          </span>
          <button
            type="button"
            onClick={() => setStage('admin')}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF3D1] border border-[#2B1E1A] text-[11px] font-bold hover:bg-white cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Owner Admin</span>
          </button>
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // AUTHENTICATED VISITOR EXPERIENCE (HOMEPAGE, BRO, FRIEND, FINAL SURPRISE)
  // ===========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF3D1] text-[#2B1E1A] relative overflow-x-hidden">
      {/* Persistent Top Sticky Navigation & User-Controlled Background Music Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FFF3D1]/90 border-b-2 border-[#2B1E1A] px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {stage !== 'home' ? (
              <button
                type="button"
                onClick={() => navigateToSection('home')}
                className="storybook-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFC928] text-xs sm:text-sm font-extrabold text-[#2B1E1A] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Homepage</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F15B48] text-white border-2 border-[#2B1E1A] text-xs font-extrabold shadow-[2px_2px_0px_#2B1E1A]">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Lil Debbie’s Day</span>
              </span>
            )}

            {/* Quick Section Pills */}
            <div className="hidden md:flex items-center gap-1.5 ml-2">
              {content.bro_visible && (
                <button
                  type="button"
                  onClick={() => navigateToSection('bro')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-[#2B1E1A] cursor-pointer transition ${
                    stage === 'bro'
                      ? 'bg-[#FF8A32] text-white'
                      : 'bg-white text-[#2B1E1A] hover:bg-[#FFC928]'
                  }`}
                >
                  Bro Wishes {visitedBro ? '✓' : ''}
                </button>
              )}
              {content.friend_visible && (
                <button
                  type="button"
                  onClick={() => navigateToSection('friend')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-[#2B1E1A] cursor-pointer transition ${
                    stage === 'friend'
                      ? 'bg-[#F15B48] text-white'
                      : 'bg-white text-[#2B1E1A] hover:bg-[#FFC928]'
                  }`}
                >
                  Friend Wishes {visitedFriend ? '✓' : ''}
                </button>
              )}
              {content.final_surprise_visible && isSurpriseUnlocked && (
                <button
                  type="button"
                  onClick={() => navigateToSection('surprise')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-[#2B1E1A] cursor-pointer transition ${
                    stage === 'surprise'
                      ? 'bg-[#F15B48] text-white'
                      : 'bg-[#FFC928] text-[#2B1E1A]'
                  }`}
                >
                  Final Surprise ❤️
                </button>
              )}
            </div>
          </div>

          {/* User-Controlled Background Music Player (Never Autoplays with Sound) */}
          <div className="flex items-center gap-2">
            <BackgroundMusicController
              musicItem={backgroundMusicItem}
              musicTitle={content.music_title}
              musicBehavior={content.music_behavior}
              currentSection={stage}
            />
          </div>
        </div>
      </header>

      {/* =====================================================================
          STAGE 2: HOMEPAGE (COLOURFUL ILLUSTRATED BIRTHDAY SCENE — NO PHOTO)
          ===================================================================== */}
      {stage === 'home' && (
        <main className="flex-1 bg-[#FFC928] relative overflow-hidden pb-16">
          <FestiveBuntingBanner />
          <FloatingBirthdayDecor />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 relative z-10">
            {/* Hero Diorama Container */}
            <div className="bg-[#FFF3D1] border-3 border-[#2B1E1A] rounded-[40px] p-6 sm:p-10 md:p-12 shadow-[8px_8px_0px_#2B1E1A] relative overflow-hidden">
              {/* Side Floating Balloons on larger screens */}
              <div className="hidden sm:block absolute top-6 left-4">
                <IllustratedBalloons side="left" />
              </div>
              <div className="hidden sm:block absolute top-6 right-4">
                <IllustratedBalloons side="right" />
              </div>

              {/* Centerpiece Illustrated Birthday Cake (Never her photo) */}
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF8A32] text-white border-2 border-[#2B1E1A] text-xs font-extrabold shadow-[2px_2px_0px_#2B1E1A] mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CELEBRATING YOU TODAY & ALWAYS</span>
                </div>

                <IllustratedBirthdayCake className="w-56 h-56 sm:w-72 sm:h-72 my-2" />

                {/* Approved Headline */}
                <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-[#2B1E1A] leading-[1.08] mt-2 max-w-2xl">
                  {content.homepage.headline}
                </h1>

                {/* Approved Body Copy */}
                <div className="mt-6 max-w-xl mx-auto space-y-4 text-base sm:text-[17px] text-[#2B1E1A] leading-[1.55] font-medium">
                  <p>{content.homepage.paragraph_1}</p>
                  <p>{content.homepage.paragraph_2}</p>
                  <p className="font-bold text-[#F15B48] text-lg">
                    {content.homepage.paragraph_3}
                  </p>
                </div>

                {/* Two Approved Interactive Choice Buttons */}
                <div className="mt-8 w-full max-w-xl grid sm:grid-cols-2 gap-4">
                  {content.bro_visible && (
                    <button
                      type="button"
                      onClick={() => navigateToSection('bro')}
                      className="storybook-btn group py-4 px-6 rounded-2xl bg-[#FF8A32] text-white font-display text-lg sm:text-xl flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition" />
                      <span>{content.homepage.bro_button_label}</span>
                    </button>
                  )}

                  {content.friend_visible && (
                    <button
                      type="button"
                      onClick={() => navigateToSection('friend')}
                      className="storybook-btn group py-4 px-6 rounded-2xl bg-[#F15B48] text-white font-display text-lg sm:text-xl flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Smile className="w-5 h-5 group-hover:rotate-12 transition" />
                      <span>{content.homepage.friend_button_label}</span>
                    </button>
                  )}
                </div>

                {/* Playful Hidden Birthday Mini-Note */}
                <div className="mt-6">
                  <HiddenSurpriseSticker
                    badgeLabel="Tap This Birthday Star for a Little Secret ⭐"
                    secretMessage="Psst... make sure you visit BOTH 'Wishes from your Bro' and 'Wishes from your Friend'—something very special unlocks at the end once you've seen both! ❤️"
                    variant="sunshine"
                  />
                </div>

                {/* Final Surprise Unlock Status Box */}
                {content.final_surprise_visible && (
                  <div className="mt-6 w-full max-w-lg rounded-3xl border-2 border-[#2B1E1A] bg-white p-5 shadow-[4px_4px_0px_#2B1E1A]">
                    {isSurpriseUnlocked ? (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC928] border border-[#2B1E1A] text-xs font-extrabold">
                          <Unlock className="w-3.5 h-3.5 text-[#F15B48]" />
                          <span>FINAL SURPRISE UNLOCKED!</span>
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl text-[#2B1E1A]">
                          One Last Letter Is Waiting For You ❤️
                        </h3>
                        <p className="text-xs sm:text-sm text-[#2B1E1A]/80">
                          You’ve explored both chapters. Whenever you’re ready, open your final birthday surprise.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigateToSection('surprise')}
                          className="storybook-btn w-full py-3.5 px-6 rounded-2xl bg-[#F15B48] text-white font-display text-lg cursor-pointer"
                        >
                          Read Your Final Surprise Letter ❤️
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-[#2B1E1A]/80">
                          <Lock className="w-4 h-4 text-[#F15B48]" />
                          <span>FINAL SURPRISE LOCKED</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#2B1E1A]/75">
                          Explore both <strong>Wishes from your Bro</strong>{' '}
                          {visitedBro ? '✅' : '⬜'} and{' '}
                          <strong>Wishes from your Friend</strong>{' '}
                          {visitedFriend ? '✅' : '⬜'} first to unlock your Final Surprise letter!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          STAGE 3: BRO SECTION (HEARTFELT, AFFECTIONATE, SCRAPBOOK GALLERY & VOICE)
          ===================================================================== */}
      {stage === 'bro' && (
        <main className="flex-1 bg-[#FFF3D1] relative pb-20">
          <div className="bg-[#FF8A32] border-b-2 border-[#2B1E1A] py-10 px-4 text-center text-white relative overflow-hidden">
            <div className="max-w-3xl mx-auto space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFC928] text-[#2B1E1A] border-2 border-[#2B1E1A] text-xs font-extrabold shadow-[2px_2px_0px_#2B1E1A]">
                <Heart className="w-3.5 h-3.5 fill-[#F15B48] text-[#F15B48]" />
                <span>CHAPTER ONE • WISHES FROM YOUR BRO</span>
              </span>
              <h1 className="font-display text-3xl sm:text-5xl text-white drop-shadow-[2px_2px_0px_#2B1E1A]">
                {content.bro_section.opening_title}
              </h1>
              <p className="text-sm sm:text-base text-white/95 max-w-xl mx-auto font-medium">
                {content.bro_section.opening_subtitle}
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
            {/* Heartfelt Letter Card */}
            <section className="scrapbook-card rounded-[32px] p-6 sm:p-10 bg-white relative">
              <div className="w-28 h-5 bg-[#FFC928] border-2 border-[#2B1E1A] -rotate-2 mx-auto -mt-9 mb-6" />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b-2 border-dashed border-[#2B1E1A]/20">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#F15B48] text-white border-2 border-[#2B1E1A] flex items-center justify-center">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl text-[#2B1E1A]">
                      A Letter From Your Big Bro
                    </h2>
                    <span className="text-xs text-[#2B1E1A]/70 font-medium">
                      For My Sister, Lil Debbie ❤️
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-base sm:text-[17px] text-[#2B1E1A] leading-[1.65] whitespace-pre-line font-medium">
                {content.bro_section.letter_draft}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-dashed border-[#2B1E1A]/20 flex items-center justify-between">
                <span className="font-handwriting text-2xl sm:text-3xl font-bold text-[#F15B48]">
                  Always in your corner, Your Bro ❤️
                </span>
                <Star className="w-6 h-6 fill-[#FFC928] text-[#2B1E1A]" />
              </div>
            </section>

            {/* Scrapbook-Inspired Individual Photographs Gallery */}
            <section className="space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC928] border-2 border-[#2B1E1A] text-xs font-extrabold">
                  <Camera className="w-3.5 h-3.5" />
                  <span>SCRAPBOOK MEMORIES</span>
                </span>
                <h2 className="font-display text-2xl sm:text-4xl text-[#2B1E1A]">
                  Snapshots of My Favourite Sister 📸
                </h2>
                <p className="text-xs sm:text-sm text-[#2B1E1A]/80 max-w-lg mx-auto">
                  Tap any photograph to open it full-screen.
                </p>
              </div>

              {broPhotos.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 pt-2">
                  {broPhotos.map((photo, idx) => {
                    const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
                    const rot = rotations[idx % rotations.length];
                    const vibeColors = {
                      sweet: 'bg-[#F15B48] text-white',
                      funny: 'bg-[#FFC928] text-[#2B1E1A]',
                      playful: 'bg-[#FF8A32] text-white',
                    };
                    const vibeLabels = {
                      sweet: 'Sweet ❤️',
                      funny: 'Funny 😂',
                      playful: 'Playful ✨',
                    };
                    return (
                      <div
                        key={photo.id}
                        onClick={() => setLightboxItem(photo)}
                        className={`scrapbook-card rounded-3xl p-4 bg-white cursor-pointer ${rot}`}
                      >
                        <div className="w-20 h-4 bg-[#FFC928]/90 border border-[#2B1E1A] mx-auto -mt-6 mb-3" />
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#FFF3D1] border-2 border-[#2B1E1A] relative group">
                          {photo.signed_url ? (
                            <img
                              src={photo.signed_url}
                              alt={photo.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                              Loading signed photo...
                            </div>
                          )}
                          <span
                            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-[#2B1E1A] ${
                              vibeColors[photo.caption_style || 'sweet']
                            }`}
                          >
                            {vibeLabels[photo.caption_style || 'sweet']}
                          </span>
                          <div className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 border border-[#2B1E1A] text-[#2B1E1A]">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="pt-3.5 px-1 text-center">
                          <h3 className="font-display text-base text-[#2B1E1A]">
                            {photo.title}
                          </h3>
                          {photo.caption && (
                            <p className="font-handwriting text-xl text-[#2B1E1A]/90 mt-1 leading-snug">
                              “{photo.caption}”
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-6 pt-2">
                  {BRO_PLACEHOLDER_SLOTS.map((slot) => (
                    <div
                      key={slot.id}
                      className={`scrapbook-card rounded-3xl p-4 bg-white ${slot.rotation}`}
                    >
                      <div
                        className={`w-20 h-4 ${slot.tapeColor} border border-[#2B1E1A] mx-auto -mt-6 mb-3`}
                      />
                      <div className="aspect-[4/5] rounded-2xl bg-[#FFF3D1] border-2 border-dashed border-[#2B1E1A]/60 flex flex-col items-center justify-center p-5 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFC928] border-2 border-[#2B1E1A] flex items-center justify-center mb-3 shadow-[2px_2px_0px_#2B1E1A]">
                          <Camera className="w-6 h-6 text-[#2B1E1A]" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#2B1E1A] text-[11px] font-extrabold mb-2">
                          {slot.vibe}
                        </span>
                        <p className="text-xs font-bold text-[#2B1E1A]/80">
                          Individual Photo Frame Ready
                        </p>
                        <p className="text-[11px] text-[#2B1E1A]/60 mt-1">
                          (Upload via Owner Admin Dashboard)
                        </p>
                      </div>
                      <p className="font-handwriting text-xl text-center text-[#2B1E1A] mt-3 leading-snug">
                        “{slot.caption}”
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Bro's Voice Recording Player */}
            <section className="max-w-2xl mx-auto">
              <CustomVoiceNotePlayer
                item={broVoiceNote}
                heading={content.bro_section.voice_note_heading}
                subtitle={content.bro_section.voice_note_caption}
                placeholderMessage="Your personal voice recording for Lil Debbie will play right here once uploaded in the Owner Admin Dashboard."
                accentColor="coral"
              />
            </section>

            {/* Hidden Interactive Note inside Bro Section */}
            <HiddenSurpriseSticker
              badgeLabel="Tap for a Extra Big-Bro Reminder 💌"
              secretMessage="No matter how busy life gets or where we both are, you will always have a brother who is proud of your heart and ready to listen whenever you call. ❤️"
              variant="orange"
            />

            {/* Warm Closing Card & Navigation */}
            <section className="scrapbook-card rounded-3xl p-6 sm:p-8 bg-[#FFC928] text-center space-y-5">
              <p className="font-display text-xl sm:text-2xl text-[#2B1E1A] max-w-xl mx-auto">
                {content.bro_section.closing_message}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigateToSection('home')}
                  className="storybook-btn px-5 py-3 rounded-2xl bg-white text-[#2B1E1A] font-display text-base flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Homepage</span>
                </button>

                {content.friend_visible && (
                  <button
                    type="button"
                    onClick={() => navigateToSection('friend')}
                    className="storybook-btn px-5 py-3 rounded-2xl bg-[#F15B48] text-white font-display text-base flex items-center gap-2 cursor-pointer"
                  >
                    <Smile className="w-4 h-4" />
                    <span>Next: Wishes from your Friend →</span>
                  </button>
                )}

                {content.final_surprise_visible && isSurpriseUnlocked && (
                  <button
                    type="button"
                    onClick={() => navigateToSection('surprise')}
                    className="storybook-btn px-5 py-3 rounded-2xl bg-[#2B1E1A] text-[#FFC928] font-display text-base flex items-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Open Final Surprise ❤️</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* =====================================================================
          STAGE 4: FRIEND SECTION (PLAYFUL TEASING, RED-GOWN VIDEO, JOKES, CARING PROMISE & PRIVATE GALLERY)
          ===================================================================== */}
      {stage === 'friend' && (
        <main className="flex-1 bg-[#FFF3D1] relative pb-20">
          {/* Playful Header */}
          <div className="bg-[#F15B48] border-b-2 border-[#2B1E1A] py-10 px-4 text-center text-white">
            <div className="max-w-3xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFC928] text-[#2B1E1A] border-2 border-[#2B1E1A] text-xs font-extrabold shadow-[2px_2px_0px_#2B1E1A]">
                <Smile className="w-3.5 h-3.5" />
                <span>CHAPTER TWO • WISHES FROM YOUR FRIEND</span>
              </span>
              <h1 className="font-display text-3xl sm:text-5xl text-white drop-shadow-[2px_2px_0px_#2B1E1A]">
                {content.friend_section.opening_line}
              </h1>
              <p className="text-sm sm:text-base text-white/95 max-w-xl mx-auto font-medium">
                {content.friend_section.opening_subtext}
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
            {/* Scattered Compliment #1: Fair Skin, Eyes & Small Pointy Nose */}
            <div className="scrapbook-card rounded-3xl p-5 sm:p-6 bg-[#FFC928] -rotate-1 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#2B1E1A] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#2B1E1A]">
                <Sparkles className="w-6 h-6 text-[#F15B48]" />
              </div>
              <p className="text-sm sm:text-base font-bold text-[#2B1E1A] leading-relaxed">
                Before I even start roasting you today, let’s give credit where it’s due: between that glowing fair skin, those captivating eyes of yours, and that cute small pointy nose I love teasing you about, you really do know how to look effortlessly stunning. 😍✨
              </p>
            </div>

            {/* 1. The Funny Red-Gown Video Showcase */}
            <section className="scrapbook-card rounded-[32px] p-6 sm:p-8 bg-white space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#F15B48] text-white border border-[#2B1E1A] text-xs font-extrabold">
                    HALL OF FAME MOMENT 💃🏽
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl text-[#2B1E1A] mt-2">
                    {content.friend_section.red_gown_heading}
                  </h2>
                </div>
              </div>

              {redGownVideo?.signed_url ? (
                <div className="rounded-2xl overflow-hidden bg-black border-2 border-[#2B1E1A] shadow-[4px_4px_0px_#2B1E1A]">
                  <video
                    src={redGownVideo.signed_url}
                    controls
                    playsInline
                    className="w-full max-h-[520px] object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="rounded-3xl bg-[#FFF3D1] border-2 border-dashed border-[#2B1E1A] p-8 sm:p-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#F15B48] text-white border-2 border-[#2B1E1A] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#2B1E1A]">
                    <Film className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-xl text-[#2B1E1A]">
                    Red-Gown Dancing Video Slot Ready
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2B1E1A]/80 max-w-md mx-auto">
                    Reserved exclusively for the actual video of you in your red gown singing and dancing while a completely different song played in the background!
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#FFF3D1] border-2 border-[#2B1E1A] text-center">
                <p className="font-handwriting text-2xl sm:text-3xl font-bold text-[#2B1E1A]">
                  “{redGownVideo?.caption || content.friend_section.red_gown_caption}”
                </p>
              </div>
            </section>

            {/* 2. Two-Column Teasing Row: "Which Hand?" Tiny Hands Joke + Compliment on Smile & Laugh */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="scrapbook-card rounded-3xl p-6 bg-white rotate-1 space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[#FF8A32] text-white border border-[#2B1E1A] text-xs font-extrabold">
                  SERIOUS QUESTION 🥊😂
                </span>
                <h3 className="font-display text-2xl text-[#2B1E1A]">
                  {content.friend_section.tiny_hands_title}
                </h3>
                <p className="text-sm sm:text-base text-[#2B1E1A]/90 leading-relaxed font-medium">
                  {content.friend_section.tiny_hands_body}
                </p>
                <HiddenSurpriseSticker
                  badgeLabel='Tap to Hear My Verdict on Your "Punches" 😂'
                  secretMessage='"Which hand?" — Still undefeated! Those tiny hands were built for holding cake, not fighting anybody. 😂❤️'
                  variant="coral"
                />
              </div>

              <div className="scrapbook-card rounded-3xl p-6 bg-[#FFF3D1] -rotate-1 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FFC928] text-[#2B1E1A] border border-[#2B1E1A] text-xs font-extrabold">
                    MY FAVOURITE SOUND 😍
                  </span>
                  <h3 className="font-display text-2xl text-[#2B1E1A]">
                    That Smile, That Mouth & That Contagious Laugh
                  </h3>
                  <p className="text-sm sm:text-base text-[#2B1E1A]/90 leading-relaxed font-medium">
                    Even when you’re pretending to be tough, it takes about three seconds before that sweet mouth of yours curves into a smile. And your laugh? Honestly, your laugh is so contagious that the moment you start laughing, I can’t help laughing right along with you.
                  </p>
                </div>
                <div className="pt-2 text-right font-handwriting text-2xl text-[#F15B48] font-bold">
                  10/10 smile every single time ❤️
                </div>
              </div>
            </div>

            {/* 3. Her 6:00 AM "Hi Baby" Morning Voice Notes */}
            <section className="scrapbook-card rounded-[32px] p-6 sm:p-8 bg-white space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFC928] border-2 border-[#2B1E1A] flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#2B1E1A]">
                  <Sun className="w-6 h-6 text-[#2B1E1A]" />
                </div>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-[#2B1E1A]">
                    {content.friend_section.morning_voice_heading}
                  </h2>
                  <p className="text-sm sm:text-base text-[#2B1E1A]/85 mt-2 leading-relaxed font-medium">
                    {content.friend_section.morning_voice_body}
                  </p>
                </div>
              </div>

              {morningVoiceNotes.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {morningVoiceNotes.map((vn) => (
                    <CustomVoiceNotePlayer
                      key={vn.id}
                      item={vn}
                      heading={vn.title || 'Morning "Hi Baby" Voice Note ☀️'}
                      subtitle={
                        vn.caption ||
                        'Waking up to your sweet morning update wishing me a nice day.'
                      }
                      placeholderMessage=""
                      accentColor="sunshine"
                    />
                  ))}
                </div>
              ) : (
                <CustomVoiceNotePlayer
                  item={null}
                  heading='Morning "Hi Baby" Voice Note Slot ☀️'
                  subtitle='Your 6:00 AM "Hi baby" morning check-ins wishing me a nice day.'
                  placeholderMessage="Upload one or more of her morning voice notes in the Owner Admin Dashboard to play them right here."
                  accentColor="sunshine"
                />
              )}
            </section>

            {/* 4. Spontaneous Everyday Updates (New Hairstyles, Tired Face, Daily Glimpses) */}
            <section className="scrapbook-card rounded-[32px] p-6 sm:p-8 bg-white space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-[#FF8A32] text-white border border-[#2B1E1A] text-xs font-extrabold">
                  BEST BEHAVIOUR AWARD 🏆
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-[#2B1E1A] pt-1">
                  {content.friend_section.spontaneous_updates_heading}
                </h2>
                <p className="text-sm sm:text-base text-[#2B1E1A]/85 leading-relaxed font-medium">
                  {content.friend_section.spontaneous_updates_body}
                </p>
              </div>

              {everydayUpdates.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {everydayUpdates.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setLightboxItem(item)}
                      className={`scrapbook-card rounded-3xl p-4 bg-[#FFF3D1] cursor-pointer ${
                        idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
                      }`}
                    >
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border-2 border-[#2B1E1A]">
                        {item.media_type === 'video' ? (
                          <video
                            src={item.signed_url || ''}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={item.signed_url || ''}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h4 className="font-display text-base text-[#2B1E1A] mt-3">
                        {item.title}
                      </h4>
                      {item.caption && (
                        <p className="font-handwriting text-xl text-[#2B1E1A]/90 mt-0.5">
                          “{item.caption}”
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {FRIEND_EVERYDAY_PLACEHOLDERS.map((slot) => (
                    <div
                      key={slot.id}
                      className={`scrapbook-card rounded-2xl p-5 bg-[#FFF3D1] ${slot.rotation} space-y-2`}
                    >
                      <span className="inline-block px-2.5 py-1 rounded-full bg-white border border-[#2B1E1A] text-xs font-extrabold">
                        {slot.badge}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-[#2B1E1A]/85">
                        {slot.caption}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 5. Tasteful Figure Compliment & The Backside Teasing Joke + Official Video Request */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="scrapbook-card rounded-3xl p-6 bg-[#FFC928] -rotate-1 space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-white text-[#2B1E1A] border border-[#2B1E1A] text-xs font-extrabold">
                  FACT CHECK ✔️
                </span>
                <h3 className="font-display text-2xl text-[#2B1E1A]">
                  {content.friend_section.backside_joke_title}
                </h3>
                <p className="text-sm sm:text-base text-[#2B1E1A] leading-relaxed font-medium">
                  {content.friend_section.backside_joke_body}
                </p>
              </div>

              <div className="scrapbook-card rounded-3xl p-6 bg-white rotate-1 space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[#F15B48] text-white border border-[#2B1E1A] text-xs font-extrabold">
                  OFFICIAL REQUEST 📜
                </span>
                <h3 className="font-display text-2xl text-[#2B1E1A]">
                  {content.friend_section.official_request_title}
                </h3>
                <p className="text-sm sm:text-base text-[#2B1E1A]/90 leading-relaxed font-medium">
                  {content.friend_section.official_request_body}
                </p>
              </div>
            </div>

            {/* 6. Caring Message About Calling on Difficult Days (Warm, Non-Guilt-Inducing) */}
            <section className="scrapbook-card rounded-[32px] p-6 sm:p-8 bg-[#FFF3D1] border-3 border-[#2B1E1A] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F15B48] text-white border-2 border-[#2B1E1A] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#2B1E1A]">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-[#2B1E1A]">
                  {content.friend_section.difficult_day_title}
                </h2>
              </div>
              <p className="text-base sm:text-[17px] text-[#2B1E1A] leading-[1.65] font-medium">
                {content.friend_section.difficult_day_body}
              </p>
            </section>

            {/* 7. Private Intimate-But-Non-Nude Photo & Video Gallery (Protected by Signed URLs) */}
            <section className="scrapbook-card rounded-[32px] p-6 sm:p-8 bg-white space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2B1E1A] text-[#FFC928] text-xs font-extrabold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PRIVATE SIGNED-URL VAULT</span>
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl text-[#2B1E1A] mt-2">
                    {content.friend_section.private_gallery_title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#2B1E1A]/75">
                    {content.friend_section.private_gallery_subtitle}
                  </p>
                </div>
              </div>

              {privateGalleryItems.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {privateGalleryItems.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setLightboxItem(item)}
                      className={`scrapbook-card rounded-3xl p-3.5 bg-[#FFF3D1] cursor-pointer ${
                        idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
                      }`}
                    >
                      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white border-2 border-[#2B1E1A] relative">
                        {item.media_type === 'video' ? (
                          <video
                            src={item.signed_url || ''}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={item.signed_url || ''}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 border border-[#2B1E1A]">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="pt-3 text-center">
                        <h4 className="font-display text-base text-[#2B1E1A]">
                          {item.title}
                        </h4>
                        {item.caption && (
                          <p className="font-handwriting text-xl text-[#2B1E1A]/90 mt-0.5">
                            “{item.caption}”
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-[#FFF3D1]/70 border-2 border-dashed border-[#2B1E1A] p-8 text-center space-y-2">
                  <Lock className="w-8 h-8 text-[#F15B48] mx-auto" />
                  <h3 className="font-display text-lg text-[#2B1E1A]">
                    Private Keepsake Gallery Ready & Protected
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2B1E1A]/75 max-w-md mx-auto">
                    Personal photographs and videos uploaded to the “Friend Section — Private Intimate Gallery” slot in your Owner Admin Dashboard will appear here via encrypted, time-limited signed URLs.
                  </p>
                </div>
              )}
            </section>

            {/* Warm Cheeky Closing & Navigation */}
            <section className="scrapbook-card rounded-3xl p-6 sm:p-8 bg-[#FF8A32] text-white text-center space-y-5">
              <p className="font-display text-xl sm:text-2xl max-w-xl mx-auto drop-shadow-[1px_1px_0px_#2B1E1A]">
                {content.friend_section.closing_message}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigateToSection('home')}
                  className="storybook-btn px-5 py-3 rounded-2xl bg-white text-[#2B1E1A] font-display text-base flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Homepage</span>
                </button>

                {content.bro_visible && !visitedBro && (
                  <button
                    type="button"
                    onClick={() => navigateToSection('bro')}
                    className="storybook-btn px-5 py-3 rounded-2xl bg-[#FFC928] text-[#2B1E1A] font-display text-base flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-[#F15B48] text-[#F15B48]" />
                    <span>Read Wishes from your Bro →</span>
                  </button>
                )}

                {content.final_surprise_visible && isSurpriseUnlocked && (
                  <button
                    type="button"
                    onClick={() => navigateToSection('surprise')}
                    className="storybook-btn px-6 py-3 rounded-2xl bg-[#2B1E1A] text-[#FFC928] font-display text-base flex items-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Unlock & Read Your Final Surprise ❤️</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* =====================================================================
          STAGE 5: FINAL SURPRISE SECTION (WRITTEN LETTER ONLY — EXACT APPROVED TEXT)
          ===================================================================== */}
      {stage === 'surprise' && (
        <main className="flex-1 bg-[#FFF3D1] relative py-12 px-4 sm:px-6">
          <FloatingBirthdayDecor />

          <div className="max-w-3xl mx-auto relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F15B48] text-white border-2 border-[#2B1E1A] text-xs font-extrabold shadow-[2px_2px_0px_#2B1E1A]">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>FINAL SURPRISE • FOR YOUR EYES ONLY</span>
              </span>
              <h1 className="font-display text-3xl sm:text-5xl text-[#2B1E1A] pt-2">
                {content.final_surprise.heading}
              </h1>
            </div>

            {/* Written Letter Only — Exact Approved Wording */}
            <article className="scrapbook-card rounded-[36px] p-7 sm:p-12 bg-white space-y-6 relative">
              <div className="w-32 h-5 bg-[#FFC928] border-2 border-[#2B1E1A] rotate-1 mx-auto -mt-10 mb-6" />

              <div className="space-y-5 text-base sm:text-[18px] text-[#2B1E1A] leading-[1.75] font-medium whitespace-pre-line">
                {content.final_surprise.letter_exact ||
                  EXACT_APPROVED_FINAL_SURPRISE_LETTER}
              </div>

              <div className="pt-6 border-t-2 border-dashed border-[#2B1E1A]/20 flex items-center justify-center gap-2 text-[#F15B48]">
                <Heart className="w-6 h-6 fill-current animate-pulse-glow" />
              </div>
            </article>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigateToSection('home')}
                className="storybook-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FFC928] text-[#2B1E1A] font-display text-lg cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Homepage</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Lightbox Modal for Click-to-Enlarge Photos & Videos */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="scrapbook-card rounded-3xl max-w-3xl w-full overflow-hidden bg-white"
          >
            <div className="bg-[#2B1E1A] flex items-center justify-center max-h-[70vh] relative overflow-hidden">
              {lightboxItem.media_type === 'video' ? (
                <video
                  src={lightboxItem.signed_url || ''}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[70vh] w-full"
                />
              ) : (
                <img
                  src={lightboxItem.signed_url || ''}
                  alt={lightboxItem.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-[#F15B48] text-white border-2 border-[#2B1E1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 bg-[#FFF3D1] text-center space-y-1">
              <h3 className="font-display text-xl text-[#2B1E1A]">
                {lightboxItem.title}
              </h3>
              {lightboxItem.caption && (
                <p className="font-handwriting text-2xl text-[#2B1E1A]/90">
                  “{lightboxItem.caption}”
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer with Navigation & Discrete Owner Admin Link */}
      <footer className="bg-[#FFC928] border-t-2 border-[#2B1E1A] py-5 px-4 text-xs font-bold text-[#2B1E1A]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-[#F15B48] text-[#F15B48]" />
            <span>Made with love for Lil Debbie ❤️</span>
          </div>
          <div className="flex items-center gap-3">
            {stage !== 'home' && (
              <button
                type="button"
                onClick={() => navigateToSection('home')}
                className="underline cursor-pointer"
              >
                Homepage
              </button>
            )}
            <button
              type="button"
              onClick={() => setStage('admin')}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF3D1] border border-[#2B1E1A] text-[11px] cursor-pointer hover:bg-white"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Admin</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
