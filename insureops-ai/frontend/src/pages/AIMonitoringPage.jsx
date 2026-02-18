"use client"

import { motion } from "framer-motion"
import { useMemo, useState, useCallback, useEffect, useRef, createContext, useContext } from "react"
import { Volume2, VolumeX } from "lucide-react"



const SplitFlapAudioContext = createContext(null)

function useSplitFlapAudio() {
    return useContext(SplitFlapAudioContext)
}

export function SplitFlapAudioProvider({ children }) {
    const [isMuted, setIsMuted] = useState(true)
    const audioContextRef = useRef(null)

    const getAudioContext = useCallback(() => {
        if (typeof window === "undefined") return null
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass()
            }
        }
        return audioContextRef.current
    }, [])

    const triggerHaptic = useCallback(() => {
        if (isMuted) return
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(10)
        }
    }, [isMuted])

    const playClick = useCallback(() => {
        if (isMuted) return

        triggerHaptic()

        try {
            const ctx = getAudioContext()
            if (!ctx) return

            if (ctx.state === "suspended") {
                ctx.resume()
            }

            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()
            const filter = ctx.createBiquadFilter()
            const lowpass = ctx.createBiquadFilter()

            oscillator.type = "square"
            oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.015)

            filter.type = "bandpass"
            filter.frequency.setValueAtTime(1200, ctx.currentTime)
            filter.Q.setValueAtTime(0.8, ctx.currentTime)

            lowpass.type = "lowpass"
            lowpass.frequency.value = 2500
            lowpass.Q.value = 0.5

            gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)

            oscillator.connect(filter)
            filter.connect(gainNode)
            gainNode.connect(lowpass)
            lowpass.connect(ctx.destination)

            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.02)
        } catch {
            // Audio not supported
        }
    }, [isMuted, getAudioContext, triggerHaptic])

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => !prev)
        if (isMuted) {
            try {
                const ctx = getAudioContext()
                if (ctx && ctx.state === "suspended") {
                    ctx.resume()
                }
            } catch {
                // Audio not supported
            }
        }
    }, [isMuted, getAudioContext])

    const value = useMemo(() => ({ isMuted, toggleMute, playClick }), [isMuted, toggleMute, playClick])

    return <SplitFlapAudioContext.Provider value={value}>{children}</SplitFlapAudioContext.Provider>
}

export function SplitFlapMuteToggle({ className = "" }) {
    const audio = useSplitFlapAudio()
    if (!audio) return null

    return (
        <button
            onClick={audio.toggleMute}
            className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#a89888] hover:text-[#f1ebe4] transition-colors duration-200 ${className}`}
            aria-label={audio.isMuted ? "Unmute sound effects" : "Mute sound effects"}
        >
            {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{audio.isMuted ? "Sound Off" : "Sound On"}</span>
        </button>
    )
}

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("")

function SplitFlapTextInner({ text, className = "", speed = 50 }) {
    const chars = useMemo(() => text.split(""), [text])
    const [animationKey, setAnimationKey] = useState(0)
    const [hasInitialized, setHasInitialized] = useState(false)
    const audio = useSplitFlapAudio()

    const handleMouseEnter = useCallback(() => {
        setAnimationKey((prev) => prev + 1)
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasInitialized(true)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div
            className={`inline-flex gap-[0.08em] items-center cursor-pointer ${className}`}
            aria-label={text}
            onMouseEnter={handleMouseEnter}
            style={{ perspective: "1000px" }}
        >
            {chars.map((char, index) => (
                <SplitFlapChar
                    key={index}
                    char={char.toUpperCase()}
                    index={index}
                    animationKey={animationKey}
                    skipEntrance={hasInitialized}
                    speed={speed}
                    playClick={audio?.playClick}
                />
            ))}
        </div>
    )
}

export function SplitFlapText(props) {
    return <SplitFlapTextInner {...props} />
}

function SplitFlapChar({ char, index, animationKey, skipEntrance, speed, playClick }) {
    const displayChar = CHARSET.includes(char) ? char : " "
    const isSpace = char === " "
    const [currentChar, setCurrentChar] = useState(skipEntrance ? displayChar : " ")
    const [isSettled, setIsSettled] = useState(skipEntrance)
    const intervalRef = useRef(null)
    const timeoutRef = useRef(null)

    const tileDelay = 0.15 * index

    // Using theme colors: #1c1815 for card bg, #e8722a (orange) for text
    const bgColor = isSettled ? "#1c1815" : "rgba(232, 114, 42, 0.2)"
    const textColor = isSettled ? "#f1ebe4" : "#e8722a"

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        if (isSpace) {
            setCurrentChar(" ")
            setIsSettled(true)
            return
        }

        setIsSettled(false)
        setCurrentChar(CHARSET[Math.floor(Math.random() * CHARSET.length)])

        const baseFlips = 8
        const startDelay = skipEntrance ? tileDelay * 400 : tileDelay * 800
        let flipIndex = 0
        let hasStartedSettling = false

        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                const settleThreshold = baseFlips + index * 3

                if (flipIndex >= settleThreshold && !hasStartedSettling) {
                    hasStartedSettling = true
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    setCurrentChar(displayChar)
                    setIsSettled(true)
                    if (playClick) playClick()
                    return
                }
                setCurrentChar(CHARSET[Math.floor(Math.random() * CHARSET.length)])
                if (flipIndex % 2 === 0 && playClick) playClick()
                flipIndex++
            }, speed)
        }, startDelay)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [displayChar, isSpace, tileDelay, animationKey, skipEntrance, index, speed, playClick])

    if (isSpace) {
        return (
            <div
                style={{
                    width: "0.3em",
                    fontSize: "clamp(2rem, 8vw, 6rem)", // Adjusted size
                }}
            />
        )
    }

    return (
        <motion.div
            initial={skipEntrance ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tileDelay, duration: 0.3, ease: "easeOut" }}
            className="relative overflow-hidden flex items-center justify-center font-bold font-mono rounded-md"
            style={{
                fontSize: "clamp(2rem, 8vw, 6rem)", // Adjusted size
                width: "0.65em",
                height: "1.05em",
                backgroundColor: bgColor,
                transformStyle: "preserve-3d",
                transition: "background-color 0.15s ease",
                borderColor: "#2a201a",
                borderWidth: "1px",
            }}
        >
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/40 pointer-events-none z-10" />

            <div className="absolute inset-x-0 top-0 bottom-1/2 flex items-end justify-center overflow-hidden">
                <span
                    className="block translate-y-[0.52em] leading-none transition-colors duration-150"
                    style={{ color: textColor }}
                >
                    {currentChar}
                </span>
            </div>

            <div className="absolute inset-x-0 top-1/2 bottom-0 flex items-start justify-center overflow-hidden">
                <span
                    className="-translate-y-[0.52em] leading-none transition-colors duration-150"
                    style={{ color: textColor }}
                >
                    {currentChar}
                </span>
            </div>

            <motion.div
                key={`${animationKey}-${isSettled}`}
                initial={{ rotateX: -90 }}
                animate={{ rotateX: 0 }}
                transition={{
                    delay: skipEntrance ? tileDelay * 0.5 : tileDelay + 0.15,
                    duration: 0.25,
                    ease: [0.22, 0.61, 0.36, 1],
                }}
                className="absolute inset-x-0 top-0 bottom-1/2 origin-bottom overflow-hidden"
                style={{
                    backgroundColor: bgColor,
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    transition: "background-color 0.15s ease",
                }}
            >
                <div className="flex h-full items-end justify-center">
                    <span
                        className="translate-y-[0.52em] leading-none transition-colors duration-150"
                        style={{ color: textColor }}
                    >
                        {currentChar}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    )
}

const AIMonitoringPage = () => {
    return (
        <SplitFlapAudioProvider>
            <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-12">
                <div className="text-center space-y-4">
                    <p className="text-[#e8722a] font-mono tracking-widest text-sm mb-4">SYSTEM STATUS</p>
                    <SplitFlapText text="AI MONITORING" />
                </div>
                <div className="text-center space-y-4">
                    <SplitFlapText text="ACTIVE" />
                </div>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <SplitFlapMuteToggle />
                    <p className="text-[#a89888] max-w-md text-center">
                        Real-time system analysis active. Monitoring transaction anomalies and policy risks.
                    </p>
                </div>
            </div>
        </SplitFlapAudioProvider>
    );
};

export default AIMonitoringPage;
