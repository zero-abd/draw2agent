"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TabKey = "cursor" | "antigravity" | "windsurf" | "claude-code" | "openai";

interface TabDef {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
}

const tabs: TabDef[] = [
    {
        key: "cursor",
        label: "Cursor",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2l16 10L4 22V2z" /></svg>,
    },
    {
        key: "antigravity",
        label: "Antigravity",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    },
    {
        key: "windsurf",
        label: "Windsurf",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>,
    },
    {
        key: "claude-code",
        label: "Claude Code",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
    },
    {
        key: "openai",
        label: "OpenAI Codex",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>,
    },
];

const mcpJson = `{
  "mcpServers": {
    "draw2agent": {
      "command": "npx",
      "args": ["-y", "draw2agent@latest"]
    }
  }
}`;

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(() => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [text]);

    return (
        <button
            onClick={copy}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${copied
                ? "text-green-400"
                : "text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                }`}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}

function CodeBlock({ filename, code }: { filename: string; code: string }) {
    return (
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,20,0.6)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
                <span className="text-xs text-[rgba(255,255,255,0.4)] font-medium">{filename}</span>
                <CopyButton text={code} />
            </div>
            <pre className="px-5 py-4 overflow-x-auto">
                <code className="font-mono text-[13px] text-[#f0f0f5] leading-relaxed whitespace-pre">{code}</code>
            </pre>
        </div>
    );
}

function TabCursor() {
    return (
        <>
            <div className="mb-6">
                <h4 className="text-[15px] font-semibold mb-2">Option 1: Direct Deep Link</h4>
                <p className="text-sm text-[rgba(255,255,255,0.6)] mb-3">Click to add draw2agent directly to Cursor:</p>
                <a
                    href="cursor://anysphere.cursor-deeplink/mcp/install?name=draw2agent&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImRyYXcyYWdlbnRAbGF0ZXN0Il19"
                    className="flex w-full justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-[#6366f1] to-[#818cf8] text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    Add to Cursor Directly
                </a>
            </div>
            <div>
                <h4 className="text-[15px] font-semibold mb-2">Option 2: Manual Configuration</h4>
                <p className="text-sm text-[rgba(255,255,255,0.6)] mb-3">
                    Add to <code className="bg-[rgba(99,102,241,0.15)] text-[#818cf8] px-1.5 py-0.5 rounded text-xs font-mono">.cursor/mcp.json</code>:
                </p>
                <CodeBlock filename=".cursor/mcp.json" code={mcpJson} />
            </div>
        </>
    );
}

function TabAntigravity() {
    return (
        <div>
            <h4 className="text-[15px] font-semibold mb-2">Antigravity Setup</h4>
            <p className="text-sm text-[rgba(255,255,255,0.6)] mb-3">Antigravity supports MCP servers natively. Add this to your MCP configuration:</p>
            <CodeBlock filename="MCP Server Configuration" code={mcpJson} />
            <p className="mt-3 text-xs text-[rgba(255,255,255,0.4)]">💡 Antigravity auto-detects MCP servers. Just add the config and restart your workspace.</p>
        </div>
    );
}

function TabWindsurf() {
    return (
        <div>
            <h4 className="text-[15px] font-semibold mb-2">Windsurf / AI IDEs</h4>
            <p className="text-sm text-[rgba(255,255,255,0.6)] mb-3">Add draw2agent to your Windsurf MCP configuration file:</p>
            <CodeBlock filename="~/.codeium/windsurf/mcp_config.json" code={mcpJson} />
        </div>
    );
}

function TabClaudeCode() {
    return (
        <div>
            <h4 className="text-[15px] font-semibold mb-2">Claude Code</h4>
            <p className="text-sm text-[rgba(255,255,255,0.6)] mb-3">Use the Claude Code CLI to add draw2agent:</p>
            <CodeBlock filename="Terminal" code="claude mcp add draw2agent -- npx -y draw2agent@latest" />
            <p className="mt-3 text-sm text-[rgba(255,255,255,0.6)]">
                Or add manually to your <code className="bg-[rgba(99,102,241,0.15)] text-[#818cf8] px-1.5 py-0.5 rounded text-xs font-mono">claude_desktop_config.json</code>:
            </p>
            <div className="mt-3">
                <CodeBlock filename="claude_desktop_config.json" code={mcpJson} />
            </div>
        </div>
    );
}

function TabOpenAI() {
    return (
        <div>
            <h4 className="text-[15px] font-semibold mb-2">OpenAI Codex / Agents</h4>
            <p className="text-sm text-[rgba(255,255,255,0.6)] mb-3">Add draw2agent as an MCP tool provider for OpenAI-compatible agents:</p>
            <CodeBlock filename="MCP Configuration" code={mcpJson} />
        </div>
    );
}

const tabContent: Record<TabKey, React.ReactNode> = {
    cursor: <TabCursor />,
    antigravity: <TabAntigravity />,
    windsurf: <TabWindsurf />,
    "claude-code": <TabClaudeCode />,
    openai: <TabOpenAI />,
};

export default function Install() {
    const [active, setActive] = useState<TabKey>("cursor");

    return (
        <section id="install" className="py-24 px-6 border-t border-[rgba(255,255,255,0.08)]">
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
                        Getting Started
                    </span>
                    <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-[800] tracking-[-0.02em] mb-4">
                        Add to your <span className="gradient-text">workspace</span>
                    </h2>
                    <p className="text-[17px] text-[rgba(255,255,255,0.6)] max-w-[550px] mx-auto">
                        Set up draw2agent in your favorite coding environment in under a minute.
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="max-w-[720px] mx-auto"
                >
                    {/* Tab buttons */}
                    <div className="flex gap-1.5 flex-wrap mb-7 p-1.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActive(tab.key)}
                                className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all flex-1 justify-center whitespace-nowrap ${active === tab.key
                                    ? "text-white"
                                    : "text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                                    }`}
                            >
                                {active === tab.key && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[#6366f1] rounded-lg shadow-[0_2px_10px_rgba(99,102,241,0.3)]"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {tab.icon}
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tabContent[active]}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
