import React, { useState, useEffect } from 'react';
import { AppState, User, Task, Category, UserRole } from './types';
import { loadState, saveState } from './services/storage';
import { hashPassword } from './utils/security';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { UserManagement } from './components/UserManagement';
import { Reports } from './components/Reports';

// Inline Login Component for simplicity in file structure
const LoginComponent = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const state = loadState();
        const inputHash = await hashPassword(password);
        
        // Comparação segura via Hash
        const user = state.users.find(u => u.username === username && u.passwordHash === inputHash);
        
        if (user) {
          onLogin(user);
        } else {
          setError('Usuário ou senha inválidos');
        }
    } catch (err) {
        setError('Erro ao processar login');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-slate-900">Gestor OM</h1>
           <p className="text-slate-500 mt-2">Acesso Seguro</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center font-medium">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700">Usuário</label>
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={username} onChange={e => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <input 
              type="password" 
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              value={password} onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-400 border-t pt-4">
           <p>Ambiente Protegido</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>(loadState());
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
    // Gerente e Admin vão para Dashboard, Executante para Tasks
    if (user.role === UserRole.MANAGER || user.role === UserRole.ADMIN) {
        setCurrentView('dashboard');
    } else {
        setCurrentView('tasks');
    }
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const handleAddTask = (task: Task) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
  };

  const handleAddTasks = (newTasks: Task[]) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, ...newTasks] }));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const handleClearAllTasks = () => {
    setState(prev => ({
      ...prev,
      tasks: []
    }));
  };

  const handleAddCategory = (category: Category) => {
    setState(prev => ({ ...prev, categories: [...prev.categories, category] }));
  };

  const handleDeleteCategory = (categoryId: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== categoryId)
    }));
  };

  const handleAddUser = (user: User) => {
    setState(prev => ({ ...prev, users: [...prev.users, user] }));
  };

  const handleDeleteUser = (userId: string) => {
    setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
  };

  if (!state.currentUser) {
    return <LoginComponent onLogin={handleLogin} />;
  }

  // Verifica permissão para acessar a view atual
  const isManager = state.currentUser.role === UserRole.MANAGER;
  const isAdmin = state.currentUser.role === UserRole.ADMIN;
  
  return (
    <Layout 
      user={state.currentUser} 
      tasks={state.tasks}
      onLogout={handleLogout} 
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {currentView === 'dashboard' && (isManager || isAdmin) && (
        <Dashboard tasks={state.tasks} />
      )}
      {currentView === 'tasks' && (
        <TaskList 
          user={state.currentUser}
          tasks={state.tasks} 
          categories={state.categories}
          onAddTask={handleAddTask}
          onAddTasks={handleAddTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onClearAllTasks={handleClearAllTasks}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}
      {currentView === 'users' && (isManager || isAdmin) && (
        <UserManagement 
          users={state.users} 
          currentUser={state.currentUser}
          onAddUser={handleAddUser} 
          onDeleteUser={handleDeleteUser}
        />
      )}
      {currentView === 'reports' && isManager && (
        <Reports tasks={state.tasks} />
      )}
    </Layout>
  );
}