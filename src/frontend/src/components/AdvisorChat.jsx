import { useRef, useEffect } from 'react'
import useStore from '../store/useStore'

/**
 * AdvisorChat — AI career advisor chat interface.
 *
 * Connected to: POST /api/v1/advisor via Zustand.
 * Uses Google Gemini in live mode, pre-scripted responses in demo.
 */
export default function AdvisorChat() {
    const {
        chatMessages, chatInput, chatLoading,
        setChatInput, sendMessage,
    } = useStore()
    const chatEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    const handleSubmit = (e) => {
        e.preventDefault()
        sendMessage()
        inputRef.current?.focus()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const renderContent = (text) => {
        // Parse **bold** markers and newlines
        return text.split('\n').map((line, i) => (
            <p key={i} className={line === '' ? 'h-2' : ''}>
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-brand-400 font-semibold">{part.slice(2, -2)}</strong>
                    }
                    return part
                })}
            </p>
        ))
    }

    const quickPrompts = [
        'Bagaimana cara negosiasi gaji?',
        'Tips CV untuk fresh graduate',
        'Skill yang trending di 2026',
        'Rencana karier Data Scientist',
    ]

    return (
        <div className="glass-card flex flex-col h-[600px] animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-lg shadow-lg shadow-brand-500/20">
                        🤖
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold">Asisten Karier AI</h2>
                        <p className="text-[10px] text-surface-400">Powered by Google Gemini · Bahasa Indonesia</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                        <span className="text-[10px] text-surface-400">Online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}
                    >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-sm border border-white/[0.08] ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-brand-500/30 to-cyan-500/30'
                                : 'bg-white/[0.04]'
                            }`}>
                            {msg.role === 'user' ? '👤' : '🤖'}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${msg.role === 'user'
                                ? 'bg-brand-500/15 border border-brand-500/20 rounded-tr-md'
                                : 'bg-white/[0.04] border border-white/[0.08] rounded-tl-md'
                            }`}>
                            {renderContent(msg.content)}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {chatLoading && (
                    <div className="flex gap-3 animate-fade-in">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-sm border border-white/[0.08]">
                            🤖
                        </div>
                        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-md px-4 py-3">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            {chatMessages.length <= 1 && (
                <div className="px-4 pb-2 shrink-0">
                    <div className="flex flex-wrap gap-1.5">
                        {quickPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => { setChatInput(prompt); sendMessage() }}
                                className="text-[11px] text-surface-300 bg-white/[0.04] border border-white/[0.08]
                           rounded-lg px-2.5 py-1.5 hover:bg-white/[0.08] hover:border-brand-500/30
                           transition-all duration-200"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.06] shrink-0">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        id="chat-input"
                        type="text"
                        className="input-dark flex-1 !py-2.5 !text-sm"
                        placeholder="Tanyakan soal karier..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={chatLoading}
                    />
                    <button
                        id="btn-send"
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="btn-glow !px-4 !py-2.5 disabled:opacity-30"
                    >
                        {chatLoading ? '...' : '→'}
                    </button>
                </div>
            </form>
        </div>
    )
}
