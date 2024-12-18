import { create } from "zustand"
import { Job } from "./types"

interface JobsState {
  jobs: Job[]
  isLoading: boolean
  error: string | null
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  updateJob: (jobId: string, updates: Partial<Job>) => void
  deleteJob: (jobId: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  isLoading: false,
  error: null,
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, job],
    })),
  updateJob: (jobId, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, ...updates } : job
      ),
    })),
  deleteJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== jobId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})) 