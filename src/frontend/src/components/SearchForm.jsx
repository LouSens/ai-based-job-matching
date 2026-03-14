import { useState } from 'react'
import { Search, User, Briefcase, GraduationCap, MapPin, Wallet, Sparkles, ChevronDown, X } from 'lucide-react'
import useStore from '../store/useStore'

/**
 * SearchForm — Profile input form for job matching.
 *
 * Features: interactive skill chips, salary slider, region select, animated submit.
 * Submits to POST /api/v1/match via Zustand store.
 */

const REGIONS = [
    { code: '3171', name: 'Jakarta Pusat' },
    { code: '3174', name: 'Jakarta Selatan' },
    { code: '3173', name: 'Jakarta Barat' },
    { code: '3172', name: 'Jakarta Utara' },
    { code: '3175', name: 'Jakarta Timur' },
    { code: '3578', name: 'Surabaya' },
    { code: '3573', name: 'Malang' },
    { code: '3471', name: 'Yogyakarta' },
    { code: '1271', name: 'Medan' },
    { code: '7371', name: 'Makassar' },
    { code: '5171', name: 'Denpasar' },
    { code: '3271', name: 'Bogor' },
    { code: '3273', name: 'Bandung' },
    { code: '6471', name: 'Balikpapan' },
    { code: '1571', name: 'Palembang' },
    { code: '3374', name: 'Semarang' },
]

const EDUCATION = [
    { value: 'SMA', label: 'SMA / SMK' },
    { value: 'D3', label: 'D3 (Diploma)' },
    { value: 'S1', label: 'S1 (Sarjana)' },
    { value: 'S2', label: 'S2 (Magister)' },
    { value: 'S3', label: 'S3 (Doktor)' },
]

const POPULAR_SKILLS = [
    'Python', 'SQL', 'Excel', 'JavaScript', 'React', 'Java', 'Docker',
    'Statistics', 'Machine Learning', 'Tableau', 'Go', 'TypeScript',
    'PostgreSQL', 'Redis', 'Spark', 'TensorFlow', 'PyTorch', 'Kubernetes',
    'Data Analysis', 'Business Analysis', 'Project Management', 'Figma',
]

export default function SearchForm() {
    const { profile, updateProfile, searchJobs, matchLoading } = useStore()
    const [showAllSkills, setShowAllSkills] = useState(false)

    /**
     * Handles form submission for job search.
     */
    const handleSubmit = (e) => {
        e.preventDefault()
        searchJobs()
    }

    /**
     * Formats salary value to Indonesian currency display string.
     */
    const formatSalary = (val) => {
        return `Rp ${(val / 1_000_000).toFixed(0)} juta`
    }

    /**
     * Toggles a skill in the profile's comma-separated skills string.
     */
    const toggleSkill = (skill) => {
        const current = profile.skills.split(',').map(s => s.trim()).filter(Boolean)
        const exists = current.some(s => s.toLowerCase() === skill.toLowerCase())
        if (exists) {
            updateProfile('skills', current.filter(s => s.toLowerCase() !== skill.toLowerCase()).join(', '))
        } else {
            updateProfile('skills', [...current, skill].join(', '))
        }
    }

    const currentSkills = profile.skills.split(',').map(s => s.trim()).filter(Boolean)
    const displayedSkills = showAllSkills ? POPULAR_SKILLS : POPULAR_SKILLS.slice(0, 12)

    return (
        <form onSubmit={handleSubmit} className="glass-card overflow-hidden animate-fade-in">
            {/* Form Header */}
            <div className="p-5 sm:p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold">Profil Pencari Kerja</h2>
                        <p className="text-xs text-surface-400">Isi profil untuk mendapatkan rekomendasi AI terbaik</p>
                    </div>
                </div>
            </div>

            {/* Form Body */}
            <div className="p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-surface-300 mb-2">
                            <User className="w-3.5 h-3.5 text-surface-500" />
                            Nama Lengkap
                        </label>
                        <input
                            id="input-name"
                            type="text"
                            className="input-dark"
                            placeholder="Budi Santoso"
                            value={profile.name}
                            onChange={(e) => updateProfile('name', e.target.value)}
                        />
                    </div>

                    {/* Experience */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-surface-300 mb-2">
                            <Briefcase className="w-3.5 h-3.5 text-surface-500" />
                            Pengalaman (tahun)
                        </label>
                        <input
                            id="input-experience"
                            type="number"
                            min="0"
                            max="30"
                            className="input-dark"
                            value={profile.experience_years}
                            onChange={(e) => updateProfile('experience_years', parseInt(e.target.value) || 0)}
                        />
                    </div>

                    {/* Education */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-surface-300 mb-2">
                            <GraduationCap className="w-3.5 h-3.5 text-surface-500" />
                            Pendidikan
                        </label>
                        <div className="relative">
                            <select
                                id="input-education"
                                className="input-dark appearance-none pr-10"
                                value={profile.education_level}
                                onChange={(e) => updateProfile('education_level', e.target.value)}
                            >
                                {EDUCATION.map((e) => (
                                    <option key={e.value} value={e.value} className="bg-surface-900">{e.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Region */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-surface-300 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-surface-500" />
                            Lokasi Preferensi
                        </label>
                        <div className="relative">
                            <select
                                id="input-region"
                                className="input-dark appearance-none pr-10"
                                value={profile.region_code}
                                onChange={(e) => updateProfile('region_code', e.target.value)}
                            >
                                {REGIONS.map((r) => (
                                    <option key={r.code} value={r.code} className="bg-surface-900">{r.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Skills — Interactive Chips */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-surface-300 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-surface-500" />
                        Skills Kamu
                        <span className="text-surface-500 ml-1">({currentSkills.length} dipilih)</span>
                    </label>

                    {/* Manual input */}
                    <input
                        id="input-skills"
                        type="text"
                        className="input-dark mb-3"
                        placeholder="Tambah skill manual (pisahkan koma): Python, SQL, Docker..."
                        value={profile.skills}
                        onChange={(e) => updateProfile('skills', e.target.value)}
                    />

                    {/* Quick skill chips */}
                    <div className="flex flex-wrap gap-2">
                        {displayedSkills.map(skill => {
                            const active = currentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
                            return (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    className={`skill-tag-interactive ${active
                                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/30 shadow-sm shadow-brand-500/10'
                                        : 'bg-white/[0.03] text-surface-400 border-white/[0.08] hover:bg-white/[0.06] hover:text-surface-200 hover:border-white/[0.15]'
                                        }`}
                                >
                                    {active && <span className="text-brand-400">✓</span>}
                                    {skill}
                                    {active && <X className="w-3 h-3 ml-0.5 text-brand-400/60" />}
                                </button>
                            )
                        })}
                        <button
                            type="button"
                            onClick={() => setShowAllSkills(!showAllSkills)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium text-surface-500 hover:text-surface-300 transition-colors"
                        >
                            {showAllSkills ? '← Lebih sedikit' : `+${POPULAR_SKILLS.length - 12} lainnya`}
                        </button>
                    </div>
                </div>

                {/* Salary Slider */}
                <div>
                    <label className="flex items-center justify-between text-xs font-medium text-surface-300 mb-3">
                        <span className="flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-surface-500" />
                            Ekspektasi Gaji
                        </span>
                        <span className="text-brand-400 font-bold text-sm">{formatSalary(profile.salary_expectation)}</span>
                    </label>
                    <input
                        id="input-salary"
                        type="range"
                        min="3000000"
                        max="50000000"
                        step="1000000"
                        className="w-full accent-brand-500 h-2 rounded-full cursor-pointer"
                        value={profile.salary_expectation}
                        onChange={(e) => updateProfile('salary_expectation', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-surface-500 mt-1.5">
                        <span>Rp 3 juta</span>
                        <span>Rp 25 juta</span>
                        <span>Rp 50 juta</span>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="p-5 sm:p-6 border-t border-white/[0.06] bg-white/[0.01]">
                <button
                    id="btn-search"
                    type="submit"
                    disabled={matchLoading || currentSkills.length === 0}
                    className="btn-glow w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                    {matchLoading ? (
                        <span className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            AI sedang menganalisis 50,000+ lowongan...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Search className="w-5 h-5" />
                            Temukan Pekerjaan dengan AI
                        </span>
                    )}
                </button>
                {currentSkills.length === 0 && (
                    <p className="text-center text-[11px] text-surface-500 mt-2">
                        Pilih minimal 1 skill untuk mulai pencarian
                    </p>
                )}
            </div>
        </form>
    )
}
