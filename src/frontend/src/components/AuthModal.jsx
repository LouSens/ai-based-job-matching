import { useState } from 'react'
import { X, Mail, Lock, User, Briefcase, Search, Eye, EyeOff, Zap, Building2, UserCheck, Shield } from 'lucide-react'
import useStore from '../store/useStore'

/**
 * AuthModal — Full-screen modal for login and registration.
 * Supports role selection: Pencari Kerja (seeker) or Pemberi Kerja (employer).
 * Glassmorphism design with animated transitions.
 */
export default function AuthModal() {
    const { showAuthModal, closeAuthModal, authTab, setAuthTab, login, register } = useStore()

    // Form state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState(null) // 'seeker' | 'employer'
    const [showPassword, setShowPassword] = useState(false)
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    if (!showAuthModal) return null

    /**
     * Validates form fields and returns error object.
     */
    const validate = () => {
        const errs = {}
        if (authTab === 'register' && !name.trim()) errs.name = 'Nama wajib diisi'
        if (!email.trim()) errs.email = 'Email wajib diisi'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Format email tidak valid'
        if (!password) errs.password = 'Password wajib diisi'
        else if (password.length < 6) errs.password = 'Password minimal 6 karakter'
        if (authTab === 'register') {
            if (password !== confirmPassword) errs.confirmPassword = 'Password tidak cocok'
            if (!role) errs.role = 'Pilih tipe akun'
            if (!agreeTerms) errs.terms = 'Setujui syarat dan ketentuan'
        }
        return errs
    }

    /**
     * Handles form submission for both login and register.
     */
    const handleSubmit = (e) => {
        e.preventDefault()
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length > 0) return

        setLoading(true)
        // Simulate API delay
        setTimeout(() => {
            if (authTab === 'login') {
                login(email, password, role || 'seeker')
            } else {
                register(name, email, password, role)
            }
            setLoading(false)
            resetForm()
        }, 800)
    }

    /**
     * Resets all form fields to initial state.
     */
    const resetForm = () => {
        setName(''); setEmail(''); setPassword(''); setConfirmPassword('')
        setRole(null); setShowPassword(false); setAgreeTerms(false); setErrors({})
    }

    /**
     * Switches between login and register tabs and resets errors.
     */
    const switchTab = (tab) => {
        setAuthTab(tab)
        setErrors({})
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
                onClick={closeAuthModal}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-surface-900/95 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/40 animate-scale-in overflow-hidden">
                {/* Decorative gradient top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-cyan-500 to-purple-500" />

                {/* Close button */}
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-surface-400 hover:text-white z-10"
                    aria-label="Tutup modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Logo */}
                <div className="text-center pt-8 pb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/25">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">
                        {authTab === 'login' ? 'Masuk ke ' : 'Daftar di '}
                        <span className="gradient-text">KerjaCerdas</span>
                    </h2>
                    <p className="text-xs text-surface-400 mt-1">
                        {authTab === 'login'
                            ? 'Masuk untuk melanjutkan pencarian kerja atau pasang lowongan'
                            : 'Buat akun untuk memulai perjalanan kariermu'
                        }
                    </p>
                </div>

                {/* Tab switcher */}
                <div className="flex mx-6 rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 mb-6">
                    {[
                        { id: 'login', label: 'Masuk' },
                        { id: 'register', label: 'Daftar' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => switchTab(tab.id)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                authTab === tab.id
                                    ? 'bg-brand-500/20 text-brand-400 shadow-sm'
                                    : 'text-surface-400 hover:text-surface-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-4">
                    {/* Role selection (register only) */}
                    {authTab === 'register' && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                                Saya adalah... <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Seeker role */}
                                <button
                                    type="button"
                                    onClick={() => setRole('seeker')}
                                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                                        role === 'seeker'
                                            ? 'bg-brand-500/10 border-brand-500/30 shadow-lg shadow-brand-500/5'
                                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${
                                        role === 'seeker'
                                            ? 'bg-gradient-to-br from-brand-500 to-cyan-500'
                                            : 'bg-white/[0.06]'
                                    }`}>
                                        <Search className={`w-4 h-4 ${role === 'seeker' ? 'text-white' : 'text-surface-400'}`} />
                                    </div>
                                    <p className="text-sm font-bold">Pencari Kerja</p>
                                    <p className="text-[10px] text-surface-400 mt-0.5">Cari pekerjaan impianmu</p>
                                    {role === 'seeker' && (
                                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </button>

                                {/* Employer role */}
                                <button
                                    type="button"
                                    onClick={() => setRole('employer')}
                                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                                        role === 'employer'
                                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${
                                        role === 'employer'
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                            : 'bg-white/[0.06]'
                                    }`}>
                                        <Building2 className={`w-4 h-4 ${role === 'employer' ? 'text-white' : 'text-surface-400'}`} />
                                    </div>
                                    <p className="text-sm font-bold">Pemberi Kerja</p>
                                    <p className="text-[10px] text-surface-400 mt-0.5">Temukan kandidat terbaik</p>
                                    {role === 'employer' && (
                                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </button>
                            </div>
                            {errors.role && <p className="text-[11px] text-red-400">{errors.role}</p>}
                        </div>
                    )}

                    {/* Name field (register only) */}
                    {authTab === 'register' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-brand-400" />
                                {role === 'employer' ? 'Nama Perusahaan' : 'Nama Lengkap'}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={role === 'employer' ? 'PT Contoh Indonesia' : 'Budi Santoso'}
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                            />
                            {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-brand-400" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contoh@email.com"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                        />
                        {errors.email && <p className="text-[11px] text-red-400">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-brand-400" />
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-[11px] text-red-400">{errors.password}</p>}
                    </div>

                    {/* Confirm Password (register only) */}
                    {authTab === 'register' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-surface-300 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-brand-400" />
                                Konfirmasi Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Masukkan ulang password"
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm placeholder:text-surface-600 focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                            />
                            {errors.confirmPassword && <p className="text-[11px] text-red-400">{errors.confirmPassword}</p>}
                        </div>
                    )}

                    {/* Terms (register only) */}
                    {authTab === 'register' && (
                        <div className="flex items-start gap-3 pt-1">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/[0.04] text-brand-500 focus:ring-brand-500/20"
                            />
                            <label htmlFor="agreeTerms" className="text-xs text-surface-400 leading-relaxed cursor-pointer">
                                Saya setuju dengan{' '}
                                <button
                                    type="button"
                                    onClick={() => { closeAuthModal(); useStore.getState().setActiveTab('privacy') }}
                                    className="text-brand-400 hover:underline"
                                >
                                    Kebijakan Privasi
                                </button>{' '}
                                dan{' '}
                                <button
                                    type="button"
                                    onClick={() => { closeAuthModal(); useStore.getState().setActiveTab('privacy') }}
                                    className="text-brand-400 hover:underline"
                                >
                                    Syarat & Ketentuan
                                </button>
                            </label>
                        </div>
                    )}
                    {errors.terms && <p className="text-[11px] text-red-400 -mt-2">{errors.terms}</p>}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-glow py-3.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Memproses...
                            </span>
                        ) : authTab === 'login' ? 'Masuk' : 'Buat Akun'}
                    </button>

                    {/* Divider */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.06]" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-surface-900 px-3 text-[10px] text-surface-500 uppercase tracking-wide">atau</span>
                        </div>
                    </div>

                    {/* Social login buttons (demo placeholders) */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-surface-300 hover:bg-white/[0.08] transition-all"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-surface-300 hover:bg-white/[0.08] transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            LinkedIn
                        </button>
                    </div>

                    {/* Security note */}
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                        <Shield className="w-3 h-3 text-surface-500" />
                        <p className="text-[10px] text-surface-500">
                            Data terenkripsi · Dilindungi oleh kebijakan privasi
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
