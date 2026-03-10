import useStore from '../store/useStore'

/**
 * SkillGapPanel — Shows skill gap analysis between seeker and target job.
 *
 * Displays: matching skills, missing skills, gap severity, course recommendations.
 * Connected to: POST /api/v1/skill-gap
 */
export default function SkillGapPanel() {
    const { selectedJob, skillGap, skillGapLoading } = useStore()

    if (!selectedJob && !skillGap) {
        return (
            <div className="glass-card p-8 text-center animate-fade-in">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-base font-semibold mb-1">Analisis Skill Gap</h3>
                <p className="text-sm text-surface-400 max-w-md mx-auto">
                    Pilih pekerjaan dari hasil matching untuk melihat skill yang perlu kamu kembangkan.
                    Klik tombol <span className="text-brand-400">"Analisis Skill Gap"</span> pada kartu pekerjaan.
                </p>
            </div>
        )
    }

    if (skillGapLoading) {
        return (
            <div className="glass-card p-8 text-center animate-fade-in">
                <div className="animate-spin w-8 h-8 border-2 border-brand-400/30 border-t-brand-400 rounded-full mx-auto mb-3" />
                <p className="text-sm text-surface-400">Menganalisis skill gap...</p>
            </div>
        )
    }

    const severityConfig = {
        low: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', label: 'Rendah — Siap melamar!' },
        medium: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20', label: 'Sedang — Perlu sedikit belajar' },
        high: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20', label: 'Tinggi — Perlu upskilling serius' },
    }

    const severity = severityConfig[skillGap?.gap_severity] || severityConfig.medium
    // Use match_percentage from API if available, otherwise calculate
    const matchPercent = skillGap?.match_percentage ?? (
        skillGap ? Math.round(
            (skillGap.matching_skills?.length /
                Math.max(skillGap.matching_skills?.length + skillGap.missing_skills?.length, 1)) * 100
        ) : 0
    )

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Job header */}
            {selectedJob && (
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-lg">🎯</div>
                        <div>
                            <h3 className="font-semibold text-sm">{selectedJob.title}</h3>
                            <p className="text-xs text-surface-400">{selectedJob.company} · {selectedJob.region_name || selectedJob.region_code}</p>
                        </div>
                    </div>

                    {/* Gap severity banner */}
                    <div className={`${severity.bg} border ${severity.border} rounded-xl px-4 py-3 flex items-center gap-3`}>
                        <div className={`text-2xl font-bold ${severity.color}`}>{Math.round(matchPercent)}%</div>
                        <div>
                            <div className={`text-sm font-medium ${severity.color}`}>{severity.label}</div>
                            <div className="text-[10px] text-surface-400">Skill match coverage</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary */}
            {skillGap?.summary && (
                <div className="glass-card p-4">
                    <p className="text-sm text-surface-300 leading-relaxed">{skillGap.summary}</p>
                </div>
            )}

            {/* Skills comparison */}
            {skillGap && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matching skills */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-emerald-400">✅</span>
                            <h4 className="text-sm font-semibold">Skill yang Cocok</h4>
                            <span className="ml-auto text-xs text-emerald-400/70 font-medium">
                                {skillGap.matching_skills?.length || 0}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {(skillGap.matching_skills || []).map((skill, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                                    ✓ {skill}
                                </span>
                            ))}
                            {(!skillGap.matching_skills || skillGap.matching_skills.length === 0) && (
                                <p className="text-xs text-surface-500">Belum ada skill yang cocok</p>
                            )}
                        </div>
                    </div>

                    {/* Missing skills */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-amber-400">⚠️</span>
                            <h4 className="text-sm font-semibold">Skill yang Kurang</h4>
                            <span className="ml-auto text-xs text-amber-400/70 font-medium">
                                {skillGap.missing_skills?.length || 0}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {(skillGap.missing_skills || []).map((skill, i) => (
                                <span key={i} className="skill-tag-missing">
                                    ✗ {skill}
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
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <span>📚</span>
                        <h4 className="text-sm font-semibold">Rekomendasi Kursus</h4>
                    </div>
                    <div className="space-y-2">
                        {skillGap.recommended_courses.map((course, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.05]">
                                <div>
                                    <p className="text-xs font-medium text-surface-200">{course.name}</p>
                                    <p className="text-[10px] text-surface-500">{course.provider}</p>
                                </div>
                                <span className="text-[10px] text-brand-400 font-medium whitespace-nowrap">{course.duration}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estimated readiness */}
            {skillGap?.estimated_readiness_months > 0 && (
                <div className="glass-card p-4 text-center">
                    <p className="text-xs text-surface-400">
                        ⏱ Estimasi waktu persiapan: <span className="text-brand-400 font-semibold">{skillGap.estimated_readiness_months} bulan</span>
                    </p>
                </div>
            )}
        </div>
    )
}
