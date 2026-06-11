import { mongoService } from './mongodb';
import { User } from '@/store/authStore';
import { hashAndSetPassword } from './auth';

interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'manager' | 'worker';
  dailyTarget?: number;
  password: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    return await mongoService.findMany<User>('users', {}, {
      sort: { name: 1 as 1 | -1 },
    });
  } catch {
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    return await mongoService.findOne<User>('users', { _id: id });
  } catch {
    return null;
  }
}

export async function createUser(
  input: CreateUserInput,
  createdBy: string
): Promise<User | null> {
  try {
    const now = new Date().toISOString();
    const user = await mongoService.insertOne<User>('users', {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: input.role,
      dailyTarget: input.role === 'worker' ? input.dailyTarget || 0 : 0,
      isActive: true,
      createdAt: now,
      createdBy,
    });

    if (user && user._id) {
      await hashAndSetPassword(user._id, input.password);
    }

    return user;
  } catch {
    return null;
  }
}

export async function updateUser(
  id: string,
  data: Partial<Omit<User, '_id' | 'createdAt' | 'createdBy'>>
): Promise<boolean> {
  try {
    await mongoService.updateOne('users', { _id: id }, { $set: data });
    return true;
  } catch {
    return false;
  }
}

export async function deactivateUser(id: string): Promise<boolean> {
  return updateUser(id, { isActive: false });
}

export async function activateUser(id: string): Promise<boolean> {
  return updateUser(id, { isActive: true });
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const result = await mongoService.deleteOne('users', { _id: id });
    await mongoService.deleteOne('sessions', { userId: id });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

export async function resetUserPassword(id: string, newPassword: string): Promise<boolean> {
  try {
    return await hashAndSetPassword(id, newPassword);
  } catch {
    return false;
  }
}

export async function setWorkerTarget(workerId: string, target: number): Promise<boolean> {
  return updateUser(workerId, { dailyTarget: target });
}
