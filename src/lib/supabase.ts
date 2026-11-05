import { createClient } from '@supabase/supabase-js';

// Connected to existing Supabase project: "Samuel-kayode's Project" (ref: jykolicnbfaddbznijtj)
// Uses ONLY the public anon key. No service_role key or admin credentials are ever in frontend code.
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

export type MediaSectionType =
  | 'bro_photo'
  | 'bro_voice'
  | 'friend_red_gown_video'
  | 'friend_morning_voice'
  | 'friend_everyday_media'
  | 'friend_private_gallery'
  | 'background_music'
  | 'final_surprise';

export const MEDIA_SECTION_LABELS: Record<
  MediaSectionType,
  {
    label: string;
    group: 'Bro Section' | 'Friend Section' | 'Background Music' | 'Final Surprise';
    acceptedTypes: string;
    description: string;
  }
> = {
  bro_photo: {
    label: 'Bro Section — Individual Photograph',
    group: 'Bro Section',
    acceptedTypes: 'image/*',
    description:
      'Her individual photographs displayed in the Bro Section scrapbook gallery with sweet, funny & playful captions.',
  },
  bro_voice: {
    label: 'Bro Section — Voice Recording (Audio Player)',
    group: 'Bro Section',
    acceptedTypes: 'audio/*',
    description: 'Your personal voice recording for the Bro Section audio player.',
  },
  friend_red_gown_video: {
    label: 'Friend Section — The Red-Gown Dancing Video',
    group: 'Friend Section',
    acceptedTypes: 'video/*',
    description:
      'The funny video of her in a red gown singing and dancing while a different song played.',
  },
  friend_morning_voice: {
    label: 'Friend Section — Morning "Hi Baby" Voice Note',
    group: 'Friend Section',
    acceptedTypes: 'audio/*',
    description: 'Her sweet morning "Hi baby" voice notes wishing you a nice day.',
  },
  friend_everyday_media: {
    label: 'Friend Section — Everyday Photo / Video Update',
    group: 'Friend Section',
    acceptedTypes: 'image/*,video/*',
    description:
      'Spontaneous everyday updates she sends without you asking (new hairstyles, tired face, daily glimpses).',
  },
  friend_private_gallery: {
    label: 'Friend Section — Private Intimate Gallery (Photo / Video)',
    group: 'Friend Section',
    acceptedTypes: 'image/*,video/*',
    description:
      'Private, intimate-but-non-nude photographs and videos protected by signed URLs.',
  },
  background_music: {
    label: 'Global — Birthday Background Music',
    group: 'Background Music',
    acceptedTypes: 'audio/*',
    description:
      'Background soundtrack controlled by the visitor play/pause music bar (never forced to autoplay with sound).',
  },
  final_surprise: {
    label: 'Final Surprise — Vault Tag (Note: Final Surprise view is Written Letter Only)',
    group: 'Final Surprise',
    acceptedTypes: 'image/*,video/*,audio/*',
    description:
      'Organised under Final Surprise in the dashboard vault (the Final Surprise page itself remains a written letter only).',
  },
};

export interface BirthdayContentConfig {
  show_password_hint: boolean;
  password_hint_text: string;
  music_behavior: 'continue' | 'restart';
  music_title: string;
  bro_visible: boolean;
  friend_visible: boolean;
  final_surprise_visible: boolean;
  require_both_sections_visited: boolean;
  global_text: {
    header_badge: string;
    back_to_home_label: string;
    footer_text: string;
  };
  gate_section: {
    badge: string;
    title: string;
    subtitle: string;
    input_placeholder: string;
    button_label: string;
  };
  homepage: {
    hero_badge: string;
    headline: string;
    paragraph_1: string;
    paragraph_2: string;
    paragraph_3: string;
    bro_button_label: string;
    friend_button_label: string;
    secret_star_label: string;
    secret_star_message: string;
    surprise_unlocked_badge: string;
    surprise_unlocked_title: string;
    surprise_unlocked_subtitle: string;
    surprise_unlocked_button: string;
    surprise_locked_badge: string;
    surprise_locked_message: string;
  };
  bro_section: {
    is_draft_for_review: boolean;
    header_badge: string;
    opening_title: string;
    opening_subtitle: string;
    letter_card_heading: string;
    letter_card_subheading: string;
    letter_draft: string;
    letter_signoff: string;
    gallery_badge: string;
    gallery_heading: string;
    gallery_subtitle: string;
    placeholder_caption_1: string;
    placeholder_caption_2: string;
    placeholder_caption_3: string;
    voice_note_heading: string;
    voice_note_caption: string;
    secret_note_label: string;
    secret_note_message: string;
    closing_message: string;
  };
  friend_section: {
    header_badge: string;
    opening_line: string;
    opening_subtext: string;
    compliment_1_text: string;
    red_gown_badge: string;
    red_gown_heading: string;
    red_gown_placeholder_title: string;
    red_gown_placeholder_body: string;
    red_gown_caption: string;
    tiny_hands_badge: string;
    tiny_hands_title: string;
    tiny_hands_body: string;
    tiny_hands_secret_label: string;
    tiny_hands_secret_message: string;
    smile_laugh_badge: string;
    smile_laugh_title: string;
    smile_laugh_body: string;
    smile_laugh_footer: string;
    morning_voice_heading: string;
    morning_voice_body: string;
    spontaneous_updates_badge: string;
    spontaneous_updates_heading: string;
    spontaneous_updates_body: string;
    everyday_placeholder_1_badge: string;
    everyday_placeholder_1_caption: string;
    everyday_placeholder_2_badge: string;
    everyday_placeholder_2_caption: string;
    backside_joke_badge: string;
    backside_joke_title: string;
    backside_joke_body: string;
    official_request_badge: string;
    official_request_title: string;
    official_request_body: string;
    difficult_day_title: string;
    difficult_day_body: string;
    private_gallery_badge: string;
    private_gallery_title: string;
    private_gallery_subtitle: string;
    closing_message: string;
  };
  final_surprise: {
    header_badge: string;
    heading: string;
    letter_exact: string;
  };
}

export const EXACT_APPROVED_FINAL_SURPRISE_LETTER = `There is something I want you to know, something that perhaps I've never been able to express completely.

Deep down in my heart, there is still a part of me that loves you in a way that goes beyond the usual way I describe our relationship. I remember how much I cared about you before we discovered we were cousins. I remember the conversations we had afterwards, when we tried to understand what that meant for us and realised that we couldn't move forward in the way we once imagined.

I remember wanting to give you distance because I thought that was what I had to do. And I remember you crying because you thought I was leaving you. That moment broke something in me. I can't explain how painful it was to see you cry, especially knowing that my decision was what brought those tears.

Since then, I've carried one promise in my heart: I never want to be the reason you feel abandoned or unwanted. I never want you to feel that you have lost someone who genuinely cares about you.

Sometimes, I still wonder what life would have looked like if things had been different. I won't pretend those thoughts have never crossed my mind. But whatever life has written for us, I am grateful that I still get to have you in my world.

You are precious to me, Lil Debbie. And I hope you never have to question that.

Happy birthday, my beautiful girl. ❤️`;

export const DEFAULT_BIRTHDAY_CONTENT: BirthdayContentConfig = {
  show_password_hint: false,
  password_hint_text: "It's a date that deserves to be remembered",
  music_behavior: 'continue',
  music_title: "Lil Debbie's Birthday Soundtrack",
  bro_visible: true,
  friend_visible: true,
  final_surprise_visible: true,
  require_both_sections_visited: true,
  global_text: {
    header_badge: 'Lil Debbie’s Day',
    back_to_home_label: 'Back to Homepage',
    footer_text: 'Made with love for Lil Debbie ❤️',
  },
  gate_section: {
    badge: 'PRIVATE BIRTHDAY EXPERIENCE',
    title: 'Something Special For Lil Debbie ❤️',
    subtitle:
      'Enter your special birthday passcode below to unlock your birthday surprise.',
    input_placeholder: 'Enter birthday passcode...',
    button_label: 'Open My Birthday Surprise ❤️',
  },
  homepage: {
    hero_badge: 'CELEBRATING YOU TODAY & ALWAYS',
    headline: 'Happy Birthday, My Lil Debbie! ❤️',
    paragraph_1:
      "Today is not just another birthday. It's a special day for someone who has occupied a very interesting place in my life. 😂❤️",
    paragraph_2:
      "I made something little (or maybe not so little) for you. There are memories, a few surprises, some things I want you to know, and perhaps one or two things you'll laugh at.",
    paragraph_3: "So, take your time, Lil Debbie. This one's yours.",
    bro_button_label: 'Wishes from your Bro.',
    friend_button_label: 'Wishes from your Friend.',
    secret_star_label: 'Tap This Birthday Star for a Little Secret ⭐',
    secret_star_message:
      "Psst... make sure you visit BOTH 'Wishes from your Bro' and 'Wishes from your Friend'—something very special unlocks at the end once you've seen both! ❤️",
    surprise_unlocked_badge: 'FINAL SURPRISE UNLOCKED!',
    surprise_unlocked_title: 'One Last Letter Is Waiting For You ❤️',
    surprise_unlocked_subtitle:
      'You’ve explored both chapters. Whenever you’re ready, open your final birthday surprise.',
    surprise_unlocked_button: 'Read Your Final Surprise Letter ❤️',
    surprise_locked_badge: 'FINAL SURPRISE LOCKED',
    surprise_locked_message:
      'Explore both Wishes from your Bro and Wishes from your Friend first to unlock your Final Surprise letter!',
  },
  bro_section: {
    is_draft_for_review: true,
    header_badge: 'CHAPTER ONE • WISHES FROM YOUR BRO',
    opening_title: 'From Your Bro — With All My Heart',
    opening_subtitle:
      'Before the teasing starts, here are the things your big bro needs you to know today.',
    letter_card_heading: 'A Letter From Your Big Bro',
    letter_card_subheading: 'For My Sister, Lil Debbie ❤️',
    letter_draft: `My dearest Lil Debbie,

Happy birthday! Looking at the person you are today makes me genuinely proud. One of the first things anyone notices about you—and one of the things I admire most—is your kindness and compassion. You don't condemn people easily, and whenever you are in a position to help someone, your heart is always open and willing.

I also see your strength every single day. You have such a genuine eagerness to learn, to improve, and to become an even better version of yourself. That quiet determination in you is special.

I still think back to the day we discovered we were cousins and ended up spending hours upon hours talking on WhatsApp. We talked about everything—sharing stories about our past relationships, and me telling you all those ridiculous, funny things I did back in secondary school. Hearing you laugh—and laughing right along with you—brought so much warmth into my life during a period when everything had felt way too serious. That long conversation brought us so much closer and turned into one of my favourite memories.

Having you come into my life has truly been one of my biggest joys. You've even made me a better person in ways you might not realise. You taught me not to talk down on people, and you showed me that I can genuinely enjoy someone's company with warmth and respect without ever belittling them.

Sometimes I catch myself imagining what it would be like to have you around more often, sharing more of the simple everyday moments side by side—and I am so deeply grateful that life gave me you as my sister.

No matter what season of life we are in, please remember this: I am here for you whenever you need me, now and always.`,
    letter_signoff: 'Always in your corner, Your Bro ❤️',
    gallery_badge: 'SCRAPBOOK MEMORIES',
    gallery_heading: 'Snapshots of My Favourite Sister 📸',
    gallery_subtitle: 'Tap any photograph to open it full-screen.',
    placeholder_caption_1:
      'That effortless smile that warms up the whole room before you even say a word. ❤️',
    placeholder_caption_2:
      'The exact face of someone pretending she is completely innocent after causing chaos. 😂',
    placeholder_caption_3:
      'Growing stronger, wiser, and more radiant every single year—proud of you always, sis! ✨',
    voice_note_heading: 'A Voice Note From Your Bro 🎙️',
    voice_note_caption:
      'Press play whenever you are ready to hear my birthday message for you.',
    secret_note_label: 'Tap for an Extra Big-Bro Reminder 💌',
    secret_note_message:
      'No matter how busy life gets or where we both are, you will always have a brother who is proud of your heart and ready to listen whenever you call. ❤️',
    closing_message:
      'Thank you for being the kind, strong, wonderful sister you are, Lil Debbie. Your Bro always has your back. ❤️',
  },
  friend_section: {
    header_badge: 'CHAPTER TWO • WISHES FROM YOUR FRIEND',
    opening_line: 'Oh, so you made it here! 😂',
    opening_subtext:
      'Welcome to the side of the website where I get to tease you properly—just like we always do.',
    compliment_1_text:
      'Before I even start roasting you today, let’s give credit where it’s due: between that glowing fair skin, those captivating eyes of yours, and that cute small pointy nose I love teasing you about, you really do know how to look effortlessly stunning. 😍✨',
    red_gown_badge: 'HALL OF FAME MOMENT 💃🏽',
    red_gown_heading: 'The Legendary Red-Gown Concert 💃🏽🎶',
    red_gown_placeholder_title: 'Red-Gown Dancing Video Slot Ready',
    red_gown_placeholder_body:
      'Reserved exclusively for the actual video of you in your red gown singing and dancing while a completely different song played in the background!',
    red_gown_caption:
      "The day music betrayed you 😂 I still don't know which song you were dancing to, but the confidence was 10/10.",
    tiny_hands_badge: 'SERIOUS QUESTION 🥊😂',
    tiny_hands_title: 'Wait—Before You Threaten to Beat Anyone... 🥊😂',
    tiny_hands_body:
      'Every time you get worked up and threaten that you\'re going to beat someone, I only have one question for you: "Which hand?" Because let\'s be honest, with those tiny hands of yours, the threat level is questionable at best! 😂',
    tiny_hands_secret_label: 'Tap to Hear My Verdict on Your "Punches" 😂',
    tiny_hands_secret_message:
      '"Which hand?" — Still undefeated! Those tiny hands were built for holding cake, not fighting anybody. 😂❤️',
    smile_laugh_badge: 'MY FAVOURITE SOUND 😍',
    smile_laugh_title: 'That Smile, That Mouth & That Contagious Laugh',
    smile_laugh_body:
      'Even when you’re pretending to be tough, it takes about three seconds before that sweet mouth of yours curves into a smile. And your laugh? Honestly, your laugh is so contagious that the moment you start laughing, I can’t help laughing right along with you.',
    smile_laugh_footer: '10/10 smile every single time ❤️',
    morning_voice_heading: 'Those 6:00 AM "Hi Baby" Voice Notes ☀️🎧',
    morning_voice_body:
      'One of my absolute favourite parts of waking up is seeing your morning voice notes waiting for me around 6am—hearing you start with "Hi baby," telling me where you\'re heading or what you\'re about to do, and wishing me a nice day. You have no idea how much warmth that adds to my mornings.',
    spontaneous_updates_badge: 'BEST BEHAVIOUR AWARD 🏆',
    spontaneous_updates_heading: 'Your Unprompted Daily Updates 📸✨',
    spontaneous_updates_body:
      "Can we talk about how you send me pictures and videos without me even asking? Your new hairstyles, your tired-face videos after a long day, little updates when you're having a rough moment, and random glimpses of your everyday life. Honestly, that is one of the best behaviours I've ever experienced, and every single one of them makes me smile.",
    everyday_placeholder_1_badge: 'New Hairstyle Alert 💇🏽‍♀️',
    everyday_placeholder_1_caption:
      'Reserved for your unprompted hairstyle reveal updates that always brighten my phone screen.',
    everyday_placeholder_2_badge: 'After-Work Tired Face 😮‍💨❤️',
    everyday_placeholder_2_caption:
      'Reserved for those cute "I am exhausted" everyday updates you send without me even asking.',
    backside_joke_badge: 'FACT CHECK ✔️',
    backside_joke_title: 'Case Closed on Your Complaint 😌✨',
    backside_joke_body:
      "And while we are settling scores: please stop complaining that you don't have a big backside! Like I always tell you, your ass is good enough—more than good enough, actually. Your figure is gorgeous just the way you are, so I don't want to hear any more complaints from you.",
    official_request_badge: 'OFFICIAL REQUEST 📜',
    official_request_title: 'An Official Birthday Request 📜😂',
    official_request_body:
      'Consider this an official, non-negotiable birthday request: I need plenty more funny videos this year—especially more masterpieces like the red-gown dancing video—plus all the random pictures, hairstyle reveals, and everyday updates.',
    difficult_day_title: 'One Gentle Promise Between Friends 🤍',
    difficult_day_body:
      "On a softer note: I felt really bad when you told me you had cried in the office after a difficult day and didn't call me. You never have to carry heavy moments all by yourself or wait until everything feels okay before reaching out. Next time you're having a hard day, please call me—even if all you want to do is talk or vent for just a few minutes. I'm always in your corner.",
    private_gallery_badge: 'PRIVATE SIGNED-URL VAULT',
    private_gallery_title: 'Our Private Keepsake Gallery 🔒✨',
    private_gallery_subtitle:
      'A private collection of your special moments, protected and just for us.',
    closing_message:
      'Never stop being the funny, stunning, expressive, sweet trouble that you are. Happy Birthday, my favourite friend! 😂❤️',
  },
  final_surprise: {
    header_badge: 'FINAL SURPRISE • FOR YOUR EYES ONLY',
    heading: 'One Last Thing From My Heart...',
    letter_exact: EXACT_APPROVED_FINAL_SURPRISE_LETTER,
  },
};

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
  theme_mode: string;
  birthday_content?: Partial<BirthdayContentConfig>;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  section: MediaSectionType;
  caption_style: 'sweet' | 'funny' | 'playful';
  display_order: number;
  is_visible: boolean;
  media_type: 'image' | 'video' | 'audio';
  storage_path: string;
  public_url: string;
  signed_url?: string | null;
  file_size: number;
  taken_at: string;
  location: string;
  is_favorite: boolean;
  created_at: string;
}

export interface BirthdayGateResponse {
  authenticated: boolean;
  rate_limited?: boolean;
  remaining_attempts?: number;
  retry_after_seconds?: number;
  error?: string;
  visitor_token?: string;
  valid_until?: string;
  signed_url_expires_in?: number;
  site_settings?: SiteSettings | null;
  media_items?: MediaItem[];
}

export function mergeBirthdayContent(
  partial?: Partial<BirthdayContentConfig> | null
): BirthdayContentConfig {
  if (!partial) return DEFAULT_BIRTHDAY_CONTENT;
  return {
    ...DEFAULT_BIRTHDAY_CONTENT,
    ...partial,
    global_text: {
      ...DEFAULT_BIRTHDAY_CONTENT.global_text,
      ...(partial.global_text || {}),
    },
    gate_section: {
      ...DEFAULT_BIRTHDAY_CONTENT.gate_section,
      ...(partial.gate_section || {}),
    },
    homepage: {
      ...DEFAULT_BIRTHDAY_CONTENT.homepage,
      ...(partial.homepage || {}),
    },
    bro_section: {
      ...DEFAULT_BIRTHDAY_CONTENT.bro_section,
      ...(partial.bro_section || {}),
    },
    friend_section: {
      ...DEFAULT_BIRTHDAY_CONTENT.friend_section,
      ...(partial.friend_section || {}),
    },
    final_surprise: {
      ...DEFAULT_BIRTHDAY_CONTENT.final_surprise,
      ...(partial.final_surprise || {}),
      letter_exact:
        partial.final_surprise?.letter_exact || EXACT_APPROVED_FINAL_SURPRISE_LETTER,
    },
  };
}

/**
 * Verifies the visitor birthday password server-side via the `birthday-gate` Supabase Edge Function.
 */
export async function verifyBirthdayPasswordWithEdge(
  password: string
): Promise<BirthdayGateResponse> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/birthday-gate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      action: 'verify_password',
      password: password.trim(),
    }),
  });

  const data = await res.json().catch(() => ({
    authenticated: false,
    error: 'Could not reach verification server.',
  }));
  return data as BirthdayGateResponse;
}

/**
 * Validates an existing short-lived visitor session token via the `birthday-gate` Edge Function
 * and retrieves fresh signed URLs for private media.
 */
export async function fetchVisitorSessionContent(
  visitorToken: string
): Promise<BirthdayGateResponse> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/birthday-gate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'x-visitor-token': visitorToken,
    },
    body: JSON.stringify({
      action: 'session_content',
      visitor_token: visitorToken,
    }),
  });

  const data = await res.json().catch(() => ({
    authenticated: false,
    error: 'Could not validate visitor session.',
  }));
  return data as BirthdayGateResponse;
}

/**
 * Uploads a personal media file to the PRIVATE `lil-debbie-media` bucket as the authenticated owner.
 * Generates a time-limited signed URL for immediate owner preview.
 */
export async function uploadPrivateMediaToStorage(
  file: File,
  section: MediaSectionType
): Promise<{
  storagePath: string;
  signedUrl: string | null;
  mediaType: 'image' | 'video' | 'audio';
}> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 48);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBaseName}.${ext}`;
  const storagePath = `${section}/${uniqueName}`;

  let mediaType: 'image' | 'video' | 'audio' = 'image';
  if (file.type.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(ext)) {
    mediaType = 'video';
  } else if (
    file.type.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)
  ) {
    mediaType = 'audio';
  }

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(`Private Storage upload failed: ${uploadError.message}`);
  }

  const { data: signedData } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600);

  return {
    storagePath,
    signedUrl: signedData?.signedUrl || null,
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
