import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isDetailModalOpen: boolean;
  selectedEntryIndex: number | null;
}

const initialState: UiState = {
  isDetailModalOpen: false,
  selectedEntryIndex: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openDetailModal: (state, action: PayloadAction<number>) => {
      state.isDetailModalOpen = true;
      state.selectedEntryIndex = action.payload;
    },
    closeDetailModal: (state) => {
      state.isDetailModalOpen = false;
      state.selectedEntryIndex = null;
    },
  },
});

export const { openDetailModal, closeDetailModal } = uiSlice.actions;
export default uiSlice.reducer;
