import useStore from '../store/useStore'

/**
 * SearchForm — Profile input form for job matching.
 *
 * Fields: name, skills (comma-separated), experience, education, region, salary.
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
]

const EDUCATION = ['SMK', 'D3', 'S1', 'S2', 'S3']

export default function SearchForm() {
    const { profile, updateProfile, searchJobs, matchLoading } = useStore()

    const handleSubmit = (e) => {
        e.preventDefault()
        searchJobs()
    }

    const formatSalary = (val) => {
        return `Rp ${(val / 1_000_000).toFixed(0)} juta`
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
                    👤
                </div>
                <div>
                    <h2 className="text-base font-semibold">Profil Pencari Kerja</h2>
                    <p className="text-xs text-surface-400">Isi profil untuk matching AI</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">Nama Lengkap</label>
                    <input
                        id="input-name"
                        type="text"
                        className="input-dark"
                        placeholder="Budi Santoso"
                        value={profile.name}
                        onChange={(e) => updateProfile('name', e.target.value)}
                    />
                </div>

                {/* Skills */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">
                        Skills <span className="text-surface-500">(pisahkan dengan koma)</span>
                    </label>
                    <input
                        id="input-skills"
                        type="text"
                        className="input-dark"
                        placeholder="Python, SQL, Excel, Machine Learning, Docker"
                        value={profile.skills}
                        onChange={(e) => updateProfile('skills', e.target.value)}
                    />
                    {profile.skills && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {profile.skills.split(',').map((s, i) =>
                                s.trim() ? (
                                    <span key={i} className="skill-tag">{s.trim()}</span>
                                ) : null
                            )}
                        </div>
                    )}
                </div>

                {/* Experience */}
                <div>
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">Pengalaman (tahun)</label>
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
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">Pendidikan</label>
                    <select
                        id="input-education"
                        className="input-dark"
                        value={profile.education_level}
                        onChange={(e) => updateProfile('education_level', e.target.value)}
                    >
                        {EDUCATION.map((e) => (
                            <option key={e} value={e} className="bg-surface-900">{e}</option>
                        ))}
                    </select>
                </div>

                {/* Region */}
                <div>
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">Lokasi</label>
                    <select
                        id="input-region"
                        className="input-dark"
                        value={profile.region_code}
                        onChange={(e) => updateProfile('region_code', e.target.value)}
                    >
                        {REGIONS.map((r) => (
                            <option key={r.code} value={r.code} className="bg-surface-900">{r.name}</option>
                        ))}
                    </select>
                </div>

                {/* Salary */}
                <div>
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">
                        Ekspektasi Gaji: <span className="text-brand-400 font-semibold">{formatSalary(profile.salary_expectation)}</span>
                    </label>
                    <input
                        id="input-salary"
                        type="range"
                        min="3000000"
                        max="50000000"
                        step="1000000"
                        className="w-full accent-brand-500 h-2 rounded-full"
                        value={profile.salary_expectation}
                        onChange={(e) => updateProfile('salary_expectation', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-surface-500 mt-0.5">
                        <span>Rp 3 juta</span>
                        <span>Rp 50 juta</span>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button
                id="btn-search"
                type="submit"
                disabled={matchLoading || !profile.skills.trim()}
                className="btn-glow w-full mt-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {matchLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Mencari pekerjaan...
                    </span>
                ) : (
                    '🔍 Temukan Pekerjaan'
                )}
            </button>
        </form>
    )
}
