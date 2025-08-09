import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalysisState {
  isAnalyzing: boolean;
  progress: {
    progress: number;
    message: string;
  };
}

const initialState: AnalysisState = {
  isAnalyzing: false,
  progress: {
    progress: 0,
    message: '',
  },
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
  },
});

export const { setAnalysisState, setAnalysisProgress } = analysisSlice.actions;
export default analysisSlice.reducer;
