import useStore from './store/useStore'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import JobCard from './components/JobCard'
import SkillGapPanel from './components/SkillGapPanel'
import AdvisorChat from './components/AdvisorChat'

/**
 * App — Root component. Renders header + active tab content.
 *
 * Architecture:
 *   App → Header (tabs)
 *       → TabContent (match | gap | advisor)
 *
 * State: Zustand (useStore)
 * API:   services/api.js → FastAPI :8000
 */
export default function App() {
    const { activeTab, matches, matchError } = useStore()

    return (
        <div className="min-h-screen bg-surface-950">
            {/* Background gradient */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/[0.07] rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/[0.05] rounded-full blur-[100px]" />
            </div>

            <Header />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                {/* ── MATCH TAB ── */}
                {activeTab === 'match' && (
                    <div className="space-y-5">
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
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-sm font-semibold text-surface-300">
                                        Hasil Matching <span className="text-brand-400">({matches.length})</span>
                                    </h2>
                                    <span className="text-[10px] text-surface-500">Diurutkan berdasarkan skor tertinggi</span>
                                </div>
                                <div className="space-y-3">
                                    {matches.map((job, i) => (
                                        <JobCard key={job.job_id || i} job={job} index={i} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {matches.length === 0 && !matchError && (
                            <div className="text-center py-12 animate-fade-in">
                                <div className="text-5xl mb-4">🚀</div>
                                <h3 className="text-lg font-semibold gradient-text mb-2">
                                    Temukan Pekerjaan Impianmu
                                </h3>
                                <p className="text-sm text-surface-400 max-w-md mx-auto">
                                    Isi profil di atas dan klik <span className="text-brand-400 font-medium">"Temukan Pekerjaan"</span> untuk
                                    mendapatkan rekomendasi pekerjaan yang cocok dengan skill kamu menggunakan AI.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── SKILL GAP TAB ── */}
                {activeTab === 'gap' && <SkillGapPanel />}

                {/* ── ADVISOR TAB ── */}
                {activeTab === 'advisor' && <AdvisorChat />}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.04] mt-12 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-surface-500">
                        © 2026 KerjaCerdas · Hackathon MVP · Antigravity Protocol
                    </p>
                    <p className="text-[10px] text-surface-600">
                        Powered by Google Gemini · IndoBERT · FastAPI
                    </p>
                </div>
            </footer>
        </div>
    )
}
