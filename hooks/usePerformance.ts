import { useEffect, useRef, useCallback, useMemo } from 'react';

// Interface segregation for performance metrics
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceConfig {
  enabled?: boolean;
  threshold?: number;
  onMetric?: (metric: PerformanceMetric) => void;
  onThresholdExceeded?: (metric: PerformanceMetric) => void;
}

interface PerformanceState {
  metrics: PerformanceMetric[];
  isMonitoring: boolean;
  averageMetrics: Record<string, number>;
}

/**
 * Enhanced Performance Monitoring Hook
 * 
 * Features:
 * - Real-time performance monitoring
 * - Custom metrics tracking
 * - Threshold-based alerts
 * - Performance optimization insights
 * - Memory usage tracking
 * 
 * @param config - Performance monitoring configuration
 * @returns Performance monitoring state and utilities
 */
export const usePerformance = (config: PerformanceConfig = {}) => {
  const {
    enabled = true,
    threshold = 1000, // 1 second threshold
    onMetric,
    onThresholdExceeded,
  } = config;

  const metricsRef = useRef<PerformanceMetric[]>([]);
  const isMonitoringRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (!enabled) return;
    
    isMonitoringRef.current = true;
    startTimeRef.current = performance.now();
    
    console.log('🚀 Performance monitoring started');
  }, [enabled]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    if (!enabled) return;
    
    isMonitoringRef.current = false;
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    console.log(`⏱️ Performance monitoring stopped. Duration: ${duration.toFixed(2)}ms`);
  }, [enabled]);

  // Add custom metric
  const addMetric = useCallback((name: string, value: number, unit: string = 'ms', metadata?: Record<string, any>) => {
    if (!enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    metricsRef.current.push(metric);
    onMetric?.(metric);

    // Check threshold
    if (value > threshold) {
      onThresholdExceeded?.(metric);
      console.warn(`⚠️ Performance threshold exceeded: ${name} = ${value}${unit}`);
    }
  }, [enabled, threshold, onMetric, onThresholdExceeded]);

  // Measure function execution time
  const measureFunction = useCallback(async <T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      addMetric(name, duration, 'ms', metadata);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      addMetric(`${name}_error`, duration, 'ms', { ...metadata, error: error.message });
      throw error;
    }
  }, [addMetric]);

  // Get memory usage
  const getMemoryUsage = useCallback((): PerformanceMetric | null => {
    if (!enabled || !('memory' in performance)) return null;

    const memory = (performance as any).memory;
    const metric: PerformanceMetric = {
      name: 'memory_usage',
      value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
      unit: 'MB',
      timestamp: Date.now(),
      metadata: {
        total: memory.totalJSHeapSize / 1024 / 1024,
        limit: memory.jsHeapSizeLimit / 1024 / 1024,
      },
    };

    return metric;
  }, [enabled]);

  // Get performance metrics
  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
    console.log('🧹 Performance metrics cleared');
  }, []);

  // Calculate average metrics
  const averageMetrics = useMemo(() => {
    const averages: Record<string, number> = {};
    const groupedMetrics: Record<string, number[]> = {};

    // Group metrics by name
    metricsRef.current.forEach(metric => {
      if (!groupedMetrics[metric.name]) {
        groupedMetrics[metric.name] = [];
      }
      groupedMetrics[metric.name].push(metric.value);
    });

    // Calculate averages
    Object.entries(groupedMetrics).forEach(([name, values]) => {
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      averages[name] = average;
    });

    return averages;
  }, [metricsRef.current]);

  // Monitor component render performance
  const useRenderPerformance = useCallback((componentName: string) => {
    const renderStartTime = useRef<number>(0);
    const renderCount = useRef<number>(0);

    useEffect(() => {
      renderStartTime.current = performance.now();
      renderCount.current++;

      return () => {
        const renderDuration = performance.now() - renderStartTime.current;
        addMetric(`${componentName}_render`, renderDuration, 'ms', {
          renderCount: renderCount.current,
        });
      };
    });
  }, [addMetric]);

  // Monitor memory usage periodically
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const memoryMetric = getMemoryUsage();
      if (memoryMetric) {
        addMetric('memory_usage', memoryMetric.value, memoryMetric.unit, memoryMetric.metadata);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [enabled, getMemoryUsage, addMetric]);

  // Monitor long tasks
  useEffect(() => {
    if (!enabled || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'longtask') {
          addMetric('long_task', entry.duration, 'ms', {
            startTime: entry.startTime,
            name: entry.name,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  }, [enabled, addMetric]);

  return {
    // State
    metrics: getMetrics(),
    isMonitoring: isMonitoringRef.current,
    averageMetrics,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    addMetric,
    measureFunction,
    getMemoryUsage,
    getMetrics,
    clearMetrics,
    useRenderPerformance,
  };
};

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function with performance tracking
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    performanceHook?: ReturnType<typeof usePerformance>
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (performanceHook) {
          performanceHook.measureFunction('debounced_function', () => func(...args));
        } else {
          func(...args);
        }
      }, wait);
    };
  },

  // Throttle function with performance tracking
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    performanceHook?: ReturnType<typeof usePerformance>
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        if (performanceHook) {
          performanceHook.measureFunction('throttled_function', () => func(...args));
        } else {
          func(...args);
        }
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memoize expensive calculations
  memoize: <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
};
