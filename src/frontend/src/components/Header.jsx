import { useEffect } from 'react'
import useStore from '../store/useStore'
import { healthCheck } from '../services/api'

/**
 * Header — Top navigation bar with branding, tabs, and API status.
 */
export default function Header() {
    const { activeTab, setActiveTab, apiStatus, setApiStatus } = useStore()

    useEffect(() => {
        healthCheck()
            .then(() => setApiStatus('connected'))
            .catch(() => setApiStatus('offline'))
    }, [setApiStatus])

    const tabs = [
        { id: 'match', label: '🔍 Cari Kerja', desc: 'AI Job Matching' },
        { id: 'gap', label: '📊 Skill Gap', desc: 'Analisis Skill' },
        { id: 'advisor', label: '🤖 Advisor', desc: 'AI Konselor' },
    ]

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-950/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Top bar */}
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-brand-500/25">
                            K
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">
                                Kerja<span className="gradient-text">Cerdas</span>
                            </h1>
                            <p className="text-[10px] text-surface-500 -mt-0.5 tracking-wide uppercase">
                                AI Job Matching Indonesia
                            </p>
                        </div>
                    </div>

                    {/* API Status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected'
                                ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                                : apiStatus === 'offline'
                                    ? 'bg-red-400'
                                    : 'bg-amber-400 animate-pulse-soft'
                            }`} />
                        <span className="text-xs text-surface-400">
                            {apiStatus === 'connected' ? 'API Connected' : apiStatus === 'offline' ? 'API Offline' : 'Connecting...'}
                        </span>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 pb-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            id={`tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <span className="text-base mr-1.5">{tab.label.split(' ')[0]}</span>
                            <span className="hidden sm:inline">{tab.label.split(' ').slice(1).join(' ')}</span>
                        </button>
                    ))}
                </div>
            </div>
        </header>
    )
}
