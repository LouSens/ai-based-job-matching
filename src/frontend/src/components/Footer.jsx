import { Zap, ExternalLink, Shield, Building2, Search } from 'lucide-react'
import useStore from '../store/useStore'

/**
 * Footer — Site footer with branding, platform links for both user types,
 * resources, legal links, and attribution.
 */
export default function Footer() {
    const { setActiveTab, openAuthModal } = useStore()

    return (
        <footer className="border-t border-white/[0.04] mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-sm">KerjaCerdas</span>
                        </div>
                        <p className="text-xs text-surface-500 leading-relaxed max-w-xs">
                            Platform AI-powered job matching untuk Indonesia.
                            Menghubungkan pencari kerja dengan pemberi kerja
                            menggunakan kecerdasan buatan.
                        </p>
                    </div>

                    {/* For Job Seekers */}
                    <div>
                        <p className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
                            <Search className="w-3 h-3" />
                            Pencari Kerja
                        </p>
                        <ul className="space-y-2">
                            {[
                                { label: 'Cari Pekerjaan', action: () => setActiveTab('match') },
                                { label: 'Analisis Skill Gap', action: () => setActiveTab('gap') },
                                { label: 'AI Career Advisor', action: () => setActiveTab('advisor') },
                                { label: 'Daftar Gratis', action: () => openAuthModal('register') },
                            ].map(item => (
                                <li key={item.label}>
                                    <button
                                        onClick={item.action}
                                        className="text-xs text-surface-400 hover:text-surface-200 transition-colors"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Employers */}
                    <div>
                        <p className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            Pemberi Kerja
                        </p>
                        <ul className="space-y-2">
                            {[
                                { label: 'Pasang Lowongan', action: () => openAuthModal('register') },
                                { label: 'Cari Kandidat AI', action: () => openAuthModal('register') },
                                { label: 'Kelola Lowongan', action: () => setActiveTab('employer') },
                                { label: 'Daftar Perusahaan', action: () => openAuthModal('register') },
                            ].map(item => (
                                <li key={item.label}>
                                    <button
                                        onClick={item.action}
                                        className="text-xs text-surface-400 hover:text-surface-200 transition-colors"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal & Resources */}
                    <div>
                        <p className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold mb-3">Resources & Legal</p>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => setActiveTab('privacy')}
                                    className="text-xs text-surface-400 hover:text-surface-200 transition-colors flex items-center gap-1"
                                >
                                    <Shield className="w-2.5 h-2.5" />
                                    Kebijakan Privasi
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('privacy')}
                                    className="text-xs text-surface-400 hover:text-surface-200 transition-colors flex items-center gap-1"
                                >
                                    <Shield className="w-2.5 h-2.5" />
                                    Syarat & Ketentuan
                                </button>
                            </li>
                            {[
                                { label: 'API Documentation', href: '/api/docs' },
                                { label: 'GitHub Repository', href: '#' },
                            ].map(item => (
                                <li key={item.label}>
                                    <a href={item.href} className="text-xs text-surface-400 hover:text-surface-200 transition-colors flex items-center gap-1">
                                        {item.label}
                                        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[10px] text-surface-600">
                        © 2026 KerjaCerdas · Antigravity Protocol v1.0 ·{' '}
                        <button onClick={() => setActiveTab('privacy')} className="hover:text-surface-300 transition-colors">
                            Kebijakan Privasi
                        </button>
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-surface-600 flex items-center gap-1">
                            Powered by IndoBERT · Google Gemini · FastAPI
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
