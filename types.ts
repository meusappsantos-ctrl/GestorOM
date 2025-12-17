
export enum UserRole {
  MANAGER = 'manager', // Gerente (Acesso Total)
  ADMIN = 'admin',     // Administrador (Gerencia status e cria executantes)
  EXECUTOR = 'executor' // Executante (Somente visualização)
}

export enum TaskStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  NOT_EXECUTED = 'not_executed'
}

export enum Shift {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D'
}

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // Armazena apenas o Hash SHA-256
  role: UserRole;
  shift?: Shift; // Executors belong to a shift
}

export interface Category {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  omNumber: string;
  description: string;
  categoryId: string;
  workCenter?: string; // Centro de Trabalho
  dateMin: string; // ISO Date string YYYY-MM-DD
  dateMax: string; // ISO Date string YYYY-MM-DD
  status: TaskStatus;
  dateExecuted?: string; // ISO Date string
  reasonNotExecuted?: string;
  executedByShift?: Shift;
  updatedByUserName?: string; // Quem realizou a alteração de status
  additionalData?: Record<string, any>; // Armazena todas as outras colunas do Excel
}

export interface AppState {
  users: User[];
  categories: Category[];
  tasks: Task[];
  currentUser: User | null;
}
