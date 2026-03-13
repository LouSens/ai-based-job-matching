import { BarChart3, Briefcase, Bookmark, TrendingUp, Clock, Target, Sparkles, ArrowRight } from 'lucide-react'
import useStore from '../store/useStore'

/**
 * DashboardPage — Analytics overview showing user's job matching
 * activity, skill progress, and saved jobs summary.
 */
export default function DashboardPage() {
    const { profile, matches, savedJobs, setActiveTab, lastSearchTime } = useStore()

    const currentSkills = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    const avgScore = matches.length > 0
        ? Math.round(matches.reduce((acc, j) => acc + (j.match_score || 0), 0) / matches.length * 100)
        : 0

    /**
     * Formats an ISO date string to relative time (baru saja, 5 menit lalu, etc).
     */
    const formatRelativeTime = (isoString) => {
        if (!isoString) return 'Belum pernah'
        const diff = Date.now() - new Date(isoString).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Baru saja'
        if (mins < 60) return `${mins} menit lalu`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours} jam lalu`
        return `${Math.floor(hours / 24)} hari lalu`
    }

    const stats = [
        {
            label: 'Total Matches',
            value: matches.length,
            icon: Briefcase,
            color: 'from-brand-500 to-cyan-500',
            bg: 'bg-brand-500/10',
            textColor: 'text-brand-400',
        },
        {
            label: 'Rata-rata Skor',
            value: `${avgScore}%`,
            icon: TrendingUp,
            color: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-500/10',
            textColor: 'text-emerald-400',
        },
        {
            label: 'Tersimpan',
            value: savedJobs.length,
            icon: Bookmark,
            color: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-500/10',
            textColor: 'text-amber-400',
        },
        {
            label: 'Skills Kamu',
            value: currentSkills.length,
            icon: Sparkles,
            color: 'from-purple-500 to-pink-500',
            bg: 'bg-purple-500/10',
            textColor: 'text-purple-400',
        },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-5 h-5 text-brand-400" />
                    <h2 className="text-xl font-bold">Dashboard</h2>
                </div>
                <p className="text-sm text-surface-400">
                    {profile.name ? `Selamat datang, ${profile.name}!` : 'Ringkasan aktivitas pencarian kerja kamu'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg, textColor }) => (
                    <div key={label} className="glass-card-hover p-5">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                            <Icon className={`w-5 h-5 ${textColor}`} />
                        </div>
                        <div className={`text-2xl font-extrabold ${textColor} tabular-nums mb-0.5`}>{value}</div>
                        <div className="text-[11px] text-surface-500 font-medium">{label}</div>
                    </div>
                ))}
            </div>

            {/* Profile Summary + Recent Activity */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Profile Card */}
                <div className="glass-card p-5 sm:p-6">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-brand-400" />
                        Profil Kamu
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-surface-400">Nama</span>
                            <span className="font-medium">{profile.name || '—'}</span>
                        </div>
                        <div className="divider" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-surface-400">Pendidikan</span>
                            <span className="font-medium">{profile.education_level}</span>
                        </div>
                        <div className="divider" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-surface-400">Pengalaman</span>
                            <span className="font-medium">{profile.experience_years} tahun</span>
                        </div>
                        <div className="divider" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-surface-400">Gaji Target</span>
                            <span className="font-medium text-emerald-400">Rp {(profile.salary_expectation / 1_000_000).toFixed(0)} juta</span>
                        </div>
                    </div>

                    {/* Skills */}
                    {currentSkills.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/[0.06]">
                            <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                                {currentSkills.map((skill, i) => (
                                    <span key={i} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setActiveTab('match')}
                        className="btn-outline w-full mt-5 text-xs flex items-center justify-center gap-2"
                    >
                        Edit Profil
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Activity Card */}
                <div className="glass-card p-5 sm:p-6">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-400" />
                        Aktivitas Terkini
                    </h3>

                    <div className="space-y-4">
                        {/* Last search */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4 text-brand-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">Pencarian Terakhir</p>
                                <p className="text-[10px] text-surface-500">{formatRelativeTime(lastSearchTime)}</p>
                            </div>
                            <span className="text-xs text-brand-400 font-bold tabular-nums">{matches.length} hasil</span>
                        </div>

                        {/* Saved jobs count */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                <Bookmark className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">Lowongan Tersimpan</p>
                                <p className="text-[10px] text-surface-500">{savedJobs.length} lowongan</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('saved')}
                                className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors"
                            >
                                Lihat
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Top match */}
                        {matches.length > 0 && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{matches[0].title}</p>
                                    <p className="text-[10px] text-surface-500">{matches[0].company} — Top Match</p>
                                </div>
                                <span className="text-xs text-emerald-400 font-bold tabular-nums">
                                    {Math.round((matches[0].match_score || 0) * 100)}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-2 mt-5">
                        <button
                            onClick={() => setActiveTab('gap')}
                            className="btn-outline text-xs flex items-center justify-center gap-1.5 !py-2.5"
                        >
                            📊 Skill Gap
                        </button>
                        <button
                            onClick={() => setActiveTab('advisor')}
                            className="btn-outline text-xs flex items-center justify-center gap-1.5 !py-2.5"
                        >
                            🤖 AI Advisor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
