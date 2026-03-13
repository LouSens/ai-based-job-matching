import useStore from './store/useStore'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import LandingHero from './components/LandingHero'
import SearchForm from './components/SearchForm'
import JobCard from './components/JobCard'
import SkillGapPanel from './components/SkillGapPanel'
import AdvisorChat from './components/AdvisorChat'
import DashboardPage from './components/DashboardPage'
import SavedJobsPage from './components/SavedJobsPage'
import EmployerDashboard from './components/EmployerDashboard'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import Footer from './components/Footer'

/**
 * App — Root component with role-aware routing.
 * Renders header, active tab content, auth modal, and footer.
 *
 * Architecture:
 *   App → AuthModal (overlay)
 *       → Header (nav + auth + tabs)
 *       → Routes:
 *           Guest:   home, privacy
 *           Seeker:  home, match, gap, advisor, dashboard, saved, privacy
 *           Employer: home, employer, advisor, privacy
 *       → Footer
 *
 * State: Zustand (useStore)
 * API:   services/api.js → FastAPI :8000
 */
export default function App() {
    const { activeTab, matches, matchError, isAuthenticated, userRole } = useStore()

    return (
        <div className="min-h-screen bg-surface-950 flex flex-col">
            {/* Background ambient effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/[0.06] rounded-full blur-[150px] animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[120px] animate-float animation-delay-300" />
                <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-purple-500/[0.03] rounded-full blur-[100px] animate-float animation-delay-700" />
            </div>

            {/* Auth Modal (overlay) */}
            <AuthModal />

            <Header />

            <main className="flex-1">
                {/* ── LANDING / HOME TAB ── */}
                {activeTab === 'home' && <LandingHero />}

                {/* ── PRIVACY & POLICY ── */}
                {activeTab === 'privacy' && (
                    <PrivacyPolicyPage />
                )}

                {/* ══════════════════════════════════════════════════════════════
                    SEEKER TABS
                   ══════════════════════════════════════════════════════════════ */}

                {/* ── MATCH TAB (seeker) ── */}
                {activeTab === 'match' && (!isAuthenticated || userRole === 'seeker') && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
                        <SearchForm />

                        {matchError && (
                            <div className="glass-card p-4 border-red-500/20 animate-fade-in">
                                <p className="text-sm text-red-400">⚠️ {matchError}</p>
                                <p className="text-xs text-surface-400 mt-1">
                                    Pastikan API berjalan: <code className="text-brand-400">uvicorn src.api.main:app --port 8000</code>
                                </p>
                            </div>
                        )}

                        {matches.length > 0 && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold">
                                            Hasil Matching <span className="gradient-text">AI</span>
                                        </h2>
                                        <p className="text-xs text-surface-400 mt-0.5">
                                            Ditemukan {matches.length} lowongan · Diurutkan berdasarkan skor tertinggi
                                        </p>
                                    </div>
                                    <span className="badge-brand">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-soft"></span>
                                        AI Powered
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {matches.map((job, i) => (
                                        <JobCard key={job.job_id || i} job={job} index={i} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {matches.length === 0 && !matchError && (
                            <div className="text-center py-16 animate-fade-in">
                                <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-4xl mx-auto mb-5 animate-float">
                                    🚀
                                </div>
                                <h3 className="text-xl font-bold gradient-text mb-2">
                                    Temukan Pekerjaan Impianmu
                                </h3>
                                <p className="text-sm text-surface-400 max-w-md mx-auto leading-relaxed">
                                    Isi profil di atas dan klik <span className="text-brand-400 font-medium">"Temukan Pekerjaan"</span> untuk
                                    mendapatkan rekomendasi pekerjaan yang cocok dengan skill kamu menggunakan AI.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── SKILL GAP TAB (seeker) ── */}
                {activeTab === 'gap' && (!isAuthenticated || userRole === 'seeker') && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        <SkillGapPanel />
                    </div>
                )}

                {/* ── ADVISOR TAB (both roles) ── */}
                {activeTab === 'advisor' && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        <AdvisorChat />
                    </div>
                )}

                {/* ── DASHBOARD TAB (seeker) ── */}
                {activeTab === 'dashboard' && (!isAuthenticated || userRole === 'seeker') && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        <DashboardPage />
                    </div>
                )}

                {/* ── SAVED JOBS TAB (seeker) ── */}
                {activeTab === 'saved' && (!isAuthenticated || userRole === 'seeker') && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        <SavedJobsPage />
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    EMPLOYER TABS
                   ══════════════════════════════════════════════════════════════ */}

                {/* ── EMPLOYER DASHBOARD ── */}
                {activeTab === 'employer' && isAuthenticated && userRole === 'employer' && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        <EmployerDashboard />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
