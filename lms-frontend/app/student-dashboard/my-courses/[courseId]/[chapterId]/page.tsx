"use client"

import {useEffect, useState, useRef, use} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {AppSidebar} from "@/components/app-sidebar"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Progress} from "@/components/ui/progress"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {Skeleton} from "@/components/ui/skeleton"
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    FileText,
    PlayCircle,
    Play,
    Pause,
    ExternalLink,
    Link as LinkIcon,
    RotateCcw,
    Maximize2,
    Minimize2
} from "lucide-react"
import {Separator} from "@/components/ui/separator"
import Link from "next/link"
import {getStudentProgressData, type CourseProgress, type ModuleProgress, type Chapter} from "@/data/student-progress"
import YouTubePlayer from "@/components/YouTubePlayer"
import env from "@/config/env";

interface ChapterProgressData {
    id: number;
    title: string;
    description: string;
    orderIndex: number;
    completed: boolean;
    youtubeLink: string;
    progressPercentage: number;
    timeSpentSeconds: number;
    lastUpdated: string | null;
    free: boolean;
    videoContent: boolean;
}

interface ChapterDetails {
    id: number;
    title: string;
    description: string;
    content: string;
    videoUrl: string;
    youtubeLink?: string;
    isVideoContent: boolean;
    progressPercentage: number;
    timeSpentSeconds: number;
    resources: {
        id: number;
        name: string;
        type: "pdf" | "doc" | "link";
        url: string;
    }[];
    completed: boolean;
    free?: boolean;
}

export default function ChapterVideoPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = Number(params?.courseId) || 0
    const chapterId = Number(params?.chapterId) || 0

    const [loading, setLoading] = useState(true)
    const [course, setCourse] = useState<CourseProgress | null>(null)
    const [module, setModule] = useState<ModuleProgress | null>(null)
    const [chapter, setChapter] = useState<ChapterDetails | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [videoProgress, setVideoProgress] = useState(0)
    const [isCompleted, setIsCompleted] = useState(false)
    const [progressUpdating, setProgressUpdating] = useState(false)
    const [lastSavedPosition, setLastSavedPosition] = useState<number | null>(null)
    const [youtubePlayerReady, setYoutubePlayerReady] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const youtubePlayerRef = useRef<any>(null)
    const youtubeIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Replace with time-based tracking
    const [lastProgressUpdateTime, setLastProgressUpdateTime] = useState<number>(0);
    const progressUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Add state for tracking play/pause status
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState(true);
    const [estimatedDuration, setEstimatedDuration] = useState<number>(0);

    // Add state for success modal
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionMessage, setCompletionMessage] = useState("");

    // Add state for replay button
    const [showReplayButton, setShowReplayButton] = useState(false);

    // Add state for hasResetOnLoad
    const [hasResetOnLoad, setHasResetOnLoad] = useState(false);

    // Add state for fullscreen
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // Keep the debounce function as it's still useful
    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: any[]) => {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                func(...args)
            }, delay)
        }
    }

    // Modify debounced save position to work with our time-based approach
    const debouncedSavePosition = useRef(
        debounce(() => {
            if (videoRef.current && videoRef.current.currentTime > 0) {
                const currentTime = videoRef.current.currentTime
                localStorage.setItem(`video_position_${chapterId}`, currentTime.toString())
            }
        }, 3000) // Save position every 3 seconds
    ).current

    // Set up time-based progress update interval (every 60 seconds)
    useEffect(() => {
        console.log('[ChapterPage] Setting up time-based progress update interval');
        
        // Clear any existing interval when component mounts
        if (progressUpdateIntervalRef.current) {
            clearInterval(progressUpdateIntervalRef.current);
            progressUpdateIntervalRef.current = null;
        }
        
        // Only set up interval when video is playing
        if (isPlaying) {
            console.log('[ChapterPage] Video is playing, setting up 60-second progress update interval');
            
            // Initial update when playback starts
            const now = Date.now();
            const timeSinceLastUpdate = now - lastProgressUpdateTime;

            // If it's been at least 60 seconds since last update or this is first play
            if (timeSinceLastUpdate >= 60000 || lastProgressUpdateTime === 0) {
                console.log('[ChapterPage] Initial update on play start');
                // Use setTimeout to ensure this runs after current state updates are applied
                setTimeout(() => {
                    updateProgressToServer();
                }, 1000);
            }
            
            // Set up interval for every 60 seconds
            progressUpdateIntervalRef.current = setInterval(() => {
                console.log('[ChapterPage] 60-second interval triggered, updating progress');
                updateProgressToServer();
            }, 60000); // Update every 60 seconds
        }
        
        // Cleanup when component unmounts or isPlaying changes
        return () => {
            if (progressUpdateIntervalRef.current) {
                console.log('[ChapterPage] Cleaning up progress interval');
                clearInterval(progressUpdateIntervalRef.current);
                progressUpdateIntervalRef.current = null;
            }
        };
    }, [isPlaying, chapterId, lastProgressUpdateTime, videoProgress, estimatedDuration]);

    // Helper function to update progress to server (used by interval)
    const updateProgressToServer = () => {
        if (progressUpdating) {
            console.log('[ChapterPage] Progress update already in progress, skipping');
            return;
        }
        
        const savedPosition = localStorage.getItem(`video_position_${chapterId}`);
        if (!savedPosition) {
            console.log('[ChapterPage] No saved position found, skipping update');
            return;
        }
        
        const currentTime = parseFloat(savedPosition);
        
        // Determine the most accurate progress value to send
        let progressToSend = videoProgress;

        // If videoProgress is still 0 but we have time data, calculate a more accurate value
        if (progressToSend === 0 && currentTime > 0) {
            // Try to get accurate progress using the player
            if (youtubePlayerRef.current && typeof youtubePlayerRef.current.getPlayerInstance === 'function') {
                try {
                    const player = youtubePlayerRef.current.getPlayerInstance();
                    const playerDuration = player.getDuration();
                    if (playerDuration && playerDuration > 0) {
                        progressToSend = Math.floor((currentTime / playerDuration) * 100);
                        console.log(`[ChapterPage] Calculated more accurate progress: ${progressToSend}% using player duration`);
                    }
                } catch (error) {
                    console.error('[ChapterPage] Error getting player duration:', error);
                }
            }
            
            // If still 0 or player method failed, use estimated duration as fallback
            if (progressToSend === 0 && estimatedDuration > 0) {
                progressToSend = Math.floor((currentTime / estimatedDuration) * 100);
                console.log(`[ChapterPage] Calculated fallback progress: ${progressToSend}% using estimated duration`);
            }
        }
        
        console.log(`[ChapterPage] Updating progress after 60 seconds: ${progressToSend}% at position ${currentTime.toFixed(1)}s`);
        
        // Only update if we have a non-zero progress to send
        if (progressToSend > 0 || videoProgress > 0) {
            // Use the highest value between calculated and UI progress
            const finalProgress = Math.max(progressToSend, videoProgress);
            updateChapterProgress(finalProgress, currentTime);
        } else {
            console.log('[ChapterPage] Skipping update - progress value is 0');
            }
        
        // Update last update timestamp
        setLastProgressUpdateTime(Date.now());
    };

    // Video sources for demo
    const videoSources = [
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    ];

    // Add a function to fetch progress directly from the API
    const fetchProgressData = async (): Promise<any> => {
        try {
            // Try to get token from localStorage first
            let token = localStorage.getItem('jwt_token');

            // If not found, try alternate keys that might be used
            if (!token) {
                // Check other common token key names
                const possibleTokenKeys = ['token', 'authToken', 'access_token', 'auth_token'];
                for (const key of possibleTokenKeys) {
                    const possibleToken = localStorage.getItem(key);
                    if (possibleToken) {
                        console.log(`Found token using key: ${key}`);
                        token = possibleToken;
                        break;
                    }
                }
            }

            // If still no token, check sessionStorage as fallback
            if (!token) {
                const sessionToken = sessionStorage.getItem('jwt_token') ||
                    sessionStorage.getItem('token') ||
                    sessionStorage.getItem('authToken');
                if (sessionToken) {
                    console.log('Using token from sessionStorage');
                    token = sessionToken;
                }
            }

            // Final check - if we have no token, we can't proceed
            if (!token) {
                console.error('Authentication token not found in localStorage or sessionStorage');
                return null;
            }

            console.log('Using authentication token to fetch progress data');

            const response = await fetch(`${env.apiUrl}/student/progress/courses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include' // Include cookies if any
            });

            if (!response.ok) {
                const status = response.status;
                if (status === 401) {
                    console.error('Authentication failed - token may be expired');
                    // Could redirect to login here
                } else if (status === 403) {
                    console.error('Permission denied accessing progress data');
                } else {
                    console.error(`Error fetching progress: ${response.status}`);
                }
                throw new Error(`Error fetching progress: ${response.status}`);
            }

            const data = await response.json();
            console.log('Successfully retrieved progress data');
            return data;
        } catch (error) {
            console.error('Error fetching progress data:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchChapterData = async () => {
            try {
                setLoading(true)

                // Get progress data directly from API
                const progressData = await fetchProgressData()
                if (!progressData || !progressData.courseProgress) {
                    setError("Failed to load progress data. Please try again later.")
                    return
                }

                console.log('Progress data from API:', progressData)

                // Find the course
                const foundCourse = progressData.courseProgress.find((c: any) => c && c.id === courseId)
                if (!foundCourse) {
                    setError(`Course with ID ${courseId} not found.`)
                    return
                }

                setCourse(foundCourse)

                // Find the module and chapter with progress details
                let foundModule: ModuleProgress | null = null
                let foundChapter: ChapterProgressData | null = null
                let foundModuleWithProgress = null

                if (foundCourse.items && Array.isArray(foundCourse.items)) {
                    for (const mod of foundCourse.items) {
                        if (mod && mod.chapters && Array.isArray(mod.chapters)) {
                            const chap = mod.chapters.find((c: any) => c && c.id === chapterId)
                            if (chap) {
                                foundModule = mod
                                foundChapter = chap
                                foundModuleWithProgress = mod
                                break
                            }
                        }
                    }
                }

                if (!foundModule || !foundChapter) {
                    setError(`Chapter with ID ${chapterId} not found in course.`)
                    return
                }

                // Set module data
                setModule(foundModule)

                // Create chapter with progress data from API
                const chapterDetails: ChapterDetails = {
                    ...foundChapter,
                    content: "This is the chapter content with detailed instructions.",
                    videoUrl: videoSources[chapterId % videoSources.length],
                    isVideoContent: foundChapter.videoContent !== false, // Default to true if not specified
                    progressPercentage: foundChapter.progressPercentage || 0,
                    timeSpentSeconds: foundChapter.timeSpentSeconds || 0,
                    resources: [
                        {
                            id: 1,
                            name: "Chapter Resources.pdf",
                            type: "pdf",
                            url: "#"
                        },
                        {
                            id: 2,
                            name: "Additional Reading",
                            type: "link",
                            url: "https://example.com/reading"
                        }
                    ]
                }

                setChapter(chapterDetails)

                // Set the initial progress from API data
                setVideoProgress(chapterDetails.progressPercentage)
                console.log(`Setting initial progress from API: ${chapterDetails.progressPercentage}%`)

                // Initialize the timestamp for our time-based updates
                setLastProgressUpdateTime(Date.now());

                // For a 5-minute video (300 seconds), 10% would be 30 seconds
                // We'll use an estimated duration until the player loads
                const estimatedDuration = 300; // 5 minutes in seconds as a default estimate
                setEstimatedDuration(estimatedDuration);

                // Calculate position based on progress percentage instead of timeSpentSeconds
                if (chapterDetails.progressPercentage > 0) {
                    // Calculate the position as a percentage of estimated duration
                    const calculatedPosition = (chapterDetails.progressPercentage / 100) * estimatedDuration;
                    console.log(`Calculated starting position from percentage: ${calculatedPosition.toFixed(1)}s (${chapterDetails.progressPercentage}% of estimated ${estimatedDuration}s)`);

                    // Save this position to localStorage for the player to use
                    localStorage.setItem(`video_position_${chapterId}`, calculatedPosition.toString());
                    setLastSavedPosition(calculatedPosition);
                }
            } catch (err) {
                console.error("Error fetching chapter data:", err)
                setError("An error occurred while loading the chapter. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        if (courseId && chapterId) {
            fetchChapterData()
        }
    }, [courseId, chapterId])

    // Save video position before user navigates away
    useEffect(() => {
        // Load saved position when component mounts
        const loadSavedPosition = () => {
            try {
                const savedPosition = localStorage.getItem(`video_position_${chapterId}`)
                if (savedPosition) {
                    const position = parseFloat(savedPosition)
                    setLastSavedPosition(position)
                    console.log(`Loaded saved position for chapter ${chapterId}: ${position} seconds`)
                }
            } catch (err) {
                console.error('Error loading saved video position:', err)
            }
        }

        loadSavedPosition()

        // Save position when user leaves the page
        const savePosition = () => {
            if (videoRef.current && videoRef.current.currentTime > 0) {
                const currentTime = videoRef.current.currentTime
                localStorage.setItem(`video_position_${chapterId}`, currentTime.toString())
                console.log(`Saved position for chapter ${chapterId}: ${currentTime} seconds`)
            }
        }

        // Add event listeners for page visibility and before unload
        document.addEventListener('visibilitychange', savePosition)
        window.addEventListener('beforeunload', savePosition)

        // Cleanup
        return () => {
            savePosition() // Save position when component unmounts
            document.removeEventListener('visibilitychange', savePosition)
            window.removeEventListener('beforeunload', savePosition)
        }
    }, [chapterId])

    // Set video to resume from saved position once it's loaded
    const handleVideoLoaded = () => {
        if (videoRef.current && lastSavedPosition && lastSavedPosition > 0) {
            videoRef.current.currentTime = lastSavedPosition
            console.log(`Resumed video from ${lastSavedPosition} seconds`)

            // Clear the saved position after resuming to prevent future resets
            // when user moves to different positions manually
            setLastSavedPosition(null)
        }
    }

    // Save position periodically during playback
    const saveCurrentPosition = () => {
        if (videoRef.current && videoRef.current.currentTime > 0) {
            const currentTime = videoRef.current.currentTime
            localStorage.setItem(`video_position_${chapterId}`, currentTime.toString())
        }
    }

    // Update chapter progress on the server
    const updateChapterProgress = async (progress: number, currentTime?: number) => {
        // Prevent recursive calls by checking if we're already updating
        if (progressUpdating) {
            console.log('[ChapterPage] Update already in progress, skipping duplicate call');
            return;
        }

        console.log(`[ChapterPage] Updating chapter ${chapterId} progress to ${progress}% on server`);

        try {
            console.log('[ChapterPage] Setting progressUpdating flag to true');
            setProgressUpdating(true);

            // If chapter is already completed and saved at 100%, don't send another update
            if (chapter?.completed && chapter?.progressPercentage === 100 && progress === 100) {
                console.log('[ChapterPage] Chapter already completed and at 100%, skipping update');
                return;
            }

            // Continue with the rest of the function...
            // Try to get token from localStorage first
            let token = localStorage.getItem('jwt_token');

            // If not found, try alternate keys that might be used
            if (!token) {
                console.log('[ChapterPage] jwt_token not found, trying alternate token keys');
                // Check other common token key names
                const possibleTokenKeys = ['token', 'authToken', 'access_token', 'auth_token'];
                
                for (const key of possibleTokenKeys) {
                    const possibleToken = localStorage.getItem(key);
                    if (possibleToken) {
                        console.log(`[ChapterPage] Found token using key: ${key}`);
                        token = possibleToken;
                        break;
                    }
                }

                if (!token) {
                    console.error('Authentication token not found');
                    setCompletionMessage("Authentication token not found. Your progress will only be saved locally.");
                    setShowCompletionModal(true);
                    setProgressUpdating(false);
                    return;
                }
                }

            const response = await fetch(`${env.apiUrl}/student/progress/chapters/${chapterId}/progress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Use the token we found
                    },
                    body: JSON.stringify({
                        progressPercentage: progress,
                        timeSpentSeconds: 0
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Failed to mark chapter as completed:', errorData);
                    if (response.status === 401) {
                        // Handle authentication error
                        console.error('Authentication failed. You might need to log in again.');
                    setCompletionMessage("Authentication failed. You might need to log in again. Your progress is saved locally only.");
                    }
                setShowCompletionModal(true);
                    setProgressUpdating(false);
                    return;
                }

            // Clear position from localStorage since chapter is completed
            localStorage.removeItem(`video_position_${chapterId}`);
            
            // Update the timestamp of last progress update
            setLastProgressUpdateTime(Date.now());
            
            // Show success modal
            setCompletionMessage("Chapter successfully marked as completed!");
            setShowCompletionModal(true);
            
        } catch (err) {
            console.error('Error marking chapter as completed:', err)
            setCompletionMessage("Error occurred. Chapter is marked as completed locally only.");
            setShowCompletionModal(true);
        } finally {
            setProgressUpdating(false)
        }
    }

    // Handle video time updates to track progress
    const handleTimeUpdate = () => {
        const video = videoRef.current
        if (video) {
            const duration = video.duration || 1 // Prevent division by zero
            const currentTime = video.currentTime
            const progress = Math.floor((currentTime / duration) * 100)

            // Always save current position to localStorage immediately for HTML5 video
            localStorage.setItem(`video_position_${chapterId}`, currentTime.toString())

            // Only update UI progress, don't trigger API calls here
            if (progress !== videoProgress) {
                setVideoProgress(progress)
                console.log(`Video progress: ${progress}% at time ${currentTime.toFixed(1)}s`)
            }
        }
    }

    // Get chapter index and next/previous chapters for navigation
    const chapterIndex = module?.chapters.findIndex(c => c.id === chapterId) ?? -1
    const prevChapter = chapterIndex > 0 ? module?.chapters[chapterIndex - 1] : null
    const nextChapter = chapterIndex >= 0 && chapterIndex < (module?.chapters.length ?? 0) - 1
        ? module?.chapters[chapterIndex + 1]
        : null

    // Extract YouTube video ID from youtubeLink
    const getYoutubeVideoId = (url: string) => {
        if (!url) return null;

        // Match YouTube URL patterns
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11)
            ? match[2]
            : null;
    };

    // Get YouTube video ID if available
    const youtubeVideoId = chapter?.youtubeLink ? getYoutubeVideoId(chapter.youtubeLink) : null;

    // Generate a thumbnail URL for the video
    const getVideoThumbnail = (videoUrl?: string, youtubeId?: string | null) => {
        // If we have a YouTube ID, use YouTube thumbnail
        if (youtubeId) {
            return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        }

        // For HTML5 video, we don't have a thumbnail generator
        // Return a default placeholder based on chapter ID for consistency
        const placeholders = [
            "https://via.placeholder.com/640x360/1a1a1a/FFFFFF?text=Video+Placeholder",
            "https://via.placeholder.com/640x360/0a0a0a/FFFFFF?text=Click+to+Play",
            "https://via.placeholder.com/640x360/111111/FFFFFF?text=Video+Content"
        ];

        return placeholders[chapterId % placeholders.length];
    };

    // Format time in MM:SS format
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!videoContainerRef.current) return;

        if (!isFullscreen) {
            if (videoContainerRef.current.requestFullscreen) {
                videoContainerRef.current.requestFullscreen();
            } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
                (videoContainerRef.current as any).webkitRequestFullscreen();
            } else if ((videoContainerRef.current as any).msRequestFullscreen) {
                (videoContainerRef.current as any).msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
        }
    };

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Update handleVideoProgress to include time tracking
    const handleVideoProgress = (progress: number, currentTime: number | undefined, duration: number | undefined) => {
        setVideoProgress(progress);
        if (currentTime !== undefined) {
            setCurrentTime(currentTime);
        }
        if (duration !== undefined) {
            setDuration(duration);
        }
    };

    // Modify video end handler to use modal instead of alerts
    const handleVideoEnd = () => {
        console.log('[ChapterPage] Video ended, setting progress to 100%');

        // First check if chapter is already marked as completed
        if (chapter?.completed || isCompleted) {
            console.log('[ChapterPage] Chapter already marked as completed, just updating UI');
            setVideoProgress(100);
            setIsCompleted(true);
            // Clear position from localStorage since video is completed
            localStorage.removeItem(`video_position_${chapterId}`);
            setShowReplayButton(true);
            return;
        }

        // Set progress to 100%
        setVideoProgress(100);

        // Auto-save completion without prompting
                updateChapterProgress(100);
        setLastProgressUpdateTime(Date.now());
                setIsCompleted(true);
        
        // Clear position from localStorage since video is completed
        localStorage.removeItem(`video_position_${chapterId}`);
        
        // Show completion modal instead of alert
        setCompletionMessage("Congratulations! You've completed this video lesson.");
        setShowCompletionModal(true);
        setShowReplayButton(true);
    };
    
    // Function to close completion modal
    const closeCompletionModal = () => {
        setShowCompletionModal(false);
        };

    // Prevent right-click on the entire page when a video is playing
    useEffect(() => {
        if (!chapter?.isVideoContent) return;

        // Function to prevent context menu
        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Only target video elements instead of the entire document
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
            video.addEventListener('contextmenu', preventContextMenu);
        });

        // Target YouTube iframes
        const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
        iframes.forEach(iframe => {
            // Add protection to the iframe container
            const container = iframe.parentElement;
            if (container) {
                container.addEventListener('contextmenu', preventContextMenu);
            }
        });

        // Cleanup function
        return () => {
            videoElements.forEach(video => {
                video.removeEventListener('contextmenu', preventContextMenu);
            });

            iframes.forEach(iframe => {
                const container = iframe.parentElement;
                if (container) {
                    container.removeEventListener('contextmenu', preventContextMenu);
                }
            });
        };
    }, [chapter?.isVideoContent]);

    // Prevent keyboard shortcuts for saving/downloading content
    useEffect(() => {
        if (!chapter?.isVideoContent) return;

        // Function to prevent keyboard shortcuts
        const preventKeyboardShortcuts = (e: KeyboardEvent) => {
            // Prevent F12, Ctrl+Shift+I (DevTools)
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                console.log('[ChapterPage] Blocked DevTools keyboard shortcut');
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+S (Save)
            if (e.ctrlKey && e.key === 's') {
                console.log('[ChapterPage] Blocked Save keyboard shortcut');
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                console.log('[ChapterPage] Blocked View Source keyboard shortcut');
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+P (Print, which can be used to save as PDF)
            if (e.ctrlKey && e.key === 'p') {
                console.log('[ChapterPage] Blocked Print keyboard shortcut');
                e.preventDefault();
                return false;
            }
        };

        // Add listener for keyboard shortcuts
        document.addEventListener('keydown', preventKeyboardShortcuts);

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', preventKeyboardShortcuts);
        };
    }, [chapter?.isVideoContent]);

    // Add a function to control YouTube playback
    const toggleYouTubePlayback = () => {
        try {
            if (!youtubePlayerRef.current) {
                console.error('[ChapterPage] YouTube player reference not found');
                return;
            }

            // Access the methods exposed through useImperativeHandle
            if (isPlaying) {
                console.log('[ChapterPage] Pausing YouTube video');
                youtubePlayerRef.current.pauseVideo();
            } else {
                console.log('[ChapterPage] Playing YouTube video');
                youtubePlayerRef.current.playVideo();
            }

            // Toggle the state - YouTube will trigger state change events
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error('[ChapterPage] Error controlling YouTube playback:', error);
        }
    };

    // Add a function to control HTML5 video playback
    const toggleVideoPlayback = () => {
        try {
            if (videoRef.current) {
                if (isPlaying) {
                    console.log('[ChapterPage] Pausing HTML5 video');
                    videoRef.current.pause();
                } else {
                    console.log('[ChapterPage] Playing HTML5 video');
                    videoRef.current.play();
                }
                setIsPlaying(!isPlaying);
            } else {
                console.error('[ChapterPage] Video element not found');
            }
        } catch (error) {
            console.error('[ChapterPage] Error controlling video playback:', error);
        }
    };

    // Add a new function to auto-hide the overlay when playing
    const handlePlayStateChange = (playing: boolean) => {
        setIsPlaying(playing);
        // When video starts playing, hide the overlay after a delay
        if (playing) {
            setTimeout(() => {
                setShowPlayPauseOverlay(false);
            }, 2000);
        } else {
            // Always show overlay when paused
            setShowPlayPauseOverlay(true);
        }
    };

    // Update the handlers to use the new function
    const handleVideoPlay = () => {
        setShowReplayButton(false);
        console.log('[ChapterPage] Video play event detected');
        handlePlayStateChange(true);
    };

    const handleVideoPause = () => {
        console.log('[ChapterPage] Video pause event detected');
        handlePlayStateChange(false);
    };

    // Handle replay
    const handleReplay = () => {
        setShowReplayButton(false);
        setVideoProgress(0);
        if (youtubeVideoId && youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
            youtubePlayerRef.current.seekTo(0);
            youtubePlayerRef.current.playVideo();
        } else if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    };

    // After setting videoProgress from API, if it's 100, reset video position and remove from localStorage
    useEffect(() => {
        if (
            chapter &&
            chapter.progressPercentage === 100 &&
            !hasResetOnLoad
        ) {
            setHasResetOnLoad(true);
            localStorage.removeItem(`video_position_${chapterId}`);
            setLastSavedPosition(0);
            // For HTML5 video
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
            }
            // For YouTube
            if (youtubeVideoId && youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
                youtubePlayerRef.current.seekTo(0);
            }
        }
    }, [chapterId, chapter?.progressPercentage, youtubeVideoId, hasResetOnLoad]);

    // Handle loading state
    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar/>
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator/>
                                <BreadcrumbItem>
                                    <Skeleton className="h-5 w-24"/>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-8 w-48"/>
                            <Skeleton className="h-8 w-24"/>
                        </div>

                        <Skeleton className="h-[400px] w-full"/>
                        <Skeleton className="h-12 w-full"/>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    // Handle error state
    if (error) {
        return (
            <SidebarProvider>
                <AppSidebar/>
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator/>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/student-dashboard/my-courses">My Courses</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Content Not Found</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-600">Error</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{error}</p>
                                <div className="flex gap-3 mt-4">
                                    <Button onClick={() => window.location.reload()}>
                                        Try Again
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={`/student-dashboard/my-courses/${courseId}`}>
                                            Back to Course
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    // Mark chapter as completed manually
    const markAsCompleted = async () => {
        try {
            // Check if already completed to prevent duplicate calls
            if (chapter?.completed || isCompleted) {
                console.log('[ChapterPage] Chapter already marked as completed');
                setCompletionMessage("This chapter is already marked as completed.");
                setShowCompletionModal(true);
                return;
            }

            // First update local UI immediately
            setIsCompleted(true)
            setVideoProgress(100)

            // Update local state
            if (chapter) {
                setChapter({
                    ...chapter,
                    completed: true,
                    progressPercentage: 100
                })
            }

                // Check if we're already in the middle of an update
                if (progressUpdating) {
                    console.log('[ChapterPage] Update already in progress, waiting...');
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
                    if (progressUpdating) {
                    setCompletionMessage("Another update is in progress. Please try again in a moment.");
                    setShowCompletionModal(true);
                        return;
                    }
                }

                setProgressUpdating(true)

                // Get JWT token from localStorage
            let token = localStorage.getItem('jwt_token');
            
            // Try alternate token keys if jwt_token not found
            if (!token) {
                console.log('[ChapterPage] jwt_token not found, trying alternate token keys');
                // Check other common token key names
                const possibleTokenKeys = ['token', 'authToken', 'access_token', 'auth_token'];
                
                for (const key of possibleTokenKeys) {
                    const possibleToken = localStorage.getItem(key);
                    if (possibleToken) {
                        console.log(`[ChapterPage] Found token using key: ${key}`);
                        token = possibleToken;
                        break;
                    }
                }

                if (!token) {
                    console.error('Authentication token not found');
                    setCompletionMessage("Authentication token not found. Your progress will only be saved locally.");
                    setShowCompletionModal(true);
                    setProgressUpdating(false);
                    return;
                }
                }

            const response = await fetch(`${env.apiUrl}/student/progress/chapters/${chapterId}/progress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Use the token we found
                    },
                    body: JSON.stringify({
                        progressPercentage: 100,
                        timeSpentSeconds: chapter?.timeSpentSeconds || 0,
                        completed: true
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Failed to mark chapter as completed:', errorData);
                    if (response.status === 401) {
                        // Handle authentication error
                        console.error('Authentication failed. You might need to log in again.');
                    setCompletionMessage("Authentication failed. You might need to log in again. Your progress is saved locally only.");
                    }
                setShowCompletionModal(true);
                    setProgressUpdating(false);
                    return;
                }

            // Clear position from localStorage since chapter is completed
            localStorage.removeItem(`video_position_${chapterId}`);
            
            // Update the timestamp of last progress update
            setLastProgressUpdateTime(Date.now());
            
            // Show success modal
            setCompletionMessage("Chapter successfully marked as completed!");
            setShowCompletionModal(true);
            
        } catch (err) {
            console.error('Error marking chapter as completed:', err)
            setCompletionMessage("Error occurred. Chapter is marked as completed locally only.");
            setShowCompletionModal(true);
        } finally {
            setProgressUpdating(false)
        }
    }

    return (
        <SidebarProvider>
            {/* Global styles to protect videos */}
            <style jsx global>{`
              /* Disable selection and right-click only on video elements */
              video, iframe[src*="youtube.com"] {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
              }

              /* Video container styling */
              .video-container {
                position: relative;
              }

              /* Custom play button styling */
              .video-play-button {
                transform: scale(1);
                opacity: 1;
                transition: transform 0.2s ease, opacity 0.3s ease;
              }

              .video-play-button:hover,
              .video-play-button:focus {
                transform: scale(1.1) !important;
              }

              /* Add shadow to improve visibility */
              .video-play-button svg {
                filter: drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.5));
              }

              /* YouTube iframe sizing fix */
              iframe[src*="youtube.com"] {
                position: absolute;
                top: 0;
                left: 0;
                width: 100% !important;
                height: 100% !important;
                border: 0;
                display: block; /* Ensures no extra space */
                object-fit: cover; /* Ensure video fills the frame without distortion */
              }

              /* Ensure proper aspect ratio */
              .aspect-video {
                aspect-ratio: 16/9;
                overflow: hidden; /* Hide any overflow */
                position: relative;
              }

              /* Hide YouTube UI elements */
              .ytp-pause-overlay,
              .ytp-pause-overlay-container,
              .ytp-related-videos-container,
              .ytp-related-videos-message,
              .ytp-ce-playlist,
              .ytp-ce-element,
              .ytp-endscreen-content,
              .ytp-endscreen-previous,
              .ytp-endscreen-next,
              .ytp-expand-pause-overlay,
              .ytp-suggestions,
              .ytp-ce-video,
              .ytp-ce-playlist-icon,
              .ytp-ce-expanding-overlay,
              .html5-endscreen,
              div[class*="ytp-pause-overlay"],
              div[class*="ytp-endscreen"],
              div[class*="ytp-related"],
              div[class*="ytp-suggestions"],
              div[class*="ytp-ce-"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
                max-width: 0 !important;
                max-height: 0 !important;
              }

              /* Add stronger anti-recommendations overlay */
              .ytp-pause-overlay * {
                display: none !important;
              }

              /* Create anti-recommendations overlay */
              #anti-recommendations-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              /* Ensure controls are visible on mobile */
              @media (max-width: 768px) {
                //.video-controls-overlay {
                //  opacity: 1 !important;
                //}

                .video-play-button {
                  padding: 1.5rem !important;
                }
              }
            `}</style>

            <AppSidebar/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    href={`/student-dashboard/my-courses/${courseId}`}>{course?.title}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                <BreadcrumbPage>{chapter?.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{chapter?.title}</h1>
                            <div className="text-sm text-muted-foreground">
                                Module: {module?.title} • Chapter {chapterIndex + 1} of {module?.chapters.length}
                            </div>
                        </div>
                        <Badge variant={chapter?.completed || isCompleted ? "secondary" : "outline"}
                               className={chapter?.completed || isCompleted ? "bg-green-100 text-green-800" : ""}>
                            {chapter?.completed || isCompleted ? "Completed" : chapter?.free ? "Free" : "Locked"}
                        </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="relative" style={{
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                        MozUserSelect: 'none',
                                        msUserSelect: 'none'
                                    }} ref={videoContainerRef}>
                                        {/* Video Player */}
                                        {chapter?.isVideoContent && youtubeVideoId ? (
                                            <div
                                                className="relative aspect-video overflow-hidden"
                                                onMouseEnter={() => setShowPlayPauseOverlay(true)}
                                                onMouseLeave={() => setShowPlayPauseOverlay(false)}
                                            >
                                                <YouTubePlayer
                                                    videoId={youtubeVideoId}
                                                    onProgress={(progress, currentTime, duration) =>
                                                        handleVideoProgress(progress, currentTime, duration)}
                                                    onVideoEnd={handleVideoEnd}
                                                    startAt={lastSavedPosition || 0}
                                                    className="w-full h-full"
                                                    preventRightClick={true}
                                                    onPlay={() => handlePlayStateChange(true)}
                                                    onPause={() => handlePlayStateChange(false)}
                                                    ref={(player: any) => {
                                                        if (player) {
                                                            youtubePlayerRef.current = player;
                                                        }
                                                    }}
                                                />

                                                {/* Custom video controls */}
                                                <div 
                                                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showPlayPauseOverlay ? 'opacity-100' : 'opacity-0'}`}
                                                    style={{ zIndex: 50 }}
                                                >
                                                    {/* Progress bar */}
                                                    <div 
                                                        className="flex items-center gap-2 mb-2 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const x = e.clientX - rect.left;
                                                            const percentage = (x / rect.width) * 100;
                                                            
                                                            if (youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
                                                                const newTime = (percentage / 100) * duration;
                                                                youtubePlayerRef.current.seekTo(newTime);
                                                            }
                                                        }}
                                                    >
                                                        <span className="text-white text-sm">{formatTime(currentTime)}</span>
                                                        <Progress value={videoProgress} className="flex-1 h-1" />
                                                        <span className="text-white text-sm">{formatTime(duration)}</span>
                                                    </div>

                                                    {/* Control buttons */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                className="text-white hover:text-gray-300 transition-colors p-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (youtubePlayerRef.current) {
                                                                        if (isPlaying) {
                                                                            youtubePlayerRef.current.pauseVideo();
                                                                        } else {
                                                                            youtubePlayerRef.current.playVideo();
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                {isPlaying ? (
                                                                    <Pause className="h-6 w-6" />
                                                                ) : (
                                                                    <Play className="h-6 w-6" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        <button
                                                            className="text-white hover:text-gray-300 transition-colors p-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleFullscreen();
                                                            }}
                                                        >
                                                            {isFullscreen ? (
                                                                <Minimize2 className="h-6 w-6" />
                                                            ) : (
                                                                <Maximize2 className="h-6 w-6" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Overlay to intercept right-clicks */}
                                                <div
                                                    className="absolute top-0 left-0 w-full h-full"
                                                    onContextMenu={(e) => e.preventDefault()}
                                                    style={{pointerEvents: "auto"}}
                                                />

                                                {/* Black overlay when video is not playing */}
                                                {!isPlaying && (
                                                    <div
                                                        className="absolute inset-0 z-10"
                                                        style={{
                                                            backgroundImage: `url(${getVideoThumbnail(chapter?.videoUrl, youtubeVideoId)})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay on top of thumbnail
                                                        }}
                                                    />
                                                )}

                                                {showReplayButton && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                                        <button
                                                            className="video-play-button bg-black bg-opacity-50 rounded-full p-6 cursor-pointer hover:bg-opacity-70 transition-all duration-200"
                                                            onClick={handleReplay}
                                                            aria-label="Replay"
                                                        >
                                                            <RotateCcw className="h-16 w-16 text-white" />
                                                        </button>
                                                        <button
                                                            className="ml-4 text-white underline text-lg"
                                                            onClick={() => setShowReplayButton(false)}
                                                            aria-label="Cancel Replay"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : chapter?.isVideoContent && chapter.videoUrl ? (
                                            <div
                                                className="relative"
                                                onMouseEnter={() => setShowPlayPauseOverlay(true)}
                                                onMouseLeave={() => setShowPlayPauseOverlay(false)}
                                            >
                                                <video
                                                    ref={videoRef}
                                                    className="w-full h-auto"
                                                    controls
                                                    autoPlay
                                                    onTimeUpdate={handleTimeUpdate}
                                                    onLoadedMetadata={handleVideoLoaded}
                                                    onContextMenu={(e) => e.preventDefault()}
                                                    onPlay={handleVideoPlay}
                                                    onPause={handleVideoPause}
                                                    style={{userSelect: 'none'}}
                                                    poster={getVideoThumbnail(chapter?.videoUrl, null)}
                                                >
                                                    <source src={chapter.videoUrl} type="video/mp4"/>
                                                    Your browser does not support the video tag.
                                                </video>

                                                {/* Custom play/pause button */}
                                                <div
                                                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 video-controls-overlay ${
                                                        showPlayPauseOverlay ? 'opacity-100' : 'opacity-0'
                                                    }`}
                                                    onClick={() => setShowPlayPauseOverlay(true)}
                                                    style={{pointerEvents: "auto"}}
                                                >
                                                    <button
                                                        className="video-play-button bg-black bg-opacity-50 rounded-full p-6 cursor-pointer hover:bg-opacity-70 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleVideoPlayback();
                                                        }}
                                                        aria-label={isPlaying ? "Pause" : "Play"}
                                                    >
                                                        {isPlaying ? (
                                                            <Pause className="h-16 w-16 text-white"/>
                                                        ) : (
                                                            <Play className="h-16 w-16 text-white ml-2"/>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Overlay when video is not playing */}
                                                {!isPlaying && (
                                                    <div
                                                        className="absolute inset-0 z-10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleVideoPlayback();
                                                        }}
                                                        style={{
                                                            backgroundImage: `url(${getVideoThumbnail(chapter?.videoUrl, null)})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for HTML5 video thumbnails
                                                        }}
                                                    >
                                                        <div
                                                            className="w-full h-full flex items-center justify-center backdrop-brightness-50">
                                                            <button
                                                                className="video-play-button bg-black bg-opacity-50 rounded-full p-6 cursor-pointer hover:bg-opacity-70 transition-all duration-200"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleVideoPlayback();
                                                                }}
                                                            >
                                                                <Play className="h-20 w-20 text-white"/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                className="flex items-center justify-center w-full aspect-video bg-muted/20">
                                                <div className="text-center">
                                                    <FileText size={48} className="mx-auto mb-2 text-muted-foreground"/>
                                                    <p>This chapter does not contain video content.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Description and Materials */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{chapter?.description || "No description available for this chapter."}</p>

                                    <div className="flex flex-wrap gap-3 mt-6">
                                        <Button variant="outline">
                                            <FileText className="h-4 w-4 mr-2"/>
                                            Lesson Notes
                                        </Button>
                                        <Button variant="outline">
                                            <Download className="h-4 w-4 mr-2"/>
                                            Download Materials
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents */}
                            {(chapter as any)?.documents && (chapter as any).documents.length > 0 && (
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle>Documents</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(chapter as any).documents.map((doc: any, idx: number) => (
                                                <div key={doc.url || doc.name || idx} className="flex items-center p-2 border rounded-md">
                                                    <FileText className="h-5 w-5 mr-3 text-blue-500" />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{doc.name}</p>
                                                        <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex justify-between mt-4">
                            <Button
                                variant="outline"
                                disabled={!prevChapter}
                                onClick={() => prevChapter && router.push(`/student-dashboard/my-courses/${courseId}/${prevChapter.id}`)}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4"/>
                                {prevChapter ? `Previous: ${prevChapter.title}` : "No Previous Chapter"}
                            </Button>

                            <Button
                                variant="outline"
                                disabled={!nextChapter || (!nextChapter.free && !(chapter?.completed || isCompleted))}
                                onClick={() => nextChapter && router.push(`/student-dashboard/my-courses/${courseId}/${nextChapter.id}`)}
                                className="gap-2"
                            >
                                {nextChapter ? "Next Chapter" : "No Next Chapter"}
                                <ChevronRight className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </main>
            </SidebarInset>

            {/* Add Completion Success Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <div className="text-center mb-4">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <h3 className="text-lg font-semibold">Chapter Completed!</h3>
                            <p className="text-gray-600 mt-1">{completionMessage}</p>
                        </div>
                        <div className="flex justify-center">
                            <Button onClick={closeCompletionModal} className="mr-2">
                                Continue
                            </Button>
                            {nextChapter && (
                                <Button variant="outline" 
                                        onClick={() => router.push(`/student-dashboard/my-courses/${courseId}/${nextChapter.id}`)}>
                                    Next Chapter
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </SidebarProvider>
    )
}

