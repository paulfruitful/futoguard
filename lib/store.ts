import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  timestamp: number | null
}

interface AlertState {
  isRecording: boolean
  recordingDuration: number
  alertSent: boolean
  currentAlert: any | null
  transcript: string | null
  audioUrl: string | null
  category: string | null
  urgencyScore: string | null
}

interface AppState {
  location: LocationState
  alert: AlertState
  nearbyAlerts: any[]
  userAlerts: any[]

  // Actions
  setLocation: (location: Partial<LocationState>) => void
  setAlertState: (alert: Partial<AlertState>) => void
  addNearbyAlert: (alert: any) => void
  setUserAlerts: (alerts: any[]) => void
  clearAlert: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      location: {
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
      },
      alert: {
        isRecording: false,
        recordingDuration: 0,
        alertSent: false,
        currentAlert: null,
      },
      nearbyAlerts: [],
      userAlerts: [],

      setLocation: (location) =>
        set((state) => ({
          location: { ...state.location, ...location },
        })),

      setAlertState: (alert) =>
        set((state) => ({
          alert: { ...state.alert, ...alert },
        })),

      addNearbyAlert: (alert) =>
        set((state) => ({
          nearbyAlerts: [alert, ...state.nearbyAlerts].slice(0, 50), // Keep last 50
        })),

      setUserAlerts: (alerts) => set({ userAlerts: alerts }),

      clearAlert: () =>
        set({
          alert: {
            isRecording: false,
            recordingDuration: 0,
            alertSent: false,
            currentAlert: null,
          },
        }),
    }),
    {
      name: "futo-guardian-store",
      partialize: (state) => ({
        location: state.location,
        userAlerts: state.userAlerts,
      }),
    },
  ),
)
