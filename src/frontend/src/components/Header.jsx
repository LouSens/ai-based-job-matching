import { useEffect, useState } from 'react'
import {
    Search, BarChart3, Bot, LayoutDashboard, Bookmark, Home, Menu, X, Zap,
    LogIn, UserPlus, LogOut, ChevronDown, Building2, Shield, User, Settings
} from 'lucide-react'
import useStore from '../store/useStore'
import { healthCheck } from '../services/api'

/**
 * Header — Top navigation with branding, role-aware tabs, auth controls,
 * API status, and mobile menu. Sticky with backdrop blur.
 *
 * Navigation adapts based on userRole:
 *   - null (guest): home only
 *   - 'seeker': home, match, gap, advisor, dashboard, saved
 *   - 'employer': home, employer dashboard (with sub-tabs)
 */
export default function Header() {
    const {
        activeTab, setActiveTab, apiStatus, setApiStatus,
        savedJobs, isMobileMenuOpen, setMobileMenuOpen,
        isAuthenticated, userRole, user, openAuthModal, logout
    } = useStore()
    const [scrolled, setScrolled] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    useEffect(() => {
        /**
         * Checks the API health status on mount.
         */
        healthCheck()
            .then(() => setApiStatus('connected'))
            .catch(() => setApiStatus('offline'))
    }, [setApiStatus])

    useEffect(() => {
        /**
         * Tracks scroll position for header blur effect.
         */
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    /**
     * Builds the navigation tabs dynamically based on user role.
     */
    const getTabs = () => {
        const commonStart = [{ id: 'home', label: 'Beranda', icon: Home }]

        if (!isAuthenticated) {
            return commonStart
        }

        if (userRole === 'employer') {
            return [
                ...commonStart,
                { id: 'employer', label: 'Dashboard', icon: Building2 },
                { id: 'advisor', label: 'AI Advisor', icon: Bot },
                { id: 'privacy', label: 'Privasi', icon: Shield },
            ]
        }

        // seeker
        return [
            ...commonStart,
            { id: 'match', label: 'Cari Kerja', icon: Search },
            { id: 'gap', label: 'Skill Gap', icon: BarChart3 },
            { id: 'advisor', label: 'AI Advisor', icon: Bot },
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'saved', label: 'Tersimpan', icon: Bookmark, badge: savedJobs.length },
        ]
    }

    const tabs = getTabs()

    /**
     * Handles tab click and closes mobile menu.
     */
    const handleTabClick = (tabId) => {
        setActiveTab(tabId)
        setMobileMenuOpen(false)
        setShowUserMenu(false)
    }

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-surface-950/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-xl shadow-black/20'
            : 'bg-surface-950/60 backdrop-blur-xl border-b border-white/[0.04]'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* ── Top Bar Container ── */}
                <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
                    
                    {/* 1. Logo (Left) */}
                    <button
                        onClick={() => handleTabClick('home')}
                        className="flex-shrink-0 flex items-center gap-3 group focus:outline-none"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-lg font-bold tracking-tight">
                                Kerja<span className="gradient-text">Cerdas</span>
                            </h1>
                            <p className="text-[10px] text-surface-500 -mt-0.5 tracking-wide uppercase hidden sm:block">
                                AI Job Matching · Indonesia
                            </p>
                        </div>
                    </button>

                    {/* 2. Desktop Navigation Tabs (Center) */}
                    <nav className="hidden lg:flex flex-1 justify-center items-center gap-1.5 px-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    id={`tab-${tab.id}`}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`tab-btn flex items-center gap-2 whitespace-nowrap focus:outline-none ${activeTab === tab.id ? 'active' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    {tab.badge > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold min-w-[18px] text-center">
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>

                    {/* 3. Right Side Controls (Right) */}
                    <div className="flex-shrink-0 flex items-center justify-end gap-3">
                        {/* Desktop API Status Indicator */}
                        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                            <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected'
                                ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                                : apiStatus === 'offline'
                                    ? 'bg-red-400 shadow-lg shadow-red-400/50'
                                    : 'bg-amber-400 animate-pulse-soft'
                                }`} />
                            <span className="text-[10px] text-surface-400 font-medium">
                                {apiStatus === 'connected' ? 'API Live' : apiStatus === 'offline' ? 'Offline' : 'Connecting...'}
                            </span>
                        </div>

                        {/* DESKTOP Auth Buttons / User Menu */}
                        {!isAuthenticated ? (
                            <div className="hidden lg:flex items-center gap-2">
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-surface-300 hover:text-white hover:bg-white/[0.06] transition-all focus:outline-none"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    Masuk
                                </button>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="btn-glow text-xs px-4 py-2 focus:outline-none"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Daftar
                                </button>
                            </div>
                        ) : (
                            /* DESKTOP User Menu Dropdown */
                            <div className="relative hidden lg:block">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all focus:outline-none"
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-inner ${
                                        userRole === 'employer'
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                            : 'bg-gradient-to-br from-brand-500 to-cyan-500'
                                    }`}>
                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left hidden md:block">
                                        <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user.name}</p>
                                        <p className="text-[10px] text-surface-400 -mt-0.5">
                                            {userRole === 'employer' ? 'Employer' : 'Pencari Kerja'}
                                        </p>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu Content */}
                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-surface-900/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 z-50 animate-fade-in-down overflow-hidden">
                                            <div className="px-4 py-3 border-b border-white/[0.06]">
                                                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                                                <p className="text-[11px] text-surface-400 truncate">{user.email}</p>
                                                <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                                    userRole === 'employer'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                                                }`}>
                                                    {userRole === 'employer' ? <Building2 className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                                                    {userRole === 'employer' ? 'Pemberi Kerja' : 'Pencari Kerja'}
                                                </span>
                                            </div>

                                            <div className="py-1.5">
                                                <button
                                                    onClick={() => { handleTabClick(userRole === 'employer' ? 'employer' : 'dashboard'); setShowUserMenu(false) }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-surface-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                                                >
                                                    <LayoutDashboard className="w-3.5 h-3.5" />
                                                    Dashboard Profil
                                                </button>
                                                <button
                                                    onClick={() => { handleTabClick('privacy'); setShowUserMenu(false) }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-surface-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                                                >
                                                    <Shield className="w-3.5 h-3.5" />
                                                    Kebijakan Privasi
                                                </button>
                                            </div>

                                            <div className="border-t border-white/[0.06] py-1.5">
                                                <button
                                                    onClick={() => { logout(); setShowUserMenu(false) }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" />
                                                    Keluar Akun
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mobile Menu Toggle (Hamburger) */}
                        <button
                            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden relative z-50 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors focus:outline-none"
                            aria-label="Toggle navigation menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5 text-white" />
                            ) : (
                                <Menu className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Menu Overlay ── */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full border-t border-white/[0.06] bg-surface-950/95 backdrop-blur-2xl shadow-2xl shadow-black/60 animate-fade-in-down">
                    <div className="max-w-md mx-auto px-4 py-4 space-y-1.5 max-h-[calc(100vh-5rem)] overflow-y-auto">
                        
                        {/* Mobile Navigation Tabs */}
                        <div className="space-y-1 mb-4">
                            <span className="px-4 text-[10px] font-bold tracking-wider text-surface-500 uppercase">Navigasi Utama</span>
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none ${activeTab === tab.id
                                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                                            : 'text-surface-300 hover:bg-white/[0.06] hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.label}
                                        {tab.badge > 0 && (
                                            <span className="ml-auto px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Mobile Auth Section */}
                        <div className="border-t border-white/[0.06] pt-4 mt-2">
                             <span className="px-4 text-[10px] font-bold tracking-wider text-surface-500 uppercase mb-2 block">Akun & Sistem</span>
                            
                            {!isAuthenticated ? (
                                <div className="flex gap-2 px-2">
                                    <button
                                        onClick={() => { openAuthModal('login'); setMobileMenuOpen(false) }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Masuk
                                    </button>
                                    <button
                                        onClick={() => { openAuthModal('register'); setMobileMenuOpen(false) }}
                                        className="flex-1 btn-glow flex items-center justify-center gap-2 text-sm py-3.5"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Daftar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 px-2">
                                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-inner ${
                                            userRole === 'employer'
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                                : 'bg-gradient-to-br from-brand-500 to-cyan-500'
                                        }`}>
                                            {(user.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{user.name}</p>
                                            <p className="text-[11px] text-surface-400">
                                                {userRole === 'employer' ? 'Pemberi Kerja' : 'Pencari Kerja'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false) }}
                                        className="w-full flex items-center justify-center gap-3 mt-2 px-4 py-3.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Keluar Akun
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile API Status */}
                        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                            <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-400' : apiStatus === 'offline' ? 'bg-red-400' : 'bg-amber-400 animate-pulse-soft'}`} />
                            <span className="text-[10px] text-surface-500 font-medium">
                                API Status: {apiStatus === 'connected' ? 'Connected' : apiStatus === 'offline' ? 'Offline' : 'Connecting...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
