import { mongoService } from './mongodb';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  gender: 'Men' | 'Women';
  sizes: number[];
  leatherSqfPerPair: number;
  leatherType: string;
  bucklePerPair: number;
  buckleType: string;
  footbedPerPair: number;
  footbedType: string;
  footbedSpecs?: { euSize: number; type: string; qty: number }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getProducts(): Promise<Product[]> {
  try {
    return await mongoService.findMany<Product>('products', { isActive: true });
  } catch {
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await mongoService.findOne<Product>('products', { _id: id });
  } catch {
    return null;
  }
}

export async function createProduct(
  data: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Product | null> {
  try {
    const now = new Date().toISOString();
    return await mongoService.insertOne<Product>('products', {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    return null;
  }
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, '_id' | 'createdAt'>>
): Promise<boolean> {
  try {
    await mongoService.updateOne('products', { _id: id }, {
      $set: { ...data, updatedAt: new Date().toISOString() },
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  return updateProduct(id, { isActive: false });
}
