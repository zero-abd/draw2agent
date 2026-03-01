"use client";

import { motion } from "framer-motion";

const steps = [
    {
        num: "01",
        title: "Install & Connect",
        desc: "Add draw2agent as an MCP server to your favorite coding IDE or agent. One command, zero configuration.",
    },
    {
        num: "02",
        title: "Draw Your Changes",
        desc: "Open the drawing overlay on your running localhost app. Sketch, annotate, and mark exactly what you want changed.",
    },
    {
        num: "03",
        title: "Watch It Build",
        desc: "Your agent receives the annotations via MCP and implements the changes in real-time. See your code update live.",
    },
];

function ArrowConnector() {
    return (
        <div className="flex-shrink-0 w-[60px] flex items-center max-lg:rotate-90">
            <svg viewBox="0 0 60 24" fill="none" className="w-[60px] h-6">
                <path
                    d="M0 12h55M50 6l6 6-6 6"
                    stroke="url(#connGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <defs>
                    <linearGradient id="connGrad" x1="0" y1="12" x2="60" y2="12">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 px-6 border-t border-[rgba(255,255,255,0.08)]">
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
                        Workflow
                    </span>
                    <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-[800] tracking-[-0.02em] mb-4">
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="text-[17px] text-[rgba(255,255,255,0.6)] max-w-[550px] mx-auto">
                        Three simple steps to transform your development workflow.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-5">
                    {steps.map((step, i) => (
                        <div key={step.num} className="contents">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                                className="glass-card rounded-2xl p-9 text-center flex-1 max-w-[300px] w-full"
                            >
                                <div className="text-5xl font-[900] gradient-text opacity-30 mb-4 leading-none">
                                    {step.num}
                                </div>
                                <h3 className="text-[17px] font-bold mb-2.5 tracking-tight">{step.title}</h3>
                                <p className="text-sm text-[rgba(255,255,255,0.6)] leading-relaxed">{step.desc}</p>
                            </motion.div>
                            {i < steps.length - 1 && <ArrowConnector />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
