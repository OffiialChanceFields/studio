import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SemanticHarEntry } from '@/lib/parser/types';

export interface Workspace {
  name: string;
  harEntries: SemanticHarEntry[];
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
    setWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.currentWorkspace = action.payload;
    },
    clearWorkspace: (state) => {
      state.currentWorkspace = null;
    },
  },
});

export const { setWorkspace, clearWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
