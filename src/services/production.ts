import { mongoService } from './mongodb';
import { getDateRange } from '@/utils/dateHelpers';

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

export interface ProductionFilter {
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

    void page; // Client-side pagination

    if (filter.workerId) {
      dbFilter.workerId = filter.workerId;
    }

    let startDate = filter.startDate;
    let endDate = filter.endDate;

    if (!startDate && !endDate && filter.period) {
      const range = getDateRange(filter.period);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    if (startDate && endDate) {
      if (startDate === endDate) {
        dbFilter.logDate = startDate;
      } else {
        dbFilter.logDate = { $gte: startDate, $lte: endDate };
      }
    } else if (startDate) {
      dbFilter.logDate = { $gte: startDate };
    }

    const logs = await mongoService.findMany<ProductionLog>('production_logs', dbFilter, {
      sort: { timestamp: -1 as const },
      limit: Math.max(limit, 200),
    });

    const total = await mongoService.countDocuments('production_logs', dbFilter);

    return { logs, total };
  } catch {
    return { logs: [], total: 0 };
  }
}

export async function getWorkerPerformance(
  startDate: string,
  endDate?: string
): Promise<{ workerId: string; workerName: string; totalPairs: number }[]> {
  try {
    const dbFilter: Record<string, unknown> = {};
    if (startDate && endDate) {
      if (startDate === endDate) {
        dbFilter.logDate = startDate;
      } else {
        dbFilter.logDate = { $gte: startDate, $lte: endDate };
      }
    } else if (startDate) {
      dbFilter.logDate = startDate;
    }

    const logs = await mongoService.findMany<ProductionLog>('production_logs', dbFilter);
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
  startDate: string,
  endDate?: string
): Promise<{ productName: string; sku: string; totalPairs: number }[]> {
  try {
    const dbFilter: Record<string, unknown> = {};
    if (startDate && endDate) {
      if (startDate === endDate) {
        dbFilter.logDate = startDate;
      } else {
        dbFilter.logDate = { $gte: startDate, $lte: endDate };
      }
    } else if (startDate) {
      dbFilter.logDate = startDate;
    }

    const logs = await mongoService.findMany<ProductionLog>('production_logs', dbFilter);
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
