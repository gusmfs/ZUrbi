import { create } from 'zustand';

export const useProblemStore = create((set) => ({
  problems: [],
  addProblem: (problem) =>
    set((state) => ({
      problems: [...state.problems, { ...problem, id: Date.now(), createdAt: new Date().toISOString() }],
    })),
  updateProblem: (id, updates) =>
    set((state) => ({
      problems: state.problems.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  getProblemById: (id) => {
    const state = useProblemStore.getState();
    return state.problems.find((p) => p.id === id);
  },
  getProblemsByStatus: (status) => {
    const state = useProblemStore.getState();
    return state.problems.filter((p) => p.status === status);
  },
}));

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setUser: (user) => set({ user }),
}));

export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
