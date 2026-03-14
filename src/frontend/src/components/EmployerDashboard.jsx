import { useState } from 'react'
import {
    Building2, Plus, Search, Briefcase, Users, Eye, MapPin,
    Wallet, Clock, Pause, Play, Trash2, ChevronDown, ChevronUp,
    Sparkles, GraduationCap, Star, TrendingUp, FileText, Send
} from 'lucide-react'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'

/**
 * EmployerDashboard — Unified employer experience.
 * Includes: stats overview, post job form, manage listings, and candidate search.
 */

const REGIONS = [
    { code: '3171', name: 'Jakarta Pusat' },
    { code: '3172', name: 'Jakarta Utara' },
    { code: '3173', name: 'Jakarta Barat' },
    { code: '3174', name: 'Jakarta Selatan' },
    { code: '3175', name: 'Jakarta Timur' },
    { code: '3273', name: 'Bandung' },
    { code: '3374', name: 'Semarang' },
    { code: '3578', name: 'Surabaya' },
    { code: '3471', name: 'Yogyakarta' },
    { code: '1371', name: 'Padang' },
    { code: '1275', name: 'Medan' },
    { code: '7371', name: 'Makassar' },
    { code: '6471', name: 'Balikpapan' },
    { code: '5171', name: 'Denpasar' },
]

const POPULAR_SKILLS = [
    'Python', 'JavaScript', 'React', 'SQL', 'Java', 'Go', 'TypeScript',
    'Docker', 'Kubernetes', 'AWS', 'Machine Learning', 'Data Analysis',
    'Excel', 'Figma', 'Node.js', 'PostgreSQL', 'MongoDB', 'Flutter',
    'Project Management', 'Communication', 'Marketing', 'Sales',
]

const EDUCATION_LEVELS = [
    { value: 'SMA', label: 'SMA/SMK' },
    { value: 'D3', label: 'D3 (Diploma)' },
    { value: 'S1', label: 'S1 (Sarjana)' },
    { value: 'S2', label: 'S2 (Master)' },
    { value: 'S3', label: 'S3 (Doktor)' },
]

export default function EmployerDashboard() {
    const { user, postedJobs, postJob, removePostedJob, toggleJobStatus } = useStore()
    const [activeSection, setActiveSection] = useState('overview') // overview | post | manage | search
    const [expandedJob, setExpandedJob] = useState(null)

    /**
     * Computes summary statistics for the employer dashboard.
     */
    const stats = {
        totalJobs: postedJobs.length,
        activeJobs: postedJobs.filter(j => j.status === 'active').length,
        totalViews: postedJobs.reduce((acc, j) => acc + (j.views || 0), 0),
        totalApplicants: postedJobs.reduce((acc, j) => acc + (j.applicants || 0), 0),
    }

    const sections = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'post', label: 'Pasang Lowongan', icon: Plus },
        { id: 'manage', label: 'Kelola Lowongan', icon: FileText, badge: stats.totalJobs },
        { id: 'search', label: 'Cari Kandidat', icon: Search },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-xl font-bold">Dashboard Employer</h2>
                    </div>
                    <p className="text-sm text-surface-400">
                        Selamat datang, <span className="text-white font-medium">{user.name || 'Employer'}</span>
                    </p>
                </div>
                <button
                    onClick={() => setActiveSection('post')}
                    className="btn-glow flex items-center gap-2 text-sm px-5 py-2.5"
                >
                    <Plus className="w-4 h-4" />
                    Pasang Lowongan Baru
                </button>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
                {sections.map(({ id, label, icon: Icon, badge }) => (
                    <button
                        key={id}
                        onClick={() => setActiveSection(id)}
                        className={`tab-btn flex items-center gap-2 whitespace-nowrap ${activeSection === id ? 'active' : ''}`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                        {badge > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                {badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeSection === 'overview' && <OverviewSection stats={stats} postedJobs={postedJobs} setActiveSection={setActiveSection} />}

            {/* ── POST JOB ── */}
            {activeSection === 'post' && <PostJobSection postJob={postJob} setActiveSection={setActiveSection} />}

            {/* ── MANAGE LISTINGS ── */}
            {activeSection === 'manage' && (
                <ManageSection
                    postedJobs={postedJobs}
                    expandedJob={expandedJob}
                    setExpandedJob={setExpandedJob}
                    toggleJobStatus={toggleJobStatus}
                    removePostedJob={removePostedJob}
                />
            )}

            {/* ── CANDIDATE SEARCH ── */}
            {activeSection === 'search' && <CandidateSearchSection />}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  OVERVIEW SECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * OverviewSection — Stats cards and quick actions for employers.
 */
function OverviewSection({ stats, postedJobs, setActiveSection }) {
    const statCards = [
        { label: 'Lowongan Aktif', value: stats.activeJobs, icon: Briefcase, color: 'emerald' },
        { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'brand' },
        { label: 'Total Pelamar', value: stats.totalApplicants, icon: Users, color: 'purple' },
        { label: 'Total Lowongan', value: stats.totalJobs, icon: FileText, color: 'cyan' },
    ]

    return (
        <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statCards.map(({ label, value, icon: Icon, color }, i) => (
                    <div
                        key={label}
                        className="glass-card p-5 text-center animate-slide-up"
                        style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                    >
                        <Icon className={`w-5 h-5 text-${color}-400 mx-auto mb-2 opacity-70`} />
                        <div className="text-2xl font-extrabold tabular-nums">{value}</div>
                        <div className="text-[11px] text-surface-400 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveSection('post')}
                    className="glass-card-hover p-6 text-left group"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">Pasang Lowongan Baru</h3>
                    <p className="text-xs text-surface-400">Publikasikan lowongan dan jangkau 50K+ pencari kerja.</p>
                </button>

                <button
                    onClick={() => setActiveSection('search')}
                    className="glass-card-hover p-6 text-left group"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Search className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">Cari Kandidat</h3>
                    <p className="text-xs text-surface-400">Gunakan AI untuk menemukan kandidat yang cocok.</p>
                </button>
            </div>

            {/* Recent postings */}
            {postedJobs.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-surface-400" />
                        Lowongan Terbaru
                    </h3>
                    <div className="space-y-2">
                        {postedJobs.slice(0, 3).map((job) => (
                            <div key={job.job_id} className="glass-card p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold">{job.title}</h4>
                                    <p className="text-[11px] text-surface-400 mt-0.5">
                                        {job.region_name} · {job.applicants} pelamar · {job.views} views
                                    </p>
                                </div>
                                <span className={`badge text-[10px] ${
                                    job.status === 'active' ? 'badge-success' : 'badge-warning'
                                }`}>
                                    {job.status === 'active' ? 'Aktif' : 'Dijeda'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST JOB FORM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PostJobSection — Form to create and publish a new job listing.
 */
function PostJobSection({ postJob, setActiveSection }) {
    const [form, setForm] = useState({
        title: '',
        company: '',
        description: '',
        required_skills: [],
        education_min: 'S1',
        experience_min: 0,
        salary_min: 5000000,
        salary_max: 15000000,
        region_code: '3171',
        region_name: 'Jakarta Pusat',
        job_type: 'full-time',
    })
    const [skillInput, setSkillInput] = useState('')
    const [showAllSkills, setShowAllSkills] = useState(false)

    /**
     * Updates a single form field.
     */
    const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    /**
     * Toggles a skill chip on/off in the required skills list.
     */
    const toggleSkill = (skill) => {
        setForm(prev => ({
            ...prev,
            required_skills: prev.required_skills.includes(skill)
                ? prev.required_skills.filter(s => s !== skill)
                : [...prev.required_skills, skill],
        }))
    }

    /**
     * Adds a custom skill from the text input.
     */
    const addCustomSkill = () => {
        const skills = skillInput.split(',').map(s => s.trim()).filter(Boolean)
        skills.forEach(s => {
            if (!form.required_skills.includes(s)) {
                setForm(prev => ({ ...prev, required_skills: [...prev.required_skills, s] }))
            }
        })
        setSkillInput('')
    }

    /**
     * Validates and submits the job posting.
     */
    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.title.trim()) return toast.error('Judul lowongan wajib diisi')
        if (!form.company.trim()) return toast.error('Nama perusahaan wajib diisi')
        if (form.required_skills.length === 0) return toast.error('Tambahkan minimal 1 skill')

        postJob(form)
        setActiveSection('manage')
    }

    const displayedSkills = showAllSkills ? POPULAR_SKILLS : POPULAR_SKILLS.slice(0, 12)

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="glass-card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold">Pasang Lowongan Baru</h3>
                        <p className="text-xs text-surface-400">Isi detail lowongan untuk dipublikasikan</p>
                    </div>
                </div>

                {/* Title & Company */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                            Judul Lowongan <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="contoh: Data Scientist"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            Nama Perusahaan <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.company}
                            onChange={(e) => updateField('company', e.target.value)}
                            placeholder="PT Contoh Indonesia"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 mb-4">
                    <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        Deskripsi Pekerjaan
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Jelaskan tanggung jawab, qualifikasi, dan benefit yang ditawarkan..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                    />
                </div>

                {/* Skills */}
                <div className="space-y-1.5 mb-4">
                    <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Skills yang Dibutuhkan ({form.required_skills.length} dipilih)
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                            placeholder="Tambah skill manual..."
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-emerald-500/40 outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {displayedSkills.map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={`skill-tag-interactive ${
                                    form.required_skills.includes(skill) ? 'active' : ''
                                }`}
                            >
                                {skill}
                            </button>
                        ))}
                        {!showAllSkills && (
                            <button
                                type="button"
                                onClick={() => setShowAllSkills(true)}
                                className="text-[11px] text-brand-400 hover:text-brand-300 px-2"
                            >
                                +{POPULAR_SKILLS.length - 12} lainnya
                            </button>
                        )}
                    </div>
                </div>

                {/* Education, Experience, Region, Job Type */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                            Pendidikan Minimum
                        </label>
                        <select
                            value={form.education_min}
                            onChange={(e) => updateField('education_min', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:border-emerald-500/40 outline-none transition-all appearance-none cursor-pointer"
                        >
                            {EDUCATION_LEVELS.map(({ value, label }) => (
                                <option key={value} value={value} className="bg-surface-900">{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            Pengalaman Minimum (tahun)
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={30}
                            value={form.experience_min}
                            onChange={(e) => updateField('experience_min', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:border-emerald-500/40 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            Lokasi Kerja
                        </label>
                        <select
                            value={form.region_code}
                            onChange={(e) => {
                                const r = REGIONS.find(r => r.code === e.target.value)
                                updateField('region_code', e.target.value)
                                updateField('region_name', r?.name || '')
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:border-emerald-500/40 outline-none transition-all appearance-none cursor-pointer"
                        >
                            {REGIONS.map(({ code, name }) => (
                                <option key={code} value={code} className="bg-surface-900">{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                            Tipe Pekerjaan
                        </label>
                        <select
                            value={form.job_type}
                            onChange={(e) => updateField('job_type', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:border-emerald-500/40 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="full-time" className="bg-surface-900">Full-time</option>
                            <option value="part-time" className="bg-surface-900">Part-time</option>
                            <option value="contract" className="bg-surface-900">Kontrak</option>
                            <option value="freelance" className="bg-surface-900">Freelance</option>
                            <option value="internship" className="bg-surface-900">Magang</option>
                        </select>
                    </div>
                </div>

                {/* Salary Range */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                            Gaji Minimum (Rp)
                        </label>
                        <input
                            type="number"
                            value={form.salary_min}
                            onChange={(e) => updateField('salary_min', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:border-emerald-500/40 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                            Gaji Maksimum (Rp)
                        </label>
                        <input
                            type="number"
                            value={form.salary_max}
                            onChange={(e) => updateField('salary_max', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:border-emerald-500/40 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" className="w-full btn-glow py-3.5 text-sm font-semibold flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Publikasikan Lowongan
                </button>
            </div>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MANAGE LISTINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ManageSection — List and manage posted job listings.
 */
function ManageSection({ postedJobs, expandedJob, setExpandedJob, toggleJobStatus, removePostedJob }) {
    if (postedJobs.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                    <FileText className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Belum Ada Lowongan</h3>
                <p className="text-sm text-surface-400 max-w-md mx-auto">
                    Mulai publikasikan lowongan untuk menarik kandidat terbaik.
                </p>
            </div>
        )
    }

    /**
     * Formats an ISO date to a relative time string.
     */
    const formatDate = (iso) => {
        if (!iso) return ''
        const d = new Date(iso)
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    /**
     * Formats salary in Indonesian Rupiah.
     */
    const fmtSalary = (v) => `Rp ${(v / 1_000_000).toFixed(0)} juta`

    return (
        <div className="space-y-3">
            {postedJobs.map((job, i) => (
                <div
                    key={job.job_id}
                    className="glass-card overflow-hidden animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
                >
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-sm truncate">{job.title}</h3>
                                    <span className={`badge text-[9px] ${job.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                        {job.status === 'active' ? 'Aktif' : 'Dijeda'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-surface-400 flex-wrap">
                                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.region_name}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(job.posted_at)}</span>
                                </div>

                                {/* Metrics */}
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="flex items-center gap-1 text-xs text-surface-300">
                                        <Eye className="w-3 h-3 text-brand-400" />
                                        {job.views} views
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-surface-300">
                                        <Users className="w-3 h-3 text-emerald-400" />
                                        {job.applicants} pelamar
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-surface-300">
                                        <Wallet className="w-3 h-3 text-amber-400" />
                                        {fmtSalary(job.salary_min)}–{fmtSalary(job.salary_max)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => toggleJobStatus(job.job_id)}
                                    className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                                    title={job.status === 'active' ? 'Jeda lowongan' : 'Aktifkan lowongan'}
                                >
                                    {job.status === 'active'
                                        ? <Pause className="w-4 h-4 text-amber-400" />
                                        : <Play className="w-4 h-4 text-emerald-400" />
                                    }
                                </button>
                                <button
                                    onClick={() => setExpandedJob(expandedJob === job.job_id ? null : job.job_id)}
                                    className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                                >
                                    {expandedJob === job.job_id
                                        ? <ChevronUp className="w-4 h-4 text-surface-400" />
                                        : <ChevronDown className="w-4 h-4 text-surface-400" />
                                    }
                                </button>
                                <button
                                    onClick={() => removePostedJob(job.job_id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400/60" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded details */}
                    {expandedJob === job.job_id && (
                        <div className="px-5 pb-5 pt-0 border-t border-white/[0.04] mt-0">
                            <div className="pt-4 space-y-3">
                                {job.description && (
                                    <div>
                                        <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Deskripsi</p>
                                        <p className="text-xs text-surface-300 leading-relaxed">{job.description}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1.5">Skills</p>
                                    <div className="flex flex-wrap gap-1">
                                        {(job.required_skills || []).map((skill, si) => (
                                            <span key={si} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CANDIDATE SEARCH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CandidateSearchSection — AI-powered candidate search for employers.
 */
function CandidateSearchSection() {
    const [searchSkills, setSearchSkills] = useState('')
    const [searchResults, setSearchResults] = useState(null)

    /**
     * Simulates AI-powered candidate search with demo data.
     */
    const handleSearch = () => {
        if (!searchSkills.trim()) return toast.error('Masukkan skill yang dicari')

        // Demo results
        const demoResults = [
            { name: 'Andi Pratama', skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'], experience: 3, education: 'S1', region: 'Jakarta', score: 92 },
            { name: 'Siti Nurhaliza', skills: ['Python', 'Data Analysis', 'SQL', 'Tableau'], experience: 2, education: 'S1', region: 'Bandung', score: 87 },
            { name: 'Budi Hartono', skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'], experience: 4, education: 'S1', region: 'Surabaya', score: 84 },
            { name: 'Dewi Lestari', skills: ['Python', 'SQL', 'Excel', 'Statistics'], experience: 1, education: 'S1', region: 'Yogyakarta', score: 79 },
            { name: 'Reza Firmansyah', skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'], experience: 5, education: 'S2', region: 'Jakarta', score: 75 },
        ]
        setSearchResults(demoResults)
        toast.success(`${demoResults.length} kandidat ditemukan!`)
    }

    return (
        <div className="space-y-5">
            {/* Search input */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
                        <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Cari Kandidat dengan AI</h3>
                        <p className="text-xs text-surface-400">Masukkan skill yang dibutuhkan untuk menemukan kandidat terbaik</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        value={searchSkills}
                        onChange={(e) => setSearchSkills(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="contoh: Python, Machine Learning, SQL"
                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-brand-500/40 outline-none transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        className="btn-glow px-6 py-3 text-sm flex items-center gap-2 shrink-0"
                    >
                        <Search className="w-4 h-4" />
                        Cari
                    </button>
                </div>
            </div>

            {/* Results */}
            {searchResults && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand-400" />
                        {searchResults.length} Kandidat Cocok
                    </h3>
                    {searchResults.map((candidate, i) => (
                        <div
                            key={i}
                            className="glass-card-hover p-5 animate-slide-up"
                            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                        >
                            <div className="flex items-center gap-4">
                                {/* Score */}
                                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-brand-400">{candidate.score}%</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm">{candidate.name}</h4>
                                        {i === 0 && <span className="badge-brand text-[9px]"><Star className="w-2.5 h-2.5" /> Top Match</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                                        <span>{candidate.region}</span>
                                        <span>{candidate.experience} thn pengalaman</span>
                                        <span>{candidate.education}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {candidate.skills.map((s, si) => (
                                            <span key={si} className="skill-tag">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <button className="btn-outline text-xs px-4 py-2 shrink-0">
                                    Lihat Profil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!searchResults && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
                        <Users className="w-8 h-8 text-brand-400 opacity-50" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Temukan Kandidat Terbaik</h3>
                    <p className="text-sm text-surface-400 max-w-sm mx-auto">
                        Masukkan skill yang dibutuhkan di atas dan biarkan AI menemukan kandidat yang paling cocok.
                    </p>
                </div>
            )}
        </div>
    )
}
