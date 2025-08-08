import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  operationName: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private slowThreshold = 3000; // 3 seconds
  private maxMetrics = 100;

  logOperation(operationName: string, duration: number, success: boolean, error?: string) {
    const metric: PerformanceMetrics = {
      operationName,
      duration,
      timestamp: Date.now(),
      success,
      error,
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > this.slowThreshold) {
      console.warn(`🐌 Slow operation detected: ${operationName} took ${duration}ms`, {
        operation: operationName,
        duration,
        success,
        error,
        timestamp: new Date().toISOString(),
      });
    }

    // Log failed operations
    if (!success) {
      console.error(`❌ Failed operation: ${operationName}`, {
        operation: operationName,
        duration,
        error,
        timestamp: new Date().toISOString(),
      });
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  getSlowOperations() {
    return this.metrics.filter(m => m.duration > this.slowThreshold);
  }

  getFailedOperations() {
    return this.metrics.filter(m => !m.success);
  }

  clear() {
    this.metrics = [];
  }
}

const performanceMonitor = new PerformanceMonitor();

export function usePerformanceMonitor() {
  const timers = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((operationName: string) => {
    timers.current.set(operationName, performance.now());
  }, []);

  const endTimer = useCallback((operationName: string, success: boolean = true, error?: string) => {
    const startTime = timers.current.get(operationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      performanceMonitor.logOperation(operationName, duration, success, error);
      timers.current.delete(operationName);
    }
  }, []);

  const measureOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    startTimer(operationName);
    
    try {
      const result = await operation();
      endTimer(operationName, true);
      return result;
    } catch (error) {
      endTimer(operationName, false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [startTimer, endTimer]);

  const getPerformanceReport = useCallback(() => {
    const metrics = performanceMonitor.getMetrics();
    const slowOperations = performanceMonitor.getSlowOperations();
    const failedOperations = performanceMonitor.getFailedOperations();

    const report = {
      totalOperations: metrics.length,
      slowOperations: slowOperations.length,
      failedOperations: failedOperations.length,
      averageDuration: metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length 
        : 0,
      slowOperationsList: slowOperations,
      failedOperationsList: failedOperations,
    };

    console.group('📊 Performance Report');
    console.log('Total operations:', report.totalOperations);
    console.log('Slow operations:', report.slowOperations);
    console.log('Failed operations:', report.failedOperations);
    console.log('Average duration:', report.averageDuration.toFixed(2), 'ms');
    
    if (report.slowOperationsList.length > 0) {
      console.group('🐌 Slow Operations');
      report.slowOperationsList.forEach(op => {
        console.log(`${op.operationName}: ${op.duration.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
    
    if (report.failedOperationsList.length > 0) {
      console.group('❌ Failed Operations');
      report.failedOperationsList.forEach(op => {
        console.log(`${op.operationName}: ${op.error}`);
      });
      console.groupEnd();
    }
    console.groupEnd();

    return report;
  }, []);

  // Monitor page load performance
  useEffect(() => {
    const measurePageLoad = () => {
      if (performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0] as PerformanceNavigationTiming;
          const loadTime = nav.loadEventEnd - nav.loadEventStart;
          const domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
          
          performanceMonitor.logOperation('Page Load', loadTime, true);
          performanceMonitor.logOperation('DOM Content Loaded', domContentLoaded, true);
          
          console.log('📈 Page Load Performance:', {
            loadTime: `${loadTime.toFixed(2)}ms`,
            domContentLoaded: `${domContentLoaded.toFixed(2)}ms`,
          });
        }
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, []);

  return {
    startTimer,
    endTimer,
    measureOperation,
    getPerformanceReport,
  };
}
