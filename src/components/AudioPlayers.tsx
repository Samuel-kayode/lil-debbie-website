import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Mic, Sparkles } from 'lucide-react';
import type { MediaItem } from '../lib/supabase';

interface BackgroundMusicControllerProps {
  musicItem?: MediaItem | null;
  musicTitle: string;
  musicBehavior: 'continue' | 'restart';
  currentSection: string;
}

export function BackgroundMusicController({
  musicItem,
  musicTitle,
  musicBehavior,
  currentSection,
}: BackgroundMusicControllerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const prevSectionRef = useRef<string>(currentSection);

  const audioUrl = musicItem?.signed_url || null;

  useEffect(() => {
    if (prevSectionRef.current !== currentSection) {
      prevSectionRef.current = currentSection;
      if (musicBehavior === 'restart' && audioRef.current && playing) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentSection, musicBehavior, playing]);

  const togglePlay = async () => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch (err) {
        console.error('Playback prevented:', err);
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  if (!audioUrl) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FFF3D1] border-2 border-[#2B1E1A] text-xs font-bold text-[#2B1E1A] shadow-[2px_2px_0px_#2B1E1A]"
        title="Background music slot ready — upload your track in the Owner Admin Dashboard"
      >
        <Music className="w-3.5 h-3.5 text-[#F15B48]" />
        <span className="truncate max-w-[165px] sm:max-w-none">
          Music Ready for Upload 🎵
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFC928] border-2 border-[#2B1E1A] text-xs font-bold text-[#2B1E1A] shadow-[3px_3px_0px_#2B1E1A]">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="metadata"
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        className="w-7 h-7 rounded-full bg-[#F15B48] text-white border-2 border-[#2B1E1A] flex items-center justify-center cursor-pointer active:scale-95 transition"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <div className="flex flex-col leading-tight pr-1">
        <span className="text-[11px] font-extrabold truncate max-w-[125px] sm:max-w-[190px]">
          {musicItem?.title || musicTitle}
        </span>
        <span className="text-[10px] text-[#2B1E1A]/75">
          {playing ? 'Playing Birthday Tune 🎶' : 'Tap Play for Music'}
        </span>
      </div>
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute background music' : 'Mute background music'}
        className="p-1 rounded-full hover:bg-white/50 cursor-pointer"
      >
        {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

interface CustomVoiceNotePlayerProps {
  item?: MediaItem | null;
  heading: string;
  subtitle: string;
  placeholderMessage: string;
  accentColor?: 'coral' | 'orange' | 'sunshine';
}

export function CustomVoiceNotePlayer({
  item,
  heading,
  subtitle,
  placeholderMessage,
  accentColor = 'coral',
}: CustomVoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioUrl = item?.signed_url || null;

  const formatTime = (secs: number) => {
    if (!secs || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = async () => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch (err) {
        console.error('Voice playback error:', err);
      }
    }
  };

  const bgAccent =
    accentColor === 'coral'
      ? 'bg-[#F15B48] text-white'
      : accentColor === 'orange'
      ? 'bg-[#FF8A32] text-white'
      : 'bg-[#FFC928] text-[#2B1E1A]';

  return (
    <div className="scrapbook-card rounded-3xl p-5 sm:p-6 bg-white relative overflow-hidden">
      {/* Top decorative tape */}
      <div className="w-24 h-4 bg-[#FFC928]/85 border border-[#2B1E1A] -rotate-2 mx-auto -mt-7 mb-4" />

      <div className="flex items-start gap-3.5">
        <div
          className={`w-12 h-12 rounded-2xl border-2 border-[#2B1E1A] flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#2B1E1A] ${bgAccent}`}
        >
          <Mic className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-lg sm:text-xl text-[#2B1E1A]">
            {item?.title || heading}
          </h4>
          <p className="text-xs sm:text-sm text-[#2B1E1A]/75 mt-0.5">
            {item?.caption || subtitle}
          </p>
        </div>
      </div>

      {audioUrl ? (
        <div className="mt-5 bg-[#FFF3D1] border-2 border-[#2B1E1A] rounded-2xl p-4 flex items-center gap-3.5">
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
          />
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause voice note' : 'Play voice note'}
            className="w-12 h-12 rounded-full bg-[#F15B48] text-white border-2 border-[#2B1E1A] shadow-[3px_3px_0px_#2B1E1A] flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition"
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <div className="flex-1 space-y-1.5">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (audioRef.current) {
                  audioRef.current.currentTime = next;
                }
                setCurrentTime(next);
              }}
              className="w-full accent-[#F15B48] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] font-bold text-[#2B1E1A]/80">
              <span>{formatTime(currentTime)}</span>
              <span>{playing ? 'Playing Voice Note 🎧' : 'Tap Play to Listen'}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-[#FFF3D1]/90 border-2 border-dashed border-[#2B1E1A]/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFC928] border-2 border-[#2B1E1A] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#2B1E1A]" />
          </div>
          <div className="text-xs sm:text-sm text-[#2B1E1A]/85 leading-relaxed">
            <span className="font-bold block text-[#2B1E1A]">
              Voice Recording Slot Ready
            </span>
            {placeholderMessage}
          </div>
        </div>
      )}
    </div>
  );
}
