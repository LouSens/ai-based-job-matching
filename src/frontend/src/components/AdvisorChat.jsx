import { useRef, useEffect } from 'react'
import { Send, Bot, User, RotateCcw, Sparkles, Zap } from 'lucide-react'
import useStore from '../store/useStore'

/**
 * AdvisorChat — AI career advisor chat interface.
 *
 * Connected to: POST /api/v1/advisor via Zustand.
 * Uses Google Gemini in live mode, pre-scripted responses in demo.
 * Features: markdown parsing, quick prompts, typing indicator, chat reset.
 */
export default function AdvisorChat() {
    const {
        chatMessages, chatInput, chatLoading,
        setChatInput, sendMessage, clearChat,
    } = useStore()
    const chatEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    /**
     * Handles form submission for sending a message.
     */
    const handleSubmit = (e) => {
        e.preventDefault()
        sendMessage()
        inputRef.current?.focus()
    }

    /**
     * Handles Enter key to send message.
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    /**
     * Renders text content with markdown-style bold and bullet parsing.
     */
    const renderContent = (text) => {
        return text.split('\n').map((line, i) => {
            // Handle bullet points
            const isBullet = line.startsWith('• ') || line.startsWith('- ')
            const bulletContent = isBullet ? line.slice(2) : line

            return (
                <p key={i} className={`${line === '' ? 'h-2' : ''} ${isBullet ? 'pl-3 relative' : ''}`}>
                    {isBullet && <span className="absolute left-0 text-brand-400">•</span>}
                    {bulletContent.split(/(\*\*.*?\*\*)/).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-brand-400 font-semibold">{part.slice(2, -2)}</strong>
                        }
                        return part
                    })}
                </p>
            )
        })
    }

    const quickPrompts = [
        { text: 'Karier apa yang cocok untuk saya?', icon: '🎯' },
        { text: 'Bagaimana cara negosiasi gaji?', icon: '💰' },
        { text: 'Tips CV untuk fresh graduate', icon: '📄' },
        { text: 'Skill yang trending di 2026', icon: '📈' },
        { text: 'Rencana karier Data Scientist', icon: '🔬' },
        { text: 'Persiapan interview teknik', icon: '💼' },
    ]

    return (
        <div className="glass-card flex flex-col h-[calc(100vh-200px)] min-h-[500px] max-h-[700px] animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold">Asisten Karier AI</h2>
                            <span className="badge-brand text-[8px] py-0">
                                <Sparkles className="w-2.5 h-2.5" />
                                Gemini
                            </span>
                        </div>
                        <p className="text-[10px] text-surface-400 mt-0.5">
                            Bahasa Indonesia · Konteks pasar kerja Indonesia
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                            <span className="text-[10px] text-surface-400">Online</span>
                        </div>
                        <button
                            onClick={clearChat}
                            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-surface-500 hover:text-surface-300"
                            title="Reset chat"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {chatMessages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
                        style={{ animationDelay: `${Math.min(i * 50, 200)}ms` }}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border border-white/[0.08] ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-brand-500/30 to-cyan-500/30'
                            : 'bg-white/[0.04]'
                            }`}>
                            {msg.role === 'user'
                                ? <User className="w-4 h-4 text-brand-300" />
                                : <Bot className="w-4 h-4 text-surface-400" />
                            }
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
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
                            <Bot className="w-4 h-4 text-surface-400" />
                        </div>
                        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-md px-4 py-3">
                            <div className="flex gap-1.5 items-center">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-brand-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-brand-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-brand-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-[10px] text-surface-500 ml-2">AI sedang berpikir...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            {chatMessages.length <= 1 && (
                <div className="px-4 sm:px-5 pb-3 shrink-0">
                    <p className="text-[10px] text-surface-500 mb-2 font-medium uppercase tracking-wider">Coba tanyakan:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {quickPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(prompt.text)}
                                className="text-[11px] text-left text-surface-300 bg-white/[0.03] border border-white/[0.06]
                                   rounded-xl px-3 py-2.5 hover:bg-white/[0.08] hover:border-brand-500/20 hover:text-white
                                   transition-all duration-200 group/prompt"
                            >
                                <span className="mr-1.5">{prompt.icon}</span>
                                {prompt.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 border-t border-white/[0.06] shrink-0 bg-white/[0.01]">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        id="chat-input"
                        type="text"
                        className="input-dark flex-1 !py-3 !text-sm !rounded-xl"
                        placeholder="Tanyakan soal karier, skill, atau lowongan kerja..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={chatLoading}
                    />
                    <button
                        id="btn-send"
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="btn-glow !px-4 !py-3 !rounded-xl disabled:opacity-30 shrink-0"
                    >
                        {chatLoading ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
                <p className="text-[10px] text-surface-600 mt-2 text-center">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Powered by Google Gemini · Jawaban dalam Bahasa Indonesia
                </p>
            </form>
        </div>
    )
}
