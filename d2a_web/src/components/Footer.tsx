"use client";

import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="border-t border-[rgba(255,255,255,0.08)] pt-14 pb-10 px-6 bg-[#0a0a0f]">
            <div className="max-w-[1100px] mx-auto">
                {/* Brand */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-9"
                >
                    <div className="flex items-center justify-center gap-2.5 mb-4">
                        <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
                            <rect x="2" y="2" width="24" height="24" rx="6" stroke="url(#fGrad)" strokeWidth="2" />
                            <path d="M8 18 L12 10 L16 14 L20 8" stroke="url(#fGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="20" cy="8" r="2" fill="url(#fGrad)" />
                            <defs>
                                <linearGradient id="fGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#818cf8" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="font-bold text-lg tracking-tight">draw2agent</span>
                    </div>
                    <p className="text-sm text-[rgba(255,255,255,0.6)] max-w-[480px] mx-auto mb-5 leading-relaxed">
                        Open source MCP server for visual web development. Draw changes on your localhost app and watch your coding agent build them in real-time.
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)] tracking-wider font-medium">
                        MCP SDK • Node.js • Canvas API
                    </p>
                </motion.div>

                {/* Divider */}
                <div className="h-px bg-[rgba(255,255,255,0.08)] mb-6" />

                {/* Bottom */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-center"
                >
                    {/* Open Source Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.05)] text-sm text-[rgba(255,255,255,0.6)] mb-5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        This project is <strong className="text-[#818cf8]">open source</strong> and free to use.
                    </div>

                    <p className="text-sm text-[rgba(255,255,255,0.6)] mb-2">
                        Developed and maintained by{" "}
                        <a
                            href="https://github.com/zero-abd"
                            target="_blank"
                            rel="noopener"
                            className="text-[#818cf8] font-semibold underline decoration-[rgba(129,140,248,0.3)] underline-offset-[3px] hover:text-[#a5b4fc] hover:decoration-[rgba(129,140,248,0.6)] transition-all"
                        >
                            Abdullah Al Mahmud
                        </a>
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)]">
                        © 2026 draw2agent • All Rights Reserved
                    </p>
                </motion.div>
            </div>
        </footer>
    );
}
