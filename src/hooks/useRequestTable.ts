
'use client';

import { useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentPage } from '@/store/slices/analysisSlice';
import type { SemanticHarEntry } from '@/lib/parser/types';

export function useRequestTable(allEntries: SemanticHarEntry[]) {
  const dispatch = useAppDispatch();
  const { currentPage, requestsPerPage } = useAppSelector(state => state.analysis);

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    return allEntries.slice(startIndex, endIndex);
  }, [allEntries, currentPage, requestsPerPage]);

  const totalPages = Math.ceil(allEntries.length / requestsPerPage);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  }, [dispatch, totalPages]);

  return {
    currentPage,
    requestsPerPage,
    totalPages,
    paginatedEntries,
    handlePageChange,
  };
}
