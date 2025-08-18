import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LoliCodeConfig, VariableExtraction } from '@/lib/generator/LoliCodeGenerator';

type GeneratorState = LoliCodeConfig;

const initialState: GeneratorState = {
  selectedIndices: [],
  customHeaders: {},
  customAssertions: {},
  variableExtractions: {},
  settings: {
    useProxy: true,
    followRedirects: true,
    timeout: 10000,
  }
};

export const generatorSlice = createSlice({
  name: 'generator',
  initialState,
  reducers: {
    toggleRequestSelection: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const selectedIndex = state.selectedIndices.indexOf(index);
      if (selectedIndex === -1) {
        state.selectedIndices.push(index);
      } else {
        state.selectedIndices.splice(selectedIndex, 1);
      }
    },
    setSelectedIndices: (state, action: PayloadAction<number[]>) => {
      state.selectedIndices = action.payload;
    },
    addVariableExtraction: (state, action: PayloadAction<{ entryIndex: number; extraction: VariableExtraction }>) => {
      const { entryIndex, extraction } = action.payload;
      if (!state.variableExtractions) {
        state.variableExtractions = {};
      }
      if (!state.variableExtractions[entryIndex]) {
        state.variableExtractions[entryIndex] = [];
      }
      // Avoid adding duplicate extractions
      if (!state.variableExtractions[entryIndex]!.some(e => e.variableName === extraction.variableName)) {
        state.variableExtractions[entryIndex]!.push(extraction);
      }
    },
    updateSettings: (state, action: PayloadAction<Partial<GeneratorState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetGeneratorConfig: () => initialState,
  },
});

export const {
  toggleRequestSelection,
  setSelectedIndices,
  addVariableExtraction,
  updateSettings,
  resetGeneratorConfig,
} = generatorSlice.actions;

export default generatorSlice.reducer;
