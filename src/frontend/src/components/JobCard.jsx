import useStore from '../store/useStore'

/**
 * JobCard — Displays a single job match result with score, skills, and salary.
 */
export default function JobCard({ job, index }) {
    const { selectJob, setActiveTab, analyzeGap } = useStore()
    const score = Math.round((job.match_score || 0) * 100)

    const getScoreColor = (s) => {
        if (s >= 85) return 'text-emerald-400'
        if (s >= 70) return 'text-brand-400'
        if (s >= 50) return 'text-amber-400'
        return 'text-red-400'
    }

    const getRingColor = (s) => {
        if (s >= 85) return '#34d399'
        if (s >= 70) return '#3366ff'
        if (s >= 50) return '#fbbf24'
        return '#f87171'
    }

    const formatSalary = (min, max) => {
        const fmt = (v) => `${(v / 1_000_000).toFixed(0)}`
        return `Rp ${fmt(min)}-${fmt(max)} juta`
    }

    const handleAnalyze = () => {
        selectJob(job)
        analyzeGap(job.required_skills || [])
        setActiveTab('gap')
    }

    return (
        <div
            className="glass-card p-5 animate-slide-up hover:border-white/[0.15] transition-all duration-300 group"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="flex gap-4">
                {/* Score ring */}
                <div
                    className="score-ring shrink-0"
                    style={{
                        '--score': score,
                        '--ring-color': getRingColor(score),
                    }}
                >
                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-sm group-hover:text-brand-400 transition-colors">
                                {job.title}
                            </h3>
                            <p className="text-xs text-surface-400 mt-0.5">
                                {job.company} · {job.region_name || job.region_code}
                            </p>
                        </div>
                        {job.salary_min && (
                            <span className="text-xs text-emerald-400/80 font-medium whitespace-nowrap">
                                {formatSalary(job.salary_min, job.salary_max)}
                            </span>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                        {(job.required_skills || []).slice(0, 6).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                        ))}
                        {(job.required_skills || []).length > 6 && (
                            <span className="text-[10px] text-surface-500 self-center">
                                +{job.required_skills.length - 6} lainnya
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.05]">
                        <button
                            onClick={handleAnalyze}
                            className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                        >
                            📊 Analisis Skill Gap
                        </button>
                        <span className="text-surface-600">·</span>
                        <span className="text-[10px] text-surface-500">
                            {job.education_min || 'S1'} · {job.experience_years_min || 0}+ tahun
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
