"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DownloadData {
    total: number;
}

async function fetchTotalDownloads(): Promise<number> {
    try {
        // npm API: total downloads from package creation to now
        const res = await fetch(
            "https://api.npmjs.org/downloads/point/2000-01-01:2099-12-31/draw2agent"
        );
        if (!res.ok) return 0;
        const data: DownloadData = await res.json();
        return data.total ?? 0;
    } catch {
        return 0;
    }
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

export default function NpmDownloads() {
    const [downloads, setDownloads] = useState<number | null>(null);

    useEffect(() => {
        fetchTotalDownloads().then((count) => {
            if (count > 0) setDownloads(count);
        });
    }, []);

    return (
        <AnimatePresence>
            {downloads !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[13px] font-medium text-[rgba(255,255,255,0.6)]"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span className="text-white font-semibold">
                        {formatNumber(downloads)}+
                    </span>{" "}
                    downloads on npm
                </motion.div>
            )}
        </AnimatePresence>
    );
}
