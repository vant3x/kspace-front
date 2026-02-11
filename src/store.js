import { create } from 'zustand'

export const useStore = create((set) => ({
  isUnlocked: false, // Start locked. In dev, we can set this to true if needed, but user asked for logic.
  setIsUnlocked: (val) => set({ isUnlocked: val }),

  // Navigation State for 3D Camera
  activeSection: 'home',
  setActiveSection: (section) => set({ activeSection: section }),

  // Transition State
  isWarping: false,
  setIsWarping: (val) => set({ isWarping: val }),

  isPlaying: false,
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  currentTrackIndex: 0,
  tracks: [
    { title: "Medusa", src: "/music/songs/Amantina-Medusa.mp3", artist: "Amantina" },
    { title: "Cornfield Chase", src: "/music/songs/Cornfield Chase-hans-zimmer.mp4", artist: "Hans Zimmer" },
    { title: "Noche De Arreboles", src: "/music/songs/Joe-Arroyo - Noche-De-Arreboles.mp3", artist: "Joe Arroyo" },
    { title: "I Wanna Be Yours", src: "/music/songs/IWannaBeYours.mp3", artist: "Arctic Monkeys" },
    { title: "Simply Falling", src: "/music/songs/Simply Falling - Iyeoka.mp3", artist: "Iyeoka" },
    { title: "Stay", src: "/music/songs/Stay-hans-zimmer.mp3", artist: "Hans Zimmer" },
    { title: "Señales", src: "/music/songs/senales.mp3", artist: "Planeta No" },
  ],
  setTrack: (index) => set({ currentTrackIndex: index }),
  nextTrack: () => set((state) => ({
    currentTrackIndex: (state.currentTrackIndex + 1) % state.tracks.length
  })),
  prevTrack: () => set((state) => ({
    currentTrackIndex: (state.currentTrackIndex - 1 + state.tracks.length) % state.tracks.length
  })),
}))
