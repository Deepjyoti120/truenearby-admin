import { memoryStorage, StorageEngine } from 'multer';
export const memoryFileStorage: StorageEngine = memoryStorage();
