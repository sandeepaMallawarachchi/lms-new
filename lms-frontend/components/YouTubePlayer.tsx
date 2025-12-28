"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

// Use a more flexible approach for window augmentation
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    // @ts-ignore - Using any to suppress type errors with the YouTube iframe API
    YT: any;
  }
}

interface YouTubePlayer {
  Player: any;
  PlayerState: {
    PLAYING: number;
    UNSTARTED: number;
    ENDED: number; 
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

interface YouTubePlayerProps {
  videoId: string;
  onProgress?: (progress: number, currentTime?: number, duration?: number) => void;
  onVideoEnd?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  startAt?: number;
  className?: string;
  preventRightClick?: boolean; // New prop to control right-click prevention
}

// Convert to forwardRef component
const YouTubePlayer = forwardRef<any, YouTubePlayerProps>(({ 
  videoId, 
  onProgress, 
  onVideoEnd,
  onPlay,
  onPause,
  startAt = 0,
  className = "w-full aspect-video",
  preventRightClick = true // Enable by default
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [previousVideoId, setPreviousVideoId] = useState<string | null>(null);
  
  // Expose the player instance to parent components
  useImperativeHandle(ref, () => ({
    // Expose player methods
    playVideo: () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    },
    pauseVideo: () => {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    },
    seekTo: (seconds: number) => {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, true);
      }
    },
    // Expose the player ref itself
    getPlayerInstance: () => playerRef.current
  }));

  // Load YouTube API
  useEffect(() => {
    console.log('[YouTubePlayer] Initializing component with videoId:', videoId);
    console.log('[YouTubePlayer] Starting position:', startAt);
    
    // Force tracking function (will be used by all player instances)
    const forceTrackingUpdate = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          
          if (duration > 0) {
            const progressPercent = Math.floor((currentTime / duration) * 100);
            console.log(`[YouTubePlayer] Forced update - Time: ${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s - Progress: ${progressPercent}%`);
            
            // Always store in localStorage directly
            localStorage.setItem(`video_position_${videoId}`, currentTime.toString());
            
            if (onProgress) {
              onProgress(progressPercent, currentTime, duration);
            }
          }
        } catch (error) {
          console.error('[YouTubePlayer] Error during forced tracking:', error);
        }
      }
    };
    
    // Run forced tracking every 1 second while component is mounted
    const forcedTrackingInterval = setInterval(forceTrackingUpdate, 1000);
    
    // If script is already there, don't add it again
    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      if (window.YT && window.YT.Player) {
        console.log('[YouTubePlayer] YouTube API already loaded');
        setPlayerReady(true);
      }
      return;
    }
    
    // Add YouTube API script
    console.log('[YouTubePlayer] Loading YouTube API script');
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    // Save original onYouTubeIframeAPIReady if it exists
    const originalOnReady = window.onYouTubeIframeAPIReady;
    
    // Create new global callback
    window.onYouTubeIframeAPIReady = function() {
      console.log('[YouTubePlayer] YouTube API ready');
      setPlayerReady(true);
      // Call original function if it existed
      if (typeof originalOnReady === 'function') {
        originalOnReady();
      }
    };
    
    // Cleanup
    return () => {
      console.log('[YouTubePlayer] Cleaning up component');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      clearInterval(forcedTrackingInterval);
    };
  }, []);

  // Apply right-click prevention
  useEffect(() => {
    if (!containerRef.current || !preventRightClick) return;
    
    // Function to prevent context menu (right-click)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      console.log('[YouTubePlayer] Right-click prevented');
      return false;
    };
    
    // Add event listener to container
    containerRef.current.addEventListener('contextmenu', preventContextMenu);
    
    // Find and protect the iframe if it exists
    const protectIframe = () => {
      const iframe = containerRef.current?.querySelector('iframe');
      if (iframe) {
        // Add CSS class to prevent selection
        iframe.classList.add('no-select');
        
        // Try to add event listener to iframe content (may be limited by cross-origin restrictions)
        try {
          iframe.contentWindow?.document.addEventListener('contextmenu', preventContextMenu);
        } catch (e) {
          console.log('[YouTubePlayer] Could not add listener to iframe directly (expected due to cross-origin)');
        }
      }
    };
    
    // Initial protection
    protectIframe();
    
    // Set up observer to protect iframe if it changes
    const observer = new MutationObserver(() => {
      protectIframe();
    });
    
    observer.observe(containerRef.current, { childList: true, subtree: true });
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('contextmenu', preventContextMenu);
      }
      observer.disconnect();
    };
  }, [preventRightClick]);

  // Initialize player when API is ready and videoId is available
  useEffect(() => {
    // Guard clause - only proceed if API is ready and we have container and videoId
    if (!playerReady || !containerRef.current || !videoId) {
      console.log('[YouTubePlayer] Waiting for prerequisites:', {
        playerReady,
        containerReady: !!containerRef.current,
        videoId
      });
      return;
    }
    
    // When video ID changes, track it
    if (videoId !== previousVideoId) {
      console.log('[YouTubePlayer] Video ID changed from', previousVideoId, 'to', videoId);
      setPreviousVideoId(videoId);
      
      // Create new player if it doesn't exist or videoId has changed
      if (!playerRef.current) {
        console.log('[YouTubePlayer] Creating new player instance');
        const playerId = `youtube-player-${Math.random().toString(36).substring(2, 9)}`;
        
        // Create div for player
        const playerDiv = document.createElement('div');
        playerDiv.id = playerId;
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(playerDiv);
        
        // Initialize player
        console.log('[YouTubePlayer] Initializing player with videoId:', videoId);
        playerRef.current = new window.YT.Player(playerId, {
          videoId: videoId,
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0, // Disable native fullscreen
            origin: window.location.origin,
            start: Math.floor(startAt),
            disablekb: preventRightClick ? 1 : 0, // Disable keyboard shortcuts if preventing right-click
            controls: 0, // Disable native controls
            showinfo: 0,
            iv_load_policy: 3, // Disable annotations
            autohide: 0, // Don't hide controls
            cc_load_policy: 0, // Hide closed captions by default
            enablejsapi: 1,
            playsinline: 1, // Play inline on mobile
            loop: 0,
            // Prevent related videos from showing
            related: 0,
            // Additional settings to prevent videos at end
            showsearch: 0,
            ecver: 2, // Use iframe embed version 2
            widget_referrer: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              console.log('[YouTubePlayer] Player ready event fired');
              event.target.playVideo();
              
              // Start interval to track progress
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
              
              console.log('[YouTubePlayer] Starting progress tracking interval');
              progressIntervalRef.current = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                  try {
                    const currentTime = playerRef.current.getCurrentTime();
                    const duration = playerRef.current.getDuration();
                    
                    // Debug logging for time tracking
                    console.log(`[YouTubePlayer] Time: ${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s`);
                    
                    if (duration > 0) {
                      const progressPercent = Math.floor((currentTime / duration) * 100);
                      console.log(`[YouTubePlayer] Progress: ${progressPercent}%`);
                      
                      // Always report accurate progress immediately
                      if (onProgress) {
                        console.log('[YouTubePlayer] Calling onProgress callback with:', {
                          progress: progressPercent,
                          currentTime,
                          duration
                        });
                        
                        // Pass current time and duration along with progress
                        onProgress(progressPercent, currentTime, duration);
                      }
                    } else {
                      console.log('[YouTubePlayer] Cannot calculate progress: duration is zero or not available');
                    }
                  } catch (error) {
                    console.error('[YouTubePlayer] Error getting player time:', error);
                  }
                } else {
                  console.warn('[YouTubePlayer] Player not available for progress check');
                }
              }, 200); // Check progress every 200ms for more responsive updates
            },
            onStateChange: (event: any) => {
              // Log player state changes
              const stateNames: {[key: string]: string} = {
                '-1': 'UNSTARTED',
                '0': 'ENDED',
                '1': 'PLAYING',
                '2': 'PAUSED',
                '3': 'BUFFERING',
                '5': 'CUED'
              };
              
              const stateKey = event.data.toString();
              const stateName = stateNames[stateKey] || `UNKNOWN(${event.data})`;
              console.log(`[YouTubePlayer] Player state changed: ${stateName}`);
              
              // Call onPlay and onPause callbacks based on state
              if (event.data === 1 && onPlay) { // PLAYING
                onPlay();
              } else if (event.data === 2 && onPause) { // PAUSED
                onPause();
              }
              
              // When the video starts playing, immediately get the current time
              // This helps sync the UI with the actual player state more quickly
              if (event.data === 1) { // PLAYING
                try {
                  // Force an immediate progress update when playing starts
                  const currentTime = playerRef.current.getCurrentTime();
                  const duration = playerRef.current.getDuration();
                  if (duration > 0) {
                    const progressPercent = Math.floor((currentTime / duration) * 100);
                    console.log(`[YouTubePlayer] Immediate progress update on play: ${progressPercent}% at ${currentTime.toFixed(1)}s`);
                    
                    if (onProgress) {
                      onProgress(progressPercent, currentTime, duration);
                    }
                  }
                } catch (error) {
                  console.error('[YouTubePlayer] Error getting immediate player time:', error);
                }
              }
              
              // Handle video end
              if (event.data === 0) { // 0 = YT.PlayerState.ENDED
                console.log('[YouTubePlayer] Video ended');
                if (onVideoEnd) {
                  console.log('[YouTubePlayer] Calling onVideoEnd callback');
                  onVideoEnd();
                }
                
                // Clear progress interval
                if (progressIntervalRef.current) {
                  console.log('[YouTubePlayer] Clearing progress interval');
                  clearInterval(progressIntervalRef.current);
                }
              }
            }
          }
        });
      } else {
        // If player exists and videoId changed, we need to recreate the player
        // This is more reliable than loadVideoById which can fail
        try {
          console.log('[YouTubePlayer] Recreating player for new videoId');
          // First stop and clean up current player
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          
          playerRef.current.destroy();
          playerRef.current = null;
          
          // Then create a new player div
          const playerId = `youtube-player-${Math.random().toString(36).substring(2, 9)}`;
          const playerDiv = document.createElement('div');
          playerDiv.id = playerId;
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(playerDiv);
          
          // Initialize new player with new videoId
          console.log('[YouTubePlayer] Initializing new player with videoId:', videoId);
          playerRef.current = new window.YT.Player(playerId, {
            videoId: videoId,
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              modestbranding: 1,
              rel: 0,
              fs: 0, // Disable native fullscreen
              origin: window.location.origin,
              start: Math.floor(startAt),
              disablekb: preventRightClick ? 1 : 0, // Disable keyboard shortcuts if preventing right-click
              controls: 0, // Disable native controls
              showinfo: 0,
              iv_load_policy: 3, // Disable annotations
              autohide: 0, // Don't hide controls
              cc_load_policy: 0, // Hide closed captions by default
              enablejsapi: 1,
              playsinline: 1, // Play inline on mobile
              loop: 0,
              // Prevent related videos from showing
              related: 0,
              // Additional settings to prevent videos at end
              showsearch: 0,
              ecver: 2, // Use iframe embed version 2
              widget_referrer: window.location.origin
            },
            events: {
              onReady: (event: any) => {
                console.log('[YouTubePlayer] New player ready');
                event.target.playVideo();
                
                // Start interval to track progress
                console.log('[YouTubePlayer] Starting progress tracking interval');
                progressIntervalRef.current = setInterval(() => {
                  if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    try {
                      const currentTime = playerRef.current.getCurrentTime();
                      const duration = playerRef.current.getDuration();
                      
                      console.log(`[YouTubePlayer] Time: ${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s`);
                      
                      if (duration > 0) {
                        const progressPercent = Math.floor((currentTime / duration) * 100);
                        console.log(`[YouTubePlayer] Progress: ${progressPercent}%`);
                        
                        // Always report progress
                        if (onProgress) {
                          // Pass current time and duration along with progress
                          onProgress(progressPercent, currentTime, duration);
                        }
                      }
                    } catch (error) {
                      console.error('[YouTubePlayer] Error getting player time:', error);
                    }
                  }
                }, 200); // Check progress every 200ms for more responsive updates
              },
              onStateChange: (event: any) => {
                // Log player state changes
                const stateNames: {[key: string]: string} = {
                  '-1': 'UNSTARTED',
                  '0': 'ENDED',
                  '1': 'PLAYING',
                  '2': 'PAUSED',
                  '3': 'BUFFERING',
                  '5': 'CUED'
                };
                
                const stateKey = event.data.toString();
                const stateName = stateNames[stateKey] || `UNKNOWN(${event.data})`;
                console.log(`[YouTubePlayer] New player state changed: ${stateName}`);
                
                // Call onPlay and onPause callbacks based on state
                if (event.data === 1 && onPlay) { // PLAYING
                  onPlay();
                } else if (event.data === 2 && onPause) { // PAUSED
                  onPause();
                }
                
                // When the video starts playing, immediately get the current time
                // This helps sync the UI with the actual player state more quickly
                if (event.data === 1) { // PLAYING
                  try {
                    // Force an immediate progress update when playing starts
                    const currentTime = playerRef.current.getCurrentTime();
                    const duration = playerRef.current.getDuration();
                    if (duration > 0) {
                      const progressPercent = Math.floor((currentTime / duration) * 100);
                      console.log(`[YouTubePlayer] Immediate progress update on play: ${progressPercent}% at ${currentTime.toFixed(1)}s`);
                      
                      if (onProgress) {
                        onProgress(progressPercent, currentTime, duration);
                      }
                    }
                  } catch (error) {
                    console.error('[YouTubePlayer] Error getting immediate player time:', error);
                  }
                }
                
                // Handle video end
                if (event.data === 0) { // 0 = YT.PlayerState.ENDED
                  console.log('[YouTubePlayer] Video ended');
                  if (onVideoEnd) {
                    onVideoEnd();
                  }
                  
                  // Clear progress interval
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                  }
                }
              }
            }
          });
        } catch (error) {
          console.error("[YouTubePlayer] Error recreating YouTube player:", error);
        }
      }
    }
    
    // Cleanup
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [playerReady, videoId, onProgress, onVideoEnd, startAt, previousVideoId, preventRightClick, onPlay, onPause]);
  
  return (
    <div 
      ref={containerRef} 
      className={`${className} ${preventRightClick ? 'no-select' : ''}`}
      style={{
        userSelect: preventRightClick ? 'none' : undefined,
        WebkitUserSelect: preventRightClick ? 'none' : undefined,
        MozUserSelect: preventRightClick ? 'none' : undefined,
        msUserSelect: preventRightClick ? 'none' : undefined,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        aspectRatio: '16/9' // Enforce 16:9 aspect ratio
      }}
    >
      {!playerReady && (
        <div className="flex items-center justify-center w-full h-full bg-black">
          <div className="animate-pulse text-white">Loading video player...</div>
        </div>
      )}
      <style jsx global>{`
        /* Fix YouTube iframe sizing */
        iframe[src*="youtube.com"] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
          border: 0;
        }
      `}</style>
    </div>
  );
});

export default YouTubePlayer; 