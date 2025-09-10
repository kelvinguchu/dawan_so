import { create } from 'zustand'

interface SearchState {
  searchTerm: string
  searchField: string
  setSearchTerm: (term: string) => void
  setSearchField: (field: string) => void
  reset: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  searchTerm: '',
  searchField: 'name',
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSearchField: (field) => set({ searchField: field }),
  reset: () => set({ searchTerm: '', searchField: 'name' }),
}))
