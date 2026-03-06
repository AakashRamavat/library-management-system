import { create } from 'zustand';
import { api } from '../api/client';
import { useAuthStore } from './authStore';

export interface BookHolder {
  id: string;
  email: string;
  name: string | null;
  memberId: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  status: 'AVAILABLE' | 'CHECKED_OUT';
  holderId: string | null;
  holder: BookHolder | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBooks {
  items: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BooksState {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchBooks: (page?: number, limit?: number) => Promise<void>;
  checkout: (bookIds: string[]) => Promise<void>;
  returnBook: (bookIds: string[]) => Promise<void>;
  clearError: () => void;
}

const DEFAULT_LIMIT = 10;

export const useBooksStore = create<BooksState>((set, get) => ({
  books: [],
  total: 0,
  page: 1,
  limit: DEFAULT_LIMIT,
  totalPages: 0,
  isLoading: false,
  error: null,
  fetchBooks: async (page = 1, limit = DEFAULT_LIMIT) => {
    if (get().isLoading) return;
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      set({ books: [], total: 0, totalPages: 0, error: 'Please log in to view books.' });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await api<PaginatedBooks>(
        `/books?page=${page}&limit=${limit}`,
        { token },
      );
      set({
        books: res.data.items ?? [],
        total: res.data.total ?? 0,
        page: res.data.page ?? 1,
        limit: res.data.limit ?? limit,
        totalPages: res.data.totalPages ?? 0,
        isLoading: false,
        error: null,
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load books',
        isLoading: false,
      });
    }
  },
  checkout: async (bookIds: string[]) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) throw new Error('Not authenticated');
    const { page, limit } = get();
    set({ error: null });
    await api('/books/checkout', {
      method: 'POST',
      body: JSON.stringify({ bookIds }),
      token,
    });
    await get().fetchBooks(page, limit);
  },
  returnBook: async (bookIds: string[]) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) throw new Error('Not authenticated');
    const { page, limit } = get();
    set({ error: null });
    await api('/books/return', {
      method: 'POST',
      body: JSON.stringify({ bookIds }),
      token,
    });
    await get().fetchBooks(page, limit);
  },
  clearError: () => set({ error: null }),
}));
