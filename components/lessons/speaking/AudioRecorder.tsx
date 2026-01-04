"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, RotateCcw, Play, Pause, Send, X, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AudioRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    isProcessing?: boolean;
    className?: string;
    minDuration?: number; // minimum recording duration in seconds
}

export function AudioRecorder({
    onRecordingComplete,
    isProcessing = false,
    className,
    minDuration = 2, // minimum 2 seconds of recording
}: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    // Cleanup audio URL when blob changes
    useEffect(() => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            setAudioUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [recordedBlob]);

    const cleanup = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const startRecording = async () => {
        try {
            // Reset previous recording
            setRecordedBlob(null);
            setAudioUrl(null);
            setPlaybackProgress(0);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setRecordedBlob(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording:", err);
            alert("Could not access microphone. Please ensure permissions are granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        if (isRecording) {
            // Stop without saving
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.ondataavailable = null;
                mediaRecorderRef.current.onstop = null;
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        // Reset state
        setRecordedBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setPlaybackProgress(0);
    };

    const submitRecording = () => {
        if (recordedBlob && recordingTime >= minDuration) {
            onRecordingComplete(recordedBlob);
        }
    };

    const togglePlayback = () => {
        if (!audioRef.current || !audioUrl) return;
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setPlaybackProgress(progress);
        }
    };

    const handlePlaybackEnded = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const isTooShort = recordingTime < minDuration && recordedBlob !== null;

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>
            {/* Hidden audio element for playback */}
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handlePlaybackEnded}
                />
            )}

            {/* Recording Time Display */}
            <div className="text-center mb-2">
                <span className={cn(
                    "text-3xl font-mono font-bold transition-colors",
                    isRecording ? "text-red-500 animate-pulse" : "text-foreground"
                )}>
                    {formatTime(recordingTime)}
                </span>
                {minDuration > 0 && !recordedBlob && !isRecording && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Minimum {minDuration} seconds required
                    </p>
                )}
            </div>

            {/* Main Recording Button */}
            <div className="flex items-center gap-4">
                {isRecording ? (
                    <Button
                        variant="destructive"
                        size="lg"
                        className="h-20 w-20 rounded-full shadow-lg relative"
                        onClick={stopRecording}
                    >
                        <Square className="h-8 w-8" />
                        <span className="sr-only">Stop Recording</span>
                        {/* Pulsing ring animation */}
                        <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-30" />
                    </Button>
                ) : recordedBlob ? (
                    // Playback button when recording is done
                    <Button
                        variant="outline"
                        size="lg"
                        className={cn(
                            "h-20 w-20 rounded-full border-2 transition-all",
                            isPlaying ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""
                        )}
                        onClick={togglePlayback}
                        disabled={isProcessing}
                    >
                        {isPlaying ? (
                            <Pause className="h-8 w-8 text-green-600" />
                        ) : (
                            <Play className="h-8 w-8 text-green-600 ml-1" />
                        )}
                        <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        size="lg"
                        className="h-20 w-20 rounded-full shadow-lg hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700"
                        onClick={startRecording}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                            <Mic className="h-8 w-8" />
                        )}
                        <span className="sr-only">Start Recording</span>
                    </Button>
                )}
            </div>

            {/* Status Text */}
            <p className={cn(
                "text-sm transition-colors",
                isRecording ? "text-red-500 animate-pulse font-medium" : "text-muted-foreground"
            )}>
                {isRecording ? (
                    "Recording... Tap to stop"
                ) : recordedBlob ? (
                    <span className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        {isPlaying ? "Playing..." : "Tap to preview your recording"}
                    </span>
                ) : (
                    "Tap microphone to start recording"
                )}
            </p>

            {/* Playback Progress Bar */}
            {recordedBlob && (
                <div className="w-full max-w-xs">
                    <Progress value={playbackProgress} className="h-2" />
                </div>
            )}

            {/* Action Buttons */}
            {(isRecording || recordedBlob) && (
                <div className="flex items-center gap-3 mt-4">
                    {/* Cancel Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelRecording}
                        disabled={isProcessing}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>

                    {/* Re-record Button (only when recording is done) */}
                    {recordedBlob && !isRecording && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={startRecording}
                            disabled={isProcessing}
                            className="gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Re-record
                        </Button>
                    )}

                    {/* Submit Button */}
                    {recordedBlob && !isRecording && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={submitRecording}
                            disabled={isProcessing || isTooShort}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Submit
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}

            {/* Warning for too short recording */}
            {isTooShort && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Recording is too short. Please record at least {minDuration} seconds.
                </p>
            )}
        </div>
    );
}
