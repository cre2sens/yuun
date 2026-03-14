import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  thumbnailTime?: number;
}

export function VideoPlayer({ src, poster, thumbnailTime }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isThumbnailSet, setIsThumbnailSet] = useState(false);

  // Set initial thumbnail time if provided
  useEffect(() => {
    const video = videoRef.current;
    if (video && thumbnailTime !== undefined && !hasInteracted && !isPlaying && !isThumbnailSet) {
      const handleLoadedMetadata = () => {
        video.currentTime = thumbnailTime;
        setIsThumbnailSet(true);
      };
      
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    }
  }, [thumbnailTime, hasInteracted, isPlaying, isThumbnailSet]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 } // 50% visibility triggers play/pause
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if it's a touch device (mobile/tablet)
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    let shouldPlay = false;
    
    if (isManuallyPaused) {
      shouldPlay = false;
    } else if (isFinished) {
      shouldPlay = false;
    } else if (isTouchDevice) {
      // On mobile: play when scrolled into view (>50%)
      shouldPlay = isInView;
    } else {
      // On desktop: play when hovered OR if user previously clicked to play it
      shouldPlay = isInView && (isHovered || hasInteracted);
    }

    if (shouldPlay) {
      // If we are playing for the very first time and we had a thumbnail time set, reset to 0
      if (thumbnailTime !== undefined && !hasInteracted && video.currentTime === thumbnailTime) {
        video.currentTime = 0;
      }
      // Attempt to play. Muted is required for auto-play without interaction on most browsers.
      video.play().catch(e => console.log("Auto-play prevented:", e));
    } else {
      video.pause();
    }
  }, [isInView, isHovered, isFinished, isManuallyPaused, hasInteracted, thumbnailTime]);

  const handleEnded = () => {
    setIsFinished(true);
    setIsPlaying(false);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (videoRef.current) {
      if (videoRef.current.paused) {
        if (isFinished) {
          videoRef.current.currentTime = 0;
          setIsFinished(false);
        } else if (thumbnailTime !== undefined && !hasInteracted) {
          // Reset to beginning if playing from thumbnail for the first time
          videoRef.current.currentTime = 0;
        }
        setIsManuallyPaused(false);
        setHasInteracted(true);
        videoRef.current.play();
      } else {
        setIsManuallyPaused(true);
        videoRef.current.pause();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video overflow-hidden bg-neutral-100 rounded-lg group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        playsInline
        muted={!hasInteracted} // Mute initially for auto-play, unmute if user clicks
        controls={hasInteracted && isPlaying} // Show controls only after user clicks to allow volume/seek
      />
      
      {/* Thumbnail overlay when paused */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {poster && (
          <img 
            src={poster} 
            alt="Video Thumbnail" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-neutral-900 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
