
import React, { useState, useEffect } from 'react';
import { AppState, User, Task, Category, UserRole } from './types';
import { loadState, saveState } from './services/storage';
import { hashPassword } from './utils/security';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { UserManagement } from './components/UserManagement';
import { Reports } from './components/Reports';
import { Loader2, Database } from 'lucide-react';

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
        const state = await loadState();
        const inputHash = await hashPassword(password);
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
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
           <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Database className="text-white" size={32} />
           </div>
           <h1 className="text-3xl font-bold text-slate-900">Gestor OM</h1>
           <p className="text-slate-500 mt-2">Acesso Seguro ao Banco de Dados</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center font-medium border border-red-100">{error}</div>}
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
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-all font-bold shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Sistema'}
          </button>
        </form>
        <div className="mt-8 text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Banco Local Online
           </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  // Inicialização assíncrona do Banco de Dados
  useEffect(() => {
    const initApp = async () => {
      const data = await loadState();
      setState(data);
      setIsLoading(false);
    };
    initApp();
  }, []);

  // Persistência automática no banco sempre que o estado mudar
  useEffect(() => {
    if (state) {
      saveState(state);
    }
  }, [state]);

  const handleLogin = (user: User) => {
    setState(prev => prev ? ({ ...prev, currentUser: user }) : null);
    if (user.role === UserRole.MANAGER || user.role === UserRole.ADMIN) {
        setCurrentView('dashboard');
    } else {
        setCurrentView('tasks');
    }
  };

  const handleLogout = () => {
    setState(prev => prev ? ({ ...prev, currentUser: null }) : null);
  };

  const handleAddTask = (task: Task) => {
    setState(prev => prev ? ({ ...prev, tasks: [...prev.tasks, task] }) : null);
  };

  const handleAddTasks = (newTasks: Task[]) => {
    setState(prev => prev ? ({ ...prev, tasks: [...prev.tasks, ...newTasks] }) : null);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setState(prev => prev ? ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }) : null);
  };

  const handleDeleteTask = (taskId: string) => {
    setState(prev => prev ? ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }) : null);
  };

  const handleClearAllTasks = () => {
    setState(prev => prev ? ({ ...prev, tasks: [] }) : null);
  };

  const handleAddCategory = (category: Category) => {
    setState(prev => prev ? ({ ...prev, categories: [...prev.categories, category] }) : null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setState(prev => prev ? ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== categoryId)
    }) : null);
  };

  const handleAddUser = (user: User) => {
    setState(prev => prev ? ({ ...prev, users: [...prev.users, user] }) : null);
  };

  const handleDeleteUser = (userId: string) => {
    setState(prev => prev ? ({ ...prev, users: prev.users.filter(u => u.id !== userId) }) : null);
  };

  // Splash Screen de Carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
          <Database className="text-blue-500 mb-4 animate-bounce" size={48} />
          <h2 className="text-xl font-bold tracking-widest uppercase">Inicializando Banco</h2>
          <div className="mt-4 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-progress-bar"></div>
          </div>
          <style>{`
            @keyframes progress-bar {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 100%; }
            }
            .animate-progress-bar {
              animation: progress-bar 2s ease-in-out infinite;
            }
          `}</style>
      </div>
    );
  }

  if (!state?.currentUser) {
    return <LoginComponent onLogin={handleLogin} />;
  }

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
      {currentView === 'reports' && (isManager || isAdmin) && (
        <Reports tasks={state.tasks} />
      )}
    </Layout>
  );
}
