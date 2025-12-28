"use client"

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
      };
    };
  }
}


import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState, useRef } from "react"

// Add initial style to head
if (typeof document !== 'undefined') {
  const initialStyle = document.createElement('style');
  initialStyle.textContent = `
    .ytp-chrome-top,
    .ytp-chrome-bottom,
    .ytp-gradient-top,
    .ytp-gradient-bottom,
    .ytp-show-cards-title,
    .ytp-youtube-button,
    .ytp-menuitem,
    .ytp-button,
    .ytp-watermark,
    .ytp-show-cards-title,
    .ytp-title-enable-channel-logo,
    .ytp-ce-element,
    .ytp-ce-covering-overlay,
    .ytp-ce-element-shadow,
    .ytp-ce-covering-image,
    .ytp-ce-expanding-image,
    .ytp-ce-element.ytp-ce-channel.ytp-ce-channel-this,
    .ytp-ce-element.ytp-ce-video.ytp-ce-element-show,
    iframe[id^='player_uid_'] *,
    .ytp-pause-overlay,
    .ytp-title,
    [class*='ytp-title'],
    [class*='ytp-copy'],
    [class*='ytp-button'],
    [class*='ytp-youtube'],
    [class*='ytp-watermark'],
    [class*='ytp-share'],
    [class*='ytp-embed'],
    .ytp-large-play-button,
    .ytp-play-button,
    .ytp-player,
    .ytp-player-content,
    .ytp-player-overlay,
    .ytp-playlist-menu-button,
    .ytp-chrome-controls,
    .ytp-progress-bar-container,
    .ytp-time-display,
    .ytp-player-content,
    .ytp-gradient-bottom,
    .ytp-chrome-controls-background {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
      visibility: hidden !important;
    }
    .html5-video-player {
      background-color: black !important;
    }
    #youtube-player {
      pointer-events: none !important;
    }
    .video-stream {
      object-fit: cover !important;
    }
  `;
  document.head.appendChild(initialStyle);
}

interface VideoPlayerProps {
  videoUrl: string | null
  onClose: () => void
}

export function VideoPlayer({ videoUrl, onClose }: VideoPlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [playerReady, setPlayerReady] = useState(false)

  // Extract video ID from URL
  useEffect(() => {
    if (videoUrl) {
      const id = getVideoId(videoUrl)
      setVideoId(id)
    } else {
      setVideoId(null)
    }
  }, [videoUrl])

  // Initialize YouTube API and player
  useEffect(() => {
    if (!videoId) return

    // Function to initialize player
    const initPlayer = () => {
      // Destroy existing player if it exists
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          cc_load_policy: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo()
            setPlayerReady(true)
            
            // Hide elements after player is ready
            const iframe = event.target.getIframe()
            if (iframe) {
              const iframeDoc = iframe.contentWindow?.document
              if (iframeDoc) {
                const style = iframeDoc.createElement('style')
                style.textContent = `
                  .ytp-chrome-top,
                  .ytp-chrome-bottom,
                  .ytp-gradient-top,
                  .ytp-gradient-bottom,
                  .ytp-show-cards-title,
                  .ytp-youtube-button,
                  .ytp-menuitem,
                  .ytp-button,
                  .ytp-watermark,
                  .ytp-title-enable-channel-logo,
                  .ytp-ce-element,
                  [class*='ytp-'] {
                    display: none !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    visibility: hidden !important;
                  }
                `
                iframeDoc.head.appendChild(style)
              }
            }
          }
        }
      })
    }

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      // Load YouTube IFrame API
      const tag = document.createElement('script')
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      // This will be called once the API is loaded
      window.onYouTubeIframeAPIReady = () => {
        initPlayer()
      }
    }

    // Cleanup on unmount or when videoId changes
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
        setPlayerReady(false)
      }
    }
  }, [videoId])

  // Handle dialog close
  const handleClose = () => {
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
      setPlayerReady(false)
    }
    onClose()
  }

  // Add copy prevention
  useEffect(() => {
    const preventCopy = (e: Event) => {
      e.preventDefault()
      return false
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('contextmenu', preventCopy)
      container.addEventListener('copy', preventCopy)
      container.addEventListener('selectstart', preventCopy)
    }

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', preventCopy)
        container.removeEventListener('copy', preventCopy)
        container.removeEventListener('selectstart', preventCopy)
      }
    }
  }, [containerRef.current])

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  return (
    <Dialog open={!!videoUrl} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 bg-black border-0 overflow-hidden">
        <div className="absolute top-2 right-2 z-50">
          <button 
            onClick={handleClose}
            className="rounded-full bg-black/70 p-2 text-white hover:bg-black focus:outline-none"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <span className="sr-only">
          <DialogTitle>Video Player</DialogTitle>
        </span>
        <div className="relative w-full aspect-video bg-black" ref={containerRef}>
          <div id="youtube-player" className="absolute top-0 left-0 w-full h-full" />
        </div>
      </DialogContent>
    </Dialog>
  )
} 