"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 backdrop-blur-xl border rounded-full transition-all duration-300 w-auto ${scrolled
                ? "border-[rgba(99,102,241,0.5)] bg-black/80 shadow-[0_10px_50px_rgba(99,102,241,0.6)]"
                : "border-[rgba(99,102,241,0.3)] bg-black/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                }`}
        >
            <div className="px-4 sm:px-6 h-14 flex items-center gap-6 sm:gap-12">
                <Link href="#" className="flex items-center gap-2.5 font-bold text-lg tracking-tight shrink-0">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 28 28" fill="none">
                        <rect x="2" y="2" width="24" height="24" rx="6" stroke="url(#logoGrad)" strokeWidth="2" />
                        <path d="M8 18 L12 10 L16 14 L20 8" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="20" cy="8" r="2" fill="url(#logoGrad)" />
                        <defs>
                            <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="hidden sm:inline">draw2agent</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="#install" className="text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors font-medium">
                        Install
                    </Link>
                    <Link href="#features" className="text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors font-medium">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-sm text-[rgba(255,255,255,0.7)] hover:text-white transition-colors font-medium">
                        How It Works
                    </Link>
                </div>

                <a
                    href="https://github.com/zero-abd"
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[rgba(255,255,255,0.15)] text-[13px] sm:text-sm font-medium hover:border-[rgba(99,102,241,0.5)] hover:bg-[rgba(99,102,241,0.15)] hover:text-white transition-all shadow-sm shrink-0"
                >
                    <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span className="hidden sm:inline">GitHub</span>
                </a>
            </div>
        </motion.nav>
    );
}
