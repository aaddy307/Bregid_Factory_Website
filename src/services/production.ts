import { mongoService } from './mongodb';

export interface ProductionLog {
  _id: string;
  workerId: string;
  workerName: string;
  productId: string;
  productName: string;
  sku: string;
  gender: 'Men' | 'Women';
  euSize: number;
  quantityPairs: number;
  leatherDeductedSqf: number;
  leatherType: string;
  buckleDeducted: number;
  buckleType: string;
  footbedDeducted: number;
  footbedType: string;
  footbedGender: 'Men' | 'Women';
  footbedEuSize: number;
  timestamp: string;
  logDate: string;
}

interface ProductionFilter {
  period?: 'today' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
  workerId?: string;
}

export async function getProductionLogs(
  filter: ProductionFilter = {},
  page = 1,
  limit = 20
): Promise<{ logs: ProductionLog[]; total: number }> {
  try {
    const dbFilter: Record<string, unknown> = {};

    if (filter.workerId) {
      dbFilter.workerId = filter.workerId;
    }

    // Build date range filter
    if (filter.startDate && filter.endDate) {
      if (filter.startDate === filter.endDate) {
        dbFilter.logDate = filter.startDate;
      } else {
        dbFilter.logDate = { $gte: filter.startDate, $lte: filter.endDate };
      }
    } else if (filter.startDate) {
      dbFilter.logDate = { $gte: filter.startDate };
    }

    // Fetch more data; client-side paginates since backend may not support skip
    const logs = await mongoService.findMany<ProductionLog>('production_logs', dbFilter, {
      sort: { timestamp: -1 as 1 | -1 },
      limit: Math.max(limit, 200),
    });

    const total = await mongoService.countDocuments('production_logs', dbFilter);

    return { logs, total };
  } catch {
    return { logs: [], total: 0 };
  }
}

export async function getWorkerPerformance(
  date: string
): Promise<{ workerId: string; workerName: string; totalPairs: number }[]> {
  try {
    const logs = await mongoService.findMany<ProductionLog>('production_logs', { logDate: date });
    const workerMap = new Map<string, { workerId: string; workerName: string; totalPairs: number }>();

    logs.forEach((log) => {
      const existing = workerMap.get(log.workerId) || {
        workerId: log.workerId,
        workerName: log.workerName,
        totalPairs: 0,
      };
      existing.totalPairs += log.quantityPairs;
      workerMap.set(log.workerId, existing);
    });

    return Array.from(workerMap.values());
  } catch {
    return [];
  }
}

export async function getProductBreakdown(
  date: string
): Promise<{ productName: string; sku: string; totalPairs: number }[]> {
  try {
    const logs = await mongoService.findMany<ProductionLog>('production_logs', { logDate: date });
    const productMap = new Map<string, { productName: string; sku: string; totalPairs: number }>();

    logs.forEach((log) => {
      const existing = productMap.get(log.productId) || {
        productName: log.productName,
        sku: log.sku,
        totalPairs: 0,
      };
      existing.totalPairs += log.quantityPairs;
      productMap.set(log.productId, existing);
    });

    return Array.from(productMap.values());
  } catch {
    return [];
  }
}
