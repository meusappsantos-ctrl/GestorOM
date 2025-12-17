import { AppState, User, UserRole, Shift, Task, Category, TaskStatus } from '../types';
import { DEFAULT_PASSWORD_HASH } from '../utils/security';

const STORAGE_KEY = 'gestor_tarefas_db_v4'; // V4 para forçar recriação com hashes

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

export const loadState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_DATA;
  try {
    const parsed = JSON.parse(stored);
    
    // Verificação de integridade básica
    if (!parsed.users || !Array.isArray(parsed.users)) {
        return INITIAL_DATA;
    }

    // Garante que o gerente padrão exista
    if (!parsed.users.find((u: User) => u.role === UserRole.MANAGER)) {
      parsed.users.push(DEFAULT_MANAGER);
    }
    
    return { ...INITIAL_DATA, ...parsed, currentUser: null }; // Reset session on reload
  } catch (e) {
    return INITIAL_DATA;
  }
};

export const saveState = (state: AppState) => {
  // Removemos currentUser do salvamento para não persistir sessão se não necessário
  const stateToSave = {
    users: state.users,
    categories: state.categories,
    tasks: state.tasks
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
};