
import { AppState } from '../types';

const DB_NAME = 'GestorOM_DB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAppState = async (): Promise<AppState | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current_state');

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const saveAppState = async (state: Partial<AppState>): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Não salvamos o usuário logado para manter a segurança da sessão
    const stateToSave = {
      users: state.users,
      categories: state.categories,
      tasks: state.tasks
    };

    const request = store.put(stateToSave, 'current_state');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
