import { Target, CheckCircle2, XCircle, BookOpen, Clock, ArrowLeft, TrendingUp, ExternalLink } from 'lucide-react'
import useStore from '../store/useStore'

/**
 * SkillGapPanel — Shows skill gap analysis between seeker and target job.
 *
 * Displays: matching skills, missing skills, gap severity, course recommendations,
 * progress visualization, and estimated readiness timeline.
 * Connected to: POST /api/v1/skill-gap
 */
export default function SkillGapPanel() {
    const { selectedJob, skillGap, skillGapLoading, setActiveTab } = useStore()

    if (!selectedJob && !skillGap) {
        return (
            <div className="glass-card p-10 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
                    <Target className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Analisis Skill Gap</h3>
                <p className="text-sm text-surface-400 max-w-md mx-auto leading-relaxed mb-6">
                    Pilih pekerjaan dari hasil matching untuk melihat skill yang perlu kamu kembangkan.
                </p>
                <button
                    onClick={() => setActiveTab('match')}
                    className="btn-outline inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Pencarian
                </button>
            </div>
        )
    }

    if (skillGapLoading) {
        return (
            <div className="space-y-4 animate-fade-in">
                {/* Skeleton loading */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="skeleton w-12 h-12 rounded-xl" />
                        <div className="flex-1">
                            <div className="skeleton h-5 w-48 mb-2 rounded" />
                            <div className="skeleton h-3 w-32 rounded" />
                        </div>
                    </div>
                    <div className="skeleton h-16 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-6"><div className="skeleton h-32 rounded-xl" /></div>
                    <div className="glass-card p-6"><div className="skeleton h-32 rounded-xl" /></div>
                </div>
                <div className="glass-card p-6"><div className="skeleton h-24 rounded-xl" /></div>
            </div>
        )
    }

    const severityConfig = {
        low: {
            color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20',
            label: 'Rendah — Siap melamar!', icon: '🎯', gradient: 'from-emerald-500 to-teal-500'
        },
        medium: {
            color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20',
            label: 'Sedang — Perlu sedikit upskilling', icon: '📈', gradient: 'from-amber-500 to-orange-500'
        },
        high: {
            color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20',
            label: 'Tinggi — Perlu upskilling serius', icon: '🚀', gradient: 'from-red-500 to-pink-500'
        },
    }

    const severity = severityConfig[skillGap?.gap_severity] || severityConfig.medium
    const matchPercent = skillGap?.match_percentage ?? (
        skillGap ? Math.round(
            (skillGap.matching_skills?.length /
                Math.max(skillGap.matching_skills?.length + skillGap.missing_skills?.length, 1)) * 100
        ) : 0
    )

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Back button */}
            <button
                onClick={() => setActiveTab('match')}
                className="btn-ghost flex items-center gap-1.5 text-xs -ml-2"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Hasil
            </button>

            {/* Job header + Severity */}
            {selectedJob && (
                <div className="glass-card overflow-hidden">
                    <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${severity.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                                {severity.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base">{selectedJob.title}</h3>
                                <p className="text-xs text-surface-400">{selectedJob.company} · {selectedJob.region_name || selectedJob.region_code}</p>
                            </div>
                        </div>

                        {/* Gap severity banner */}
                        <div className={`${severity.bg} border ${severity.border} rounded-xl p-4`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`text-sm font-semibold ${severity.color}`}>{severity.label}</div>
                                <div className={`text-2xl font-extrabold ${severity.color} tabular-nums`}>{Math.round(matchPercent)}%</div>
                            </div>
                            {/* Progress bar */}
                            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${severity.gradient} transition-all duration-1000 ease-out`}
                                    style={{ width: `${matchPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-surface-500">
                                <span>0% — Perlu banyak belajar</span>
                                <span>100% — Skill terpenuhi semua</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary */}
            {skillGap?.summary && (
                <div className="glass-card p-5">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-surface-300 leading-relaxed">{skillGap.summary}</p>
                    </div>
                </div>
            )}

            {/* Skills comparison */}
            {skillGap && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matching skills */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-sm font-bold">Skill yang Cocok</h4>
                            <span className="ml-auto badge-success text-[9px] py-0.5">
                                {skillGap.matching_skills?.length || 0}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {(skillGap.matching_skills || []).map((skill, i) => (
                                <span key={i} className="skill-tag-matched">
                                    <CheckCircle2 className="w-3 h-3" /> {skill}
                                </span>
                            ))}
                            {(!skillGap.matching_skills || skillGap.matching_skills.length === 0) && (
                                <p className="text-xs text-surface-500">Belum ada skill yang cocok</p>
                            )}
                        </div>
                    </div>

                    {/* Missing skills */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <XCircle className="w-4 h-4 text-amber-400" />
                            <h4 className="text-sm font-bold">Skill yang Kurang</h4>
                            <span className="ml-auto badge-warning text-[9px] py-0.5">
                                {skillGap.missing_skills?.length || 0}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {(skillGap.missing_skills || []).map((skill, i) => (
                                <span key={i} className="skill-tag-missing">
                                    <XCircle className="w-3 h-3" /> {skill}
                                </span>
                            ))}
                            {(!skillGap.missing_skills || skillGap.missing_skills.length === 0) && (
                                <p className="text-xs text-emerald-400">Semua skill terpenuhi! 🎉</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Course recommendations */}
            {skillGap?.recommended_courses && skillGap.recommended_courses.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="p-5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-brand-400" />
                            <h4 className="text-sm font-bold">Rekomendasi Kursus</h4>
                            <span className="ml-auto text-[10px] text-surface-500">
                                {skillGap.recommended_courses.length} kursus
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {skillGap.recommended_courses.map((course, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group/course">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4 text-brand-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-surface-200 truncate">{course.name}</p>
                                        <p className="text-[10px] text-surface-500">{course.provider}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                    <span className="badge-brand text-[9px] py-0.5">
                                        <Clock className="w-3 h-3" />
                                        {course.duration}
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-surface-600 group-hover/course:text-brand-400 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estimated readiness */}
            {skillGap?.estimated_readiness_months > 0 && (
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-brand-400" />
                            </div>
                            <div>
                                <p className="text-xs text-surface-400">Estimasi Waktu Persiapan</p>
                                <p className="text-lg font-bold text-brand-400">{skillGap.estimated_readiness_months} bulan</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('advisor')}
                            className="btn-outline text-xs flex items-center gap-1.5"
                        >
                            🤖 Diskusi Roadmap
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
