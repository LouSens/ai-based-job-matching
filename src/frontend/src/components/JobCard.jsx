import { MapPin, Clock, GraduationCap, Bookmark, BarChart3, ArrowRight, Building2, Wallet } from 'lucide-react'
import useStore from '../store/useStore'

/**
 * JobCard — Displays a single job match result with score ring,
 * company info, skills, salary, bookmark toggle, and skill gap action.
 */
export default function JobCard({ job, index }) {
    const { selectJob, setActiveTab, analyzeGap, toggleSaveJob, isJobSaved } = useStore()
    const score = Math.round((job.match_score || 0) * 100)
    const saved = isJobSaved(job.job_id)

    /**
     * Gets the score color class based on percentage.
     */
    const getScoreColor = (s) => {
        if (s >= 85) return 'text-emerald-400'
        if (s >= 70) return 'text-brand-400'
        if (s >= 50) return 'text-amber-400'
        return 'text-red-400'
    }

    /**
     * Gets the ring color hex based on percentage.
     */
    const getRingColor = (s) => {
        if (s >= 85) return '#34d399'
        if (s >= 70) return '#3366ff'
        if (s >= 50) return '#fbbf24'
        return '#f87171'
    }

    /**
     * Gets the score label text.
     */
    const getScoreLabel = (s) => {
        if (s >= 85) return 'Sangat Cocok'
        if (s >= 70) return 'Cocok'
        if (s >= 50) return 'Cukup Cocok'
        return 'Kurang Cocok'
    }

    /**
     * Formats salary range in Indonesian Rupiah.
     */
    const formatSalary = (min, max) => {
        const fmt = (v) => `${(v / 1_000_000).toFixed(0)}`
        return `Rp ${fmt(min)}–${fmt(max)} juta`
    }

    /**
     * Handles navigating to skill gap analysis.
     */
    const handleAnalyze = () => {
        selectJob(job)
        analyzeGap(job.required_skills || [])
        setActiveTab('gap')
    }

    return (
        <div
            className="glass-card-hover p-5 animate-slide-up group"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
        >
            <div className="flex gap-4 sm:gap-5">
                {/* Score Ring */}
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                    <div
                        className="score-ring"
                        style={{
                            '--score': score,
                            '--ring-color': getRingColor(score),
                        }}
                    >
                        <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
                    </div>
                    <span className={`text-[9px] font-semibold ${getScoreColor(score)} opacity-70`}>
                        {getScoreLabel(score)}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-sm sm:text-base group-hover:text-brand-400 transition-colors truncate">
                                    {job.title}
                                </h3>
                                {index === 0 && (
                                    <span className="badge-success text-[9px] py-0.5">★ TOP MATCH</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-surface-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {job.company}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {job.region_name || job.region_code}
                                </span>
                            </div>
                        </div>

                        {/* Bookmark button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleSaveJob(job) }}
                            className={`bookmark-btn shrink-0 ${saved ? 'saved' : ''}`}
                            aria-label={saved ? 'Remove bookmark' : 'Save job'}
                        >
                            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Info pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {job.salary_min && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400/80 font-medium bg-emerald-500/10 px-2 py-1 rounded-lg">
                                <Wallet className="w-3 h-3" />
                                {formatSalary(job.salary_min, job.salary_max)}
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] text-surface-400 bg-white/[0.04] px-2 py-1 rounded-lg">
                            <GraduationCap className="w-3 h-3" />
                            {job.education_min || 'S1'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-surface-400 bg-white/[0.04] px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" />
                            {job.experience_years_min || 0}+ tahun
                        </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {(job.required_skills || []).slice(0, 6).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                        ))}
                        {(job.required_skills || []).length > 6 && (
                            <span className="text-[10px] text-surface-500 self-center font-medium">
                                +{job.required_skills.length - 6} lainnya
                            </span>
                        )}
                    </div>

                    {/* Explanation */}
                    {job.explanation && (
                        <p className="text-[11px] text-surface-500 mt-3 italic leading-relaxed">
                            💡 {job.explanation}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.05]">
                        <button
                            onClick={handleAnalyze}
                            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors group/btn"
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Analisis Skill Gap
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                        <span className="text-surface-700">·</span>
                        <button
                            onClick={() => { selectJob(job); setActiveTab('advisor') }}
                            className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-200 font-medium transition-colors"
                        >
                            🤖 Diskusi AI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
