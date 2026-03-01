"use client";

import { motion } from "framer-motion";

const features = [
    {
        title: "Draw Directly on Your App",
        desc: "Open an overlay on your running localhost app. Sketch UI changes, draw arrows, circle elements — your coding agent sees it all.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
            </svg>
        ),
    },
    {
        title: "Real-Time Code Changes",
        desc: "Your annotations are instantly sent to your coding agent via MCP. Watch as your drawn changes become actual code in seconds.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
    },
    {
        title: "Works With Any Framework",
        desc: "React, Next.js, Vue, Svelte, plain HTML — if it runs on localhost, draw2agent works with it. Zero config required.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
    },
    {
        title: "Multi-Agent Compatible",
        desc: "Works seamlessly with Cursor, Antigravity, Claude Code, and other MCP-compatible coding agents and IDEs.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        title: "Annotate & Describe",
        desc: "Add text labels, arrows, and notes alongside your drawings. Give your agent precise context for pixel-perfect implementation.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        ),
    },
    {
        title: "Faster Iteration Loops",
        desc: "Skip the back-and-forth of describing UI changes in text. Draw what you want, get it built — 10x faster development cycles.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: i * 0.1,
            ease: "easeOut",
        },
    }),
};

export default function Features() {
    return (
        <section id="features" className="py-24 px-6 relative">
            <div className="max-w-[1100px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.1em] text-[#818cf8] mb-4">
                        Features
                    </span>
                    <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-[800] tracking-[-0.02em] mb-4">
                        Why <span className="gradient-text">draw2agent</span>?
                    </h2>
                    <p className="text-[17px] text-[rgba(255,255,255,0.6)] max-w-[550px] mx-auto">
                        Supercharge your development workflow by bridging the gap between visual intent and code.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }}
                            variants={cardVariants}
                            whileHover={{ y: -6, transition: { duration: 0.25 } }}
                            className="glass-card rounded-2xl p-8 relative overflow-hidden group cursor-default"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10">
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.2)] mb-5">
                                    <div className="w-[22px] h-[22px] text-[#818cf8]">{f.icon}</div>
                                </div>
                                <h3 className="text-[17px] font-bold mb-2.5 tracking-tight">{f.title}</h3>
                                <p className="text-sm text-[rgba(255,255,255,0.6)] leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
