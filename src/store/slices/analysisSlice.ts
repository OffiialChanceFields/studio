import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalysisState {
  isAnalyzing: boolean;
  progress: {
    progress: number;
    message: string;
  };
  currentPage: number;
  requestsPerPage: number;
}

const initialState: AnalysisState = {
  isAnalyzing: false,
  progress: {
    progress: 0,
    message: '',
  },
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
  },
});

export const { setAnalysisState, setAnalysisProgress, setCurrentPage } = analysisSlice.actions;
export default analysisSlice.reducer;
