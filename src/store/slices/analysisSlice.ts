import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HarEntry } from '@/lib/parser/types';

interface AnalysisState {
  isAnalyzing: boolean;
  progress: {
    progress: number;
    message: string;
  };
  harEntries: HarEntry[];
  currentPage: number;
  requestsPerPage: number;
}

const initialState: AnalysisState = {
  isAnalyzing: false,
  progress: {
    progress: 0,
    message: '',
  },
  harEntries: [],
  currentPage: 1,
  requestsPerPage: 50,
};

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setAnalysisState: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload;
    },
    setAnalysisProgress: (state, action: PayloadAction<{ progress: number, message: string }>) => {
      state.progress = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setHarEntries: (state, action: PayloadAction<HarEntry[]>) => {
      state.harEntries = action.payload;
    },
  },
});

export const { setAnalysisState, setAnalysisProgress, setCurrentPage, setHarEntries } = analysisSlice.actions;
export default analysisSlice.reducer;