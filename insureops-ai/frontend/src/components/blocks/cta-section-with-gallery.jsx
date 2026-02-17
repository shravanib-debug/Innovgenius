import { useRef } from "react"
import { motion, useInView } from "motion/react"
import { ArrowRight, BarChart3, Brain, Zap, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const galleryImages = [
    {
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
        alt: "Analytics Dashboard",
        className: "col-span-2 row-span-2",
    },
    {
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        alt: "Data Visualization",
        className: "col-span-1 row-span-1",
    },
    {
        src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=300&fit=crop",
        alt: "AI Technology",
        className: "col-span-1 row-span-1",
    },
    {
        src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=400&fit=crop",
        alt: "Financial Growth",
        className: "col-span-1 row-span-2",
    },
    {
        src: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=300&fit=crop",
        alt: "Smart Monitoring",
        className: "col-span-2 row-span-1",
    },
]

const features = [
    {
        icon: BarChart3,
        title: "Real-time Analytics",
        desc: "Monitor agent performance with live dashboards and custom alerts.",
    },
    {
        icon: Brain,
        title: "Smart Insights",
        desc: "AI-powered trend analysis and predictive risk scoring.",
    },
    {
        icon: Zap,
        title: "Instant Actions",
        desc: "Trigger and monitor AI agents directly from the console.",
    },
]

function CtaSectionWithGallery() {
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

    return (
        <section
            ref={sectionRef}
            className="relative w-full max-w-7xl mx-auto px-6 py-20 lg:py-28"
        >
            {/* Subtle top border */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, rgba(232,114,42,0.2), transparent)",
                }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* ─── Left: Content ─── */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex flex-col gap-8"
                >
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest w-fit"
                        style={{
                            background: "rgba(232, 114, 42, 0.08)",
                            border: "1px solid rgba(232, 114, 42, 0.2)",
                            color: "#e8722a",
                        }}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        Why InsureOps AI
                    </div>

                    {/* Heading */}
                    <h2
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight"
                        style={{ color: "#f1ebe4" }}
                    >
                        Built for teams that{" "}
                        <span
                            className="font-serif italic font-normal"
                            style={{
                                background: "linear-gradient(135deg, #f97316, #f2923c)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            move fast
                        </span>
                    </h2>

                    {/* Description */}
                    <p
                        className="text-base lg:text-lg leading-relaxed max-w-lg"
                        style={{ color: "rgba(168, 152, 136, 0.85)" }}
                    >
                        From monitoring AI agent performance to triggering instant actions —
                        everything you need to manage insurance operations at scale.
                    </p>

                    {/* Feature list */}
                    <div className="flex flex-col gap-5">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                                className="flex items-start gap-4 group"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                                    style={{
                                        background: "rgba(232, 114, 42, 0.08)",
                                        border: "1px solid rgba(232, 114, 42, 0.12)",
                                    }}
                                >
                                    <feature.icon
                                        className="w-5 h-5"
                                        style={{ color: "#e8722a" }}
                                    />
                                </div>
                                <div>
                                    <h3
                                        className="text-[15px] font-semibold mb-1"
                                        style={{ color: "#e8ddd0" }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: "rgba(168, 152, 136, 0.7)" }}
                                    >
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        <Button size="lg" asChild>
                            <a href="/dashboard">
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </Button>
                        <Button variant="secondary" size="lg" asChild>
                            <a href="#demo">
                                <TrendingUp className="w-4 h-4" />
                                View Demo
                            </a>
                        </Button>
                    </div>
                </motion.div>

                {/* ─── Right: Image Gallery ─── */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="grid grid-cols-3 grid-rows-3 gap-3 h-[500px] lg:h-[560px]"
                >
                    {galleryImages.map((img, i) => (
                        <motion.div
                            key={img.alt}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                            className={`relative overflow-hidden rounded-2xl group cursor-pointer ${img.className}`}
                            style={{
                                border: "1px solid rgba(168, 144, 112, 0.1)",
                            }}
                        >
                            <img
                                src={img.src}
                                alt={img.alt}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div
                                className="absolute inset-0 transition-opacity duration-300 opacity-50 group-hover:opacity-30"
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(8,8,8,0.7), rgba(8,8,8,0.3))",
                                }}
                            />
                            {/* Label */}
                            <div className="absolute bottom-3 left-3 right-3">
                                <span
                                    className="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-md"
                                    style={{
                                        background: "rgba(8, 8, 8, 0.5)",
                                        color: "rgba(241, 235, 228, 0.8)",
                                        border: "1px solid rgba(168, 144, 112, 0.12)",
                                    }}
                                >
                                    {img.alt}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

function AboutDemo() {
    return <CtaSectionWithGallery />
}

export { AboutDemo, CtaSectionWithGallery }
