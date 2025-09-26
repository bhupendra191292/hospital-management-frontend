import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Custom hook for performance optimizations
 */
export const usePerformance = () => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  // Track render count
  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    if (import.meta.env.DEV) {
      console.log(`🔄 Component rendered ${renderCountRef.current} times. Time since last render: ${timeSinceLastRender}ms`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    getRenderCount: () => renderCountRef.current,
    resetRenderCount: () => { renderCountRef.current = 0; }
  };
};

/**
 * Debounced value hook
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttled callback hook
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

/**
 * Memoized search function
 */
export const useSearch = (items, searchTerm, searchFields) => {
  return useMemo(() => {
    if (!searchTerm || !items.length) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(term);
      });
    });
  }, [items, searchTerm, searchFields]);
};

/**
 * Memoized filter function
 */
export const useFilter = (items, filters) => {
  return useMemo(() => {
    if (!items.length) return items;

    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true; // No filter applied
        return item[key] === value;
      });
    });
  }, [items, filters]);
};

/**
 * Memoized sort function
 */
export const useSort = (items, sortField, sortDirection) => {
  return useMemo(() => {
    if (!items.length || !sortField) return items;

    return [...items].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (typeof aValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [items, sortField, sortDirection]);
};

/**
 * Memoized pagination function
 */
export const usePagination = (items, currentPage, itemsPerPage) => {
  return useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, items.length),
      totalItems: items.length
    };
  }, [items, currentPage, itemsPerPage]);
};

/**
 * Combined data processing hook
 */
export const useDataProcessing = (items, options = {}) => {
  const {
    searchTerm = '',
    searchFields = [],
    filters = {},
    sortField = '',
    sortDirection = 'asc',
    currentPage = 1,
    itemsPerPage = 10
  } = options;

  // Step 1: Search
  const searchedItems = useSearch(items, searchTerm, searchFields);

  // Step 2: Filter
  const filteredItems = useFilter(searchedItems, filters);

  // Step 3: Sort
  const sortedItems = useSort(filteredItems, sortField, sortDirection);

  // Step 4: Paginate
  const pagination = usePagination(sortedItems, currentPage, itemsPerPage);

  return {
    ...pagination,
    totalFiltered: filteredItems.length,
    totalSearched: searchedItems.length
  };
};

/**
 * Optimized API call hook
 */
export const useOptimizedApiCall = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCallRef = useRef(null);

  const callApi = useCallback(async (...args) => {
    // Cancel previous call if still pending
    if (lastCallRef.current) {
      lastCallRef.current.cancelled = true;
    }

    const currentCall = { cancelled: false };
    lastCallRef.current = currentCall;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);

      if (!currentCall.cancelled) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (!currentCall.cancelled) {
        setError(err);
        setData(null);
      }
    } finally {
      if (!currentCall.cancelled) {
        setLoading(false);
      }
    }
  }, dependencies);

  return { data, loading, error, callApi };
};

/**
 * Memoized component props
 */
export const useMemoizedProps = (props) => {
  return useMemo(() => props, Object.values(props));
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    const totalTime = now - startTimeRef.current;
    lastRenderTimeRef.current = now;

    if (import.meta.env.DEV) {
      console.log(`📊 ${componentName} Performance:`, {
        renderCount: renderCountRef.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        totalTime: `${totalTime}ms`,
        averageRenderTime: `${(totalTime / renderCountRef.current).toFixed(2)}ms`
      });
    }
  });

  return {
    renderCount: renderCountRef.current,
    reset: () => {
      renderCountRef.current = 0;
      startTimeRef.current = Date.now();
      lastRenderTimeRef.current = Date.now();
    }
  };
};

export default {
  usePerformance,
  useDebounce,
  useThrottle,
  useSearch,
  useFilter,
  useSort,
  usePagination,
  useDataProcessing,
  useOptimizedApiCall,
  useMemoizedProps,
  usePerformanceMonitor
};
