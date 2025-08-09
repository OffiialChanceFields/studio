/**
 * @fileoverview Redux slice for filter management
 * @module @/lib/filter
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export type FilterTarget = 
  | 'url-hostname' 
  | 'url-path' 
  | 'url-query'
  | 'request-method' 
  | 'request-header'
  | 'response-status' 
  | 'response-header'
  | 'content-type' 
  | 'token-payload'
  | 'cookie-name'
  | 'cookie-value';

export type FilterOperator = 
  | 'contains' 
  | 'not-contains'
  | 'equals' 
  | 'not-equals'
  | 'starts-with' 
  | 'ends-with'
  | 'regex' 
  | 'greater-than' 
  | 'less-than'
  | 'in-range';

export interface SemanticFilterRule {
  id: string;
  target: FilterTarget;
  operator: FilterOperator;
  value: string;
  caseSensitive: boolean;
  enabled: boolean;
}

export interface FilterState {
  rules: SemanticFilterRule[];
  logic: 'AND' | 'OR';
  isActive: boolean;
}

// Initial state
const initialState: FilterState = {
  rules: [],
  logic: 'AND',
  isActive: true
};

// Redux slice
export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    addRule: (state, action: PayloadAction<Omit<SemanticFilterRule, 'id' | 'enabled' | 'caseSensitive'> & { enabled?: boolean; caseSensitive?: boolean }>) => {
      state.rules.push({
        id: uuidv4(),
        caseSensitive: false,
        enabled: true,
        ...action.payload
      });
    },
    
    updateRule: (state, action: PayloadAction<{
      id: string;
      updates: Partial<Omit<SemanticFilterRule, 'id'>>;
    }>) => {
      const index = state.rules.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.rules[index] = {
          ...state.rules[index],
          ...action.payload.updates
        };
      }
    },
    
    removeRule: (state, action: PayloadAction<string>) => {
      state.rules = state.rules.filter(r => r.id !== action.payload);
    },
    
    toggleRule: (state, action: PayloadAction<string>) => {
      const rule = state.rules.find(r => r.id === action.payload);
      if (rule) {
        rule.enabled = !rule.enabled;
      }
    },
    
    setLogic: (state, action: PayloadAction<'AND' | 'OR'>) => {
      state.logic = action.payload;
    },
    
    toggleFilters: (state) => {
      state.isActive = !state.isActive;
    },
    
    resetFilters: (state) => {
      state.rules = [];
      state.logic = 'AND';
      state.isActive = true;
    },
    
    importRules: (state, action: PayloadAction<SemanticFilterRule[]>) => {
      state.rules = action.payload.map(rule => ({
        ...rule,
        id: uuidv4() // Generate new IDs to avoid conflicts
      }));
    }
  }
});

export const {
  addRule,
  updateRule,
  removeRule,
  toggleRule,
  setLogic,
  toggleFilters,
  resetFilters,
  importRules
} = filterSlice.actions;

export default filterSlice.reducer;
