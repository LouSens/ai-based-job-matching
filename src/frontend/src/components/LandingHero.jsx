import { useState, useEffect } from 'react'
import { Zap, Search, BarChart3, Bot, ArrowRight, MapPin, Users, Clock, Briefcase, Building2, Shield, UserPlus } from 'lucide-react'
import useStore from '../store/useStore'

/**
 * LandingHero — Premium landing page with hero section, features, stats, and how-it-works.
 * Adapted for dual-sided marketplace (Pencari Kerja & Pemberi Kerja).
 * Designed to WOW investors and hackathon judges at first glance.
 */

const ANIMATED_STATS = [
    { value: 50000, label: 'Lowongan Aktif', suffix: '+', icon: Briefcase },
    { value: 1200, label: 'Perusahaan Terdaftar', suffix: '+', icon: Building2 },
    { value: 87, label: 'Akurasi Matching', suffix: '%', icon: BarChart3 },
    { value: 140, label: 'Response Time (ms)', suffix: 'ms', icon: Clock },
]

const FEATURES_SEEKER = [
    {
        icon: Search,
        title: 'AI Job Matching',
        description: 'Kemampuan IndoBERT mencocokkan profil profilmu dengan lowongan terbaik di seluruh Indonesia secara akurat dan semantik.',
        gradient: 'from-blue-500 to-cyan-500',
        tag: 'IndoBERT',
    },
    {
        icon: BarChart3,
        title: 'Analisis Skill Gap',
        description: 'Ketahui skill apa yang masih kurang untuk posisi impianmu, lengkap dengan rekomendasi kursus yang tepat.',
        gradient: 'from-emerald-500 to-teal-500',
        tag: 'RAG Pipeline',
    },
    {
        icon: Bot,
        title: 'AI Career Advisor',
        description: 'Asisten karier AI interaktif yang siap membimbingmu mulai dari penyusunan CV hingga persiapan wawancara 24/7.',
        gradient: 'from-purple-500 to-pink-500',
        tag: 'Gemini 3.0',
    },
]

const FEATURES_EMPLOYER = [
    {
        icon: Users,
        title: 'AI Candidate Sourcing',
        description: 'Temukan talenta terbaik dengan sekali pencarian. AI kami meranking kandidat berdasarkan kecocokan skill & pengalaman.',
        gradient: 'from-emerald-500 to-teal-500',
        tag: 'Smart Rank',
    },
    {
        icon: Building2,
        title: 'Employer Dashboard Terpadu',
        description: 'Kelola ratusan pelamar, pantau performa iklan lowongan kerja, dan analisis tren supply & demand talenta.',
        gradient: 'from-blue-500 to-cyan-500',
        tag: 'Analytics',
    },
    {
        icon: Shield,
        title: 'Verifikasi Blockchain',
        description: 'Sistem verifikasi kredensial terdesentralisasi yang menjamin keaslian ijazah dan sertifikat pelatihan kandidat.',
        gradient: 'from-purple-500 to-pink-500',
        tag: 'Ethereum',
    },
]

const HOW_IT_WORKS_SEEKER = [
    { step: '01', title: 'Buat Profil', description: 'Isi detail skill, pengalaman, dan gaji idamanmu.' },
    { step: '02', title: 'AI Matching', description: 'Sistem menganalisis jutaan titik data untuk mencari kecocokan tertinggi.' },
    { step: '03', title: 'Lamar Instan', description: 'Dapatkan pekerjaan idamanmu tanpa perlu membuang waktu scroll.' },
]

const HOW_IT_WORKS_EMPLOYER = [
    { step: '01', title: 'Pasang Lowongan', description: 'Definisikan kriteria, skill, dan benefit pekerja.' },
    { step: '02', title: 'AI Sourcing', description: 'Algoritma memberikan daftar kandidat yang paling relevan secara otomatis.' },
    { step: '03', title: 'Rekrut Cepat', description: 'Pilih, hubungi, dan rekrut talenta unggulan dalam hitungan hari.' },
]

/**
 * AnimatedCounter — Counts from 0 to target value with easing.
 */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime = null
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
        }
        const timer = setTimeout(() => requestAnimationFrame(animate), 300)
        return () => clearTimeout(timer)
    }, [end, duration])

    return (
        <span className="tabular-nums">
            {count.toLocaleString('id-ID')}{suffix}
        </span>
    )
}

export default function LandingHero() {
    const { setActiveTab, openAuthModal } = useStore()
    const [audience, setAudience] = useState('seeker') // 'seeker' | 'employer'

    const currentFeatures = audience === 'seeker' ? FEATURES_SEEKER : FEATURES_EMPLOYER
    const currentHowItWorks = audience === 'seeker' ? HOW_IT_WORKS_SEEKER : HOW_IT_WORKS_EMPLOYER

    return (
        <div className="relative overflow-hidden animate-fade-in">
            {/* ── HERO SECTION ── */}
            <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-28">
                {/* Decorative orbs */}
                <div className="absolute top-20 right-0 w-72 h-72 bg-brand-500/[0.08] rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-0 left-10 w-60 h-60 bg-cyan-500/[0.06] rounded-full blur-[80px] animate-float animation-delay-500" />

                <div className="relative text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 mt-4">
                        <Zap className="w-3.5 h-3.5 text-brand-400" />
                        <span className="text-xs font-semibold text-brand-300 tracking-wide">
                            HACKATHON 2026 · DIGDAYA × OJK · AI/ML + BLOCKCHAIN
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up animation-delay-150">
                        Evolusi Rekrutmen <br className="hidden sm:block" />
                        Platform AI <span className="gradient-text">Terdepan</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-surface-400 text-base sm:text-lg max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-300">
                        Menghubungkan jutaan <strong className="text-white">Pencari Kerja</strong> dengan{' '}
                        <strong className="text-white">Perusahaan Terbaik</strong> di seluruh Indonesia.
                        Didukung oleh model AI semantik untuk akurasi pencocokan tertinggi.
                    </p>

                    {/* Audience Switcher */}
                    <div className="flex justify-center mb-8 animate-fade-in-up animation-delay-500">
                        <div className="inline-flex rounded-2xl bg-white/[0.04] border border-white/[0.08] p-1.5">
                            <button
                                onClick={() => setAudience('seeker')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    audience === 'seeker'
                                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                                        : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                <Search className="w-4 h-4" />
                                Untuk Pencari Kerja
                            </button>
                            <button
                                onClick={() => setAudience('employer')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    audience === 'employer'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                Untuk Pemberi Kerja
                            </button>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-700">
                        {audience === 'seeker' ? (
                            <>
                                <button
                                    onClick={() => setActiveTab('match')}
                                    className="btn-glow group flex items-center gap-2 text-base px-8 py-4 w-full sm:w-auto"
                                >
                                    <Search className="w-5 h-5" />
                                    Cari Pekerjaan
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => setActiveTab('advisor')}
                                    className="btn-outline flex items-center gap-2 px-8 py-4 w-full sm:w-auto"
                                >
                                    <Bot className="w-5 h-5" />
                                    Tanya AI Advisor
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="btn-glow flex items-center gap-2 text-base px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 w-full sm:w-auto border-transparent hover:border-emerald-400/50"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Daftar Sebagai Perusahaan
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="btn-outline flex items-center gap-2 px-8 py-4 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 w-full sm:w-auto"
                                >
                                    <Building2 className="w-5 h-5" />
                                    Masuk ke Dashboard
                                </button>
                            </>
                        )}
                    </div>

                    {/* Trust signals */}
                    <div className="mt-12 flex items-center justify-center gap-6 animate-fade-in animation-delay-1000">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 border-2 border-surface-950 flex items-center justify-center shadow-lg">👨‍💻</div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-surface-950 flex items-center justify-center shadow-lg">👩‍💼</div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-surface-950 flex items-center justify-center shadow-lg">👨‍🔬</div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-surface-950 flex items-center justify-center shadow-lg text-xs font-bold font-sans">+</div>
                        </div>
                        <p className="text-sm font-medium text-surface-300">
                            Dipercaya oleh <strong className="text-white">10.000+</strong> pengguna terdaftar
                        </p>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <section className="relative border-y border-white/[0.06] bg-white/[0.02]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {ANIMATED_STATS.map(({ value, label, suffix, icon: Icon }) => (
                            <div key={label} className="stat-card group">
                                <Icon className="w-6 h-6 text-brand-400 mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300" />
                                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">
                                    <AnimatedCounter end={value} suffix={suffix} />
                                </div>
                                <div className="text-xs text-surface-400 font-medium tracking-wide uppercase">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
                <div className="text-center mb-16">
                    <span className={`inline-flex mb-4 ${audience === 'seeker' ? 'badge-brand' : 'badge-success'}`}>
                        ✦ KEUNGGULAN PLATFORM
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                        Mengapa <span className={audience === 'seeker' ? 'gradient-text' : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400'}>
                            KerjaCerdas?
                        </span>
                    </h2>
                    <p className="text-surface-400 max-w-xl mx-auto text-sm leading-relaxed">
                        Pendekatan berbasis kecerdasan buatan untuk masa depan rekrutmen yang
                        lebih presisi, obyektif, dan transparan.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {currentFeatures.map(({ icon: Icon, title, description, gradient, tag }, i) => (
                        <div
                            key={title}
                            className="feature-card group bg-surface-900/40 hover:bg-surface-900/80"
                            style={{ animationDelay: `${i * 150}ms` }}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                                <div className="w-full h-full rounded-[14px] bg-surface-900 flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] uppercase font-bold text-surface-300 tracking-wider mb-4">
                                🚀 {tag}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brand-400 transition-colors">{title}</h3>
                            <p className="text-sm text-surface-400 leading-relaxed">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="border-y border-white/[0.06] bg-white/[0.015]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-semibold text-white mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-soft"></span>
                            PROSES CEPAT
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                            Tiga Langkah <span className="gradient-text">Mudah</span>
                        </h2>
                        <p className="text-surface-400 max-w-md mx-auto text-sm">
                            Hanya butuh beberapa menit untuk memulai efisiensi pencarianmu.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative max-w-4xl mx-auto">
                        {currentHowItWorks.map(({ step, title, description }, i) => (
                            <div key={step} className="relative text-center group">
                                {/* Step connector line */}
                                {i < currentHowItWorks.length - 1 && (
                                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-500/30 to-transparent -z-10" />
                                )}

                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-brand-500/60 transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.1)] group-hover:shadow-[0_0_40px_rgba(56,189,248,0.2)]">
                                    <span className="text-2xl font-black gradient-text">{step}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-white">{title}</h3>
                                <p className="text-sm text-surface-400 max-w-[240px] mx-auto leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-20">
                        {audience === 'seeker' ? (
                            <button
                                onClick={() => openAuthModal('register')}
                                className="btn-glow group inline-flex items-center gap-2 text-sm px-8 py-4 font-bold"
                            >
                                Mulai Sekarang — Gratis
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={() => openAuthModal('register')}
                                className="btn-glow inline-flex items-center gap-2 text-sm px-8 py-4 font-bold bg-emerald-500 hover:bg-emerald-400 hover:border-emerald-400/50"
                            >
                                Daftar Perusahaan Sekarang
                                <Building2 className="w-4 h-4 ml-1" />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ── TECH STACK BADGES ── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                <div className="text-center mb-8">
                    <p className="text-[10px] text-surface-500 uppercase tracking-widest font-black">Powered by Industry Leading Tech Stack</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {[
                        { name: 'IndoBERT', glow: 'hover:shadow-blue-500/20' },
                        { name: 'Google Gemini', glow: 'hover:shadow-purple-500/20' },
                        { name: 'FastAPI', glow: 'hover:shadow-emerald-500/20' },
                        { name: 'React 18', glow: 'hover:shadow-cyan-500/20' },
                        { name: 'PostgreSQL', glow: 'hover:shadow-blue-400/20' },
                        { name: 'PyTorch', glow: 'hover:shadow-orange-500/20' },
                        { name: 'Ethereum', glow: 'hover:shadow-zinc-500/20' },
                        { name: 'pgvector', glow: 'hover:shadow-indigo-500/20' },
                    ].map(({ name, glow }) => (
                        <span key={name} className={`px-5 py-2.5 rounded-xl bg-surface-900 border border-white/[0.08] text-xs font-semibold text-surface-300 hover:text-white hover:bg-white/[0.05] transition-all duration-300 shadow-md ${glow}`}>
                            {name}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    )
}
