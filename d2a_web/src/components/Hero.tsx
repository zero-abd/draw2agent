"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

function TypingTerminal() {
    const command = "npx -y draw2agent@latest";
    const [text, setText] = useState("");
    const [charIndex, setCharIndex] = useState(0);

    useEffect(() => {
        if (charIndex <= command.length) {
            const timeout = setTimeout(() => {
                setText(command.slice(0, charIndex));
                setCharIndex((i) => i + 1);
            }, 60 + Math.random() * 40);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setText("");
                setCharIndex(0);
            }, 4000);
            return () => clearTimeout(timeout);
        }
    }, [charIndex]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="max-w-[520px] mx-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,20,0.8)] backdrop-blur-md overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
            <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.08)]">
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs text-[rgba(255,255,255,0.4)] font-medium">Terminal</span>
            </div>
            <div className="px-5 py-5 font-mono text-[15px] flex items-center gap-2">
                <span className="text-green-500 font-semibold">$</span>
                <span className="text-[#f0f0f5]">{text}</span>
                <span className="text-[#818cf8] cursor-blink">|</span>
            </div>
        </motion.div>
    );
}

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[120px] pb-20 px-6">
            <div className="grid-bg" />
            <div className="hero-glow" />

            <div className="relative z-10 text-center max-w-[800px] mx-auto">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[13px] font-medium text-[rgba(255,255,255,0.6)] mb-8"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] pulse-dot" />
                    Open Source MCP Server
                </motion.div>

                {/* Headline */}
                <motion.h1
                    className="text-[clamp(2.5rem,6vw,4rem)] font-[800] leading-[1.1] tracking-[-0.03em] mb-6"
                >
                    <motion.span
                        className="block"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    >
                        Draw on your app.
                    </motion.span>
                    <motion.span
                        className="block gradient-text"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    >
                        Ship changes instantly.
                    </motion.span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    className="text-lg text-[rgba(255,255,255,0.6)] max-w-[600px] mx-auto mb-10 leading-relaxed"
                >
                    Draw and annotate changes directly on top of your localhost website.
                    Your coding agent sees your sketches and implements the changes in
                    real-time — making web development faster than ever.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
                >
                    <Link
                        href="#install"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold bg-gradient-to-br from-[#6366f1] to-[#818cf8] text-white shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 w-full sm:w-auto justify-center"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Add MCP Server
                    </Link>
                    <a
                        href="https://github.com/zero-abd"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold bg-[rgba(255,255,255,0.03)] text-white border border-[rgba(255,255,255,0.08)] hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(255,255,255,0.06)] hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto justify-center"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                    </a>
                </motion.div>

                {/* Terminal */}
                <TypingTerminal />
            </div>
        </section>
    );
}
