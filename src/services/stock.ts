import { mongoService } from './mongodb';

export interface FootbedEntry {
  gender: 'Men' | 'Women';
  euSize: number;
  type: string;
  qty: number;
}

export interface Stock {
  _id: string;
  leatherSqf: number;
  leatherType: string;
  leathers?: { type: string; qty: number }[];
  buckleQty: number;
  buckleType: string;
  buckles?: { type: string; qty: number }[];
  footbeds: FootbedEntry[];
  thresholds: {
    leatherSqf: number;
    buckleQty: number;
    footbedQty: number;
  };
  lastUpdated: string;
}

export interface StockLog {
  _id: string;
  type: 'add' | 'deduct';
  material: 'leather' | 'buckle' | 'footbed';
  materialType: string;
  quantity: number;
  unit: string;
  reason: string;
  supplierName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  supplierContact?: string;
  footbedGender?: 'Men' | 'Women';
  footbedEuSize?: number;
  updatedBy: string;
  updatedByName: string;
  timestamp: string;
}

export async function getStock(): Promise<Stock | null> {
  try {
    return await mongoService.findOne<Stock>('stock', {});
  } catch {
    return null;
  }
}

interface AddStockParams {
  material: 'leather' | 'buckle' | 'footbed';
  materialType?: string;
  footbedGender?: 'Men' | 'Women';
  footbedEuSize?: number;
}

interface SupplierDetails {
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierContact?: string;
}

export async function addStock(
  quantity: number,
  updatedBy: string,
  updatedByName: string,
  params: AddStockParams,
  supplierDetails?: SupplierDetails
): Promise<boolean> {
  try {
    const stock = await mongoService.findOne<Stock>('stock', {});
    if (!stock) return false;

    const { material, materialType, footbedGender, footbedEuSize } = params;

    switch (material) {
      case 'leather': {
        const existingLeathers = stock.leathers || [];
        const leatherIndex = existingLeathers.findIndex((l: any) => l.type === (materialType || 'Nubuck'));
        if (leatherIndex >= 0) {
          await mongoService.updateOne('stock', { _id: stock._id }, {
            $inc: {
              leatherSqf: quantity,
              [`leathers.${leatherIndex}.qty`]: quantity,
            },
            $set: { leatherType: materialType || 'Nubuck', lastUpdated: new Date().toISOString() },
          });
        } else {
          await mongoService.updateOne('stock', { _id: stock._id }, {
            $inc: { leatherSqf: quantity },
            $push: { leathers: { type: materialType || 'Nubuck', qty: quantity } },
            $set: { leatherType: materialType || 'Nubuck', lastUpdated: new Date().toISOString() },
          });
        }
        break;
      }
      case 'buckle': {
        const existingBuckles = stock.buckles || [];
        const buckleIndex = existingBuckles.findIndex((b: any) => b.type === (materialType || 'Brass Buckle'));
        if (buckleIndex >= 0) {
          await mongoService.updateOne('stock', { _id: stock._id }, {
            $inc: {
              buckleQty: quantity,
              [`buckles.${buckleIndex}.qty`]: quantity,
            },
            $set: { buckleType: materialType || 'Brass Buckle', lastUpdated: new Date().toISOString() },
          });
        } else {
          await mongoService.updateOne('stock', { _id: stock._id }, {
            $inc: { buckleQty: quantity },
            $push: { buckles: { type: materialType || 'Brass Buckle', qty: quantity } },
            $set: { buckleType: materialType || 'Brass Buckle', lastUpdated: new Date().toISOString() },
          });
        }
        break;
      }
      case 'footbed': {
        const existingFootbeds = stock.footbeds || [];
        const existingIndex = existingFootbeds.findIndex(
          (f) => f.gender === footbedGender && f.euSize === footbedEuSize && f.type === (materialType || 'Standard Footbed')
        );
        if (existingIndex >= 0) {
          await mongoService.updateOne('stock', { _id: stock._id }, {
            $inc: { [`footbeds.${existingIndex}.qty`]: quantity },
            $set: { lastUpdated: new Date().toISOString() },
          });
        } else {
          await mongoService.updateOne('stock', { _id: stock._id }, {
            $push: {
              footbeds: {
                gender: footbedGender,
                euSize: footbedEuSize,
                type: materialType || 'Standard Footbed',
                qty: quantity,
              },
            },
            $set: { lastUpdated: new Date().toISOString() },
          });
        }
        break;
      }
    }

    // Log stock entry
    const stockLogData: Record<string, unknown> = {
      type: 'add',
      material,
      materialType: materialType || null,
      quantity,
      unit: material === 'leather' ? 'sqf' : 'pieces',
      reason: 'manual_add',
      updatedBy,
      updatedByName,
      timestamp: new Date().toISOString(),
    };

    if (material === 'footbed') {
      stockLogData.footbedGender = footbedGender;
      stockLogData.footbedEuSize = footbedEuSize;
    }

    if (supplierDetails) {
      stockLogData.supplierName = supplierDetails.supplierName;
      stockLogData.invoiceNumber = supplierDetails.invoiceNumber.toUpperCase();
      stockLogData.invoiceDate = supplierDetails.invoiceDate;
      stockLogData.supplierContact = supplierDetails.supplierContact || null;
    }

    await mongoService.insertOne('stock_logs', stockLogData);

    return true;
  } catch {
    return false;
  }
}

export async function updateThresholds(
  thresholds: { leatherSqf: number; buckleQty: number; footbedQty: number }
): Promise<boolean> {
  try {
    const stock = await mongoService.findOne<Stock>('stock', {});
    if (!stock) return false;

    await mongoService.updateOne('stock', { _id: stock._id }, {
      $set: { thresholds, lastUpdated: new Date().toISOString() },
    });

    return true;
  } catch {
    return false;
  }
}

export async function getStockLogs(limit = 50): Promise<StockLog[]> {
  try {
    return await mongoService.findMany<StockLog>('stock_logs', {}, {
      sort: { timestamp: -1 as 1 | -1 },
      limit,
    });
  } catch {
    return [];
  }
}
