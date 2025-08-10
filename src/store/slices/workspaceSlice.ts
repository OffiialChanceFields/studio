import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SemanticHarEntry } from '@/lib/parser/types';
import type { DetailedAnalysis } from '@/lib/analyzer/types';

export interface Workspace {
  name: string;
  harEntries: SemanticHarEntry[];
  analysis: DetailedAnalysis | null;
}

interface WorkspaceState {
  currentWorkspace: Workspace | null;
}

const initialState: WorkspaceState = {
  currentWorkspace: null,
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspace: (state, action: PayloadAction<Omit<Workspace, 'analysis'>>) => {
      state.currentWorkspace = { ...action.payload, analysis: null };
    },
    clearWorkspace: (state) => {
      state.currentWorkspace = null;
    },
    setAnalysis: (state, action: PayloadAction<DetailedAnalysis>) => {
      if (state.currentWorkspace) {
        state.currentWorkspace.analysis = action.payload;
      }
    },
  },
});

export const { setWorkspace, clearWorkspace, setAnalysis } = workspaceSlice.actions;
export default workspaceSlice.reducer;
