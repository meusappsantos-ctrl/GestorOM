
import { AppState, User, UserRole } from '../types';
import { DEFAULT_PASSWORD_HASH } from '../utils/security';
import { getAppState, saveAppState } from './database';

const DEFAULT_MANAGER: User = {
  id: 'manager-1',
  name: 'Rafael',
  username: 'rafael',
  passwordHash: DEFAULT_PASSWORD_HASH, // Hash de '123'
  role: UserRole.MANAGER
};

const INITIAL_DATA: AppState = {
  users: [DEFAULT_MANAGER],
  categories: [],
  tasks: [],
  currentUser: null
};

export const loadState = async (): Promise<AppState> => {
  try {
    const stored = await getAppState();
    if (!stored) {
      // Se não houver dados, salva o estado inicial (com o gerente padrão)
      await saveAppState(INITIAL_DATA);
      return INITIAL_DATA;
    }

    // Garante que o gerente padrão exista
    if (!stored.users.find((u: User) => u.role === UserRole.MANAGER)) {
      stored.users.push(DEFAULT_MANAGER);
    }
    
    return { ...INITIAL_DATA, ...stored, currentUser: null };
  } catch (e) {
    console.error("Erro ao carregar banco de dados:", e);
    return INITIAL_DATA;
  }
};

export const saveState = async (state: AppState) => {
  try {
    await saveAppState(state);
  } catch (e) {
    console.error("Erro ao salvar no banco de dados:", e);
  }
};
