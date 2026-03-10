/**
 * KerjaCerdas — Global State Store (Zustand)
 *
 * Per Protocol §7: State management via Zustand.
 * Single store for all app state: profile, matches, chat, UI.
 */
import { create } from 'zustand'
import { matchJobs, analyzeSkillGap, getCareerAdvice } from '../services/api'

const useStore = create((set, get) => ({
    // ── Active Tab ────────────────────────────────────────────────────
    activeTab: 'match',
    setActiveTab: (tab) => set({ activeTab: tab }),

    // ── Seeker Profile ────────────────────────────────────────────────
    profile: {
        name: '',
        skills: '',
        experience_years: 0,
        education_level: 'S1',
        region_code: '3171',
        salary_expectation: 10000000,
    },
    updateProfile: (field, value) =>
        set((s) => ({ profile: { ...s.profile, [field]: value } })),

    // ── Job Matching ──────────────────────────────────────────────────
    matches: [],
    matchLoading: false,
    matchError: null,

    searchJobs: async () => {
        const { profile } = get()
        set({ matchLoading: true, matchError: null })
        try {
            const seekerProfile = {
                ...profile,
                skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
            }
            const data = await matchJobs(seekerProfile, 10)
            set({ matches: data.matches || [], matchLoading: false })
        } catch (err) {
            set({ matchError: err.message, matchLoading: false })
        }
    },

    // ── Skill Gap ─────────────────────────────────────────────────────
    selectedJob: null,
    skillGap: null,
    skillGapLoading: false,

    selectJob: (job) => set({ selectedJob: job }),

    analyzeGap: async (requiredSkills) => {
        const { profile } = get()
        set({ skillGapLoading: true })
        try {
            const seekerSkills = profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
            const data = await analyzeSkillGap(seekerSkills, requiredSkills)
            set({ skillGap: data, skillGapLoading: false })
        } catch {
            set({ skillGapLoading: false })
        }
    },

    // ── AI Advisor Chat ───────────────────────────────────────────────
    chatMessages: [
        {
            role: 'assistant',
            content:
                'Halo! 👋 Saya asisten karier AI KerjaCerdas. Saya bisa membantu kamu dengan:\n\n' +
                '• **Saran karier** yang sesuai dengan skill kamu\n' +
                '• **Tips CV** untuk pasar kerja Indonesia\n' +
                '• **Negosiasi gaji** dan benchmark salary\n' +
                '• **Roadmap belajar** untuk skill yang dibutuhkan\n\n' +
                'Silakan ceritakan tentang diri kamu atau tanyakan apa saja! 😊',
        },
    ],
    chatInput: '',
    chatLoading: false,

    setChatInput: (val) => set({ chatInput: val }),

    sendMessage: async () => {
        const { chatInput, chatMessages, profile } = get()
        if (!chatInput.trim()) return

        const userMsg = { role: 'user', content: chatInput }
        set({
            chatMessages: [...chatMessages, userMsg],
            chatInput: '',
            chatLoading: true,
        })

        try {
            const seekerProfile = {
                ...profile,
                skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
            }
            const data = await getCareerAdvice(chatInput, seekerProfile, chatMessages)
            const assistantMsg = { role: 'assistant', content: data.response }
            set((s) => ({
                chatMessages: [...s.chatMessages, assistantMsg],
                chatLoading: false,
            }))
        } catch {
            const errorMsg = {
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silakan coba lagi. 🙏',
            }
            set((s) => ({
                chatMessages: [...s.chatMessages, errorMsg],
                chatLoading: false,
            }))
        }
    },

    // ── API Status ────────────────────────────────────────────────────
    apiStatus: 'unknown',
    setApiStatus: (status) => set({ apiStatus: status }),
}))

export default useStore
