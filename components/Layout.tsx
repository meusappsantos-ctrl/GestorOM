import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, Task, TaskStatus } from '../types';
import { LogOut, LayoutDashboard, CheckSquare, Users, FileBarChart, Bell, AlertTriangle, Clock, X, ChevronRight } from 'lucide-react';

interface LayoutProps {
  user: User;
  tasks: Task[];
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

type AlertType = 'overdue' | 'urgent';

interface AlertItem {
  type: AlertType;
  task: Task;
  daysDiff: number;
}

export const Layout: React.FC<LayoutProps> = ({ user, tasks, onLogout, currentView, onNavigate, children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Definição de Permissões de Visualização
  const isManager = user.role === UserRole.MANAGER;
  const isAdmin = user.role === UserRole.ADMIN;
  // Gerente e Admin podem ver Dashboard e Usuários (com restrições internas)
  const canViewDashboard = isManager || isAdmin; 
  const canViewUsers = isManager || isAdmin;
  const canViewReports = isManager; // Apenas gerente vê relatórios completos

  // Fechar notificações ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationRef]);

  // Lógica de Notificações
  const getAlerts = (): AlertItem[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks
      .filter(t => t.status === TaskStatus.PENDING && t.dateMax)
      .map(task => {
        const [y, m, d] = task.dateMax.split('-').map(Number);
        const maxDate = new Date(y, m - 1, d);
        const diffTime = maxDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { type: 'overdue', task, daysDiff: diffDays };
        if (diffDays <= 2) return { type: 'urgent', task, daysDiff: diffDays };
        return null;
      })
      .filter((item): item is AlertItem => item !== null)
      .sort((a, b) => a.daysDiff - b.daysDiff); // Mais atrasadas primeiro
  };

  const alerts = getAlerts();
  const hasAlerts = alerts.length > 0;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleAlertItemClick = (alert: AlertItem) => {
    onNavigate('tasks'); // Redireciona para tarefas
    setShowNotifications(false);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
        currentView === view 
          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const MobileNavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button 
      onClick={() => onNavigate(view)} 
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        currentView === view ? 'text-blue-600' : 'text-slate-500'
      }`}
    >
      <div className={`p-1.5 rounded-full ${currentView === view ? 'bg-blue-50' : ''}`}>
        <Icon size={22} strokeWidth={currentView === view ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-medium mt-0.5">{label}</span>
    </button>
  );

  // Define role label display
  const getRoleLabel = () => {
    if (user.role === UserRole.MANAGER) return 'Gerente';
    if (user.role === UserRole.ADMIN) return 'Administrador';
    return `Executante - Turno ${user.shift}`;
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 fixed h-full z-30 hidden md:flex md:flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="bg-blue-600 text-white p-1 rounded mr-2 text-xs">OM</span>
            Gestor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {getRoleLabel()}
          </p>
        </div>

        <nav className="flex-1 pt-4 space-y-1">
          {canViewDashboard && <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />}
          <NavItem view="tasks" icon={CheckSquare} label="Tarefas" />
          {canViewUsers && <NavItem view="users" icon={Users} label="Usuários" />}
          {canViewReports && <NavItem view="reports" icon={FileBarChart} label="Relatórios" />}
        </nav>

        {/* User Profile Section with Notification Bell */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-slate-700 truncate w-24">{user.name}</p>
                </div>
            </div>
            
            {/* Desktop Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={handleNotificationClick}
                className="text-slate-500 hover:text-blue-600 transition-colors relative p-1"
              >
                <Bell size={20} />
                {hasAlerts && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

               {/* Desktop Notification Dropdown (Upwards) */}
              {showNotifications && (
                <div className="absolute bottom-10 left-full ml-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
                   <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="font-bold text-slate-700 text-sm">Notificações</h4>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{alerts.length}</span>
                   </div>
                   <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {alerts.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-sm">Nenhuma notificação.</div>
                      ) : (
                          alerts.map((alert, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => handleAlertItemClick(alert)}
                                className={`p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                                    alert.type === 'overdue' ? 'bg-red-50/30' : 'bg-orange-50/30'
                                }`}
                              >
                                  <div className={`mt-0.5 shrink-0 ${alert.type === 'overdue' ? 'text-red-500' : 'text-orange-500'}`}>
                                      {alert.type === 'overdue' ? <AlertTriangle size={16} /> : <Clock size={16} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-bold mb-0.5 ${alert.type === 'overdue' ? 'text-red-700' : 'text-orange-700'}`}>
                                          {alert.type === 'overdue' ? 'Tarefa Atrasada' : 'Prazo Próximo'}
                                      </p>
                                      <p className="text-xs text-slate-800 font-medium truncate">{alert.task.description}</p>
                                      <p className="text-[10px] text-slate-500 mt-1">OM: {alert.task.omNumber} • {new Date(alert.task.dateMax).toLocaleDateString()}</p>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-300 mt-2"/>
                              </div>
                          ))
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center shadow-sm h-14">
        <div className="flex items-center">
           <span className="bg-blue-600 text-white text-xs font-bold p-1 rounded mr-2">OM</span>
           <span className="font-bold text-slate-800 text-lg">Gestor</span>
        </div>
        <div className="flex items-center gap-4">
            {/* Mobile Notification Bell */}
            <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className="text-slate-500 relative p-1"
                >
                  <Bell size={22} />
                  {hasAlerts && (
                     <span className="absolute top-0 right-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                     </span>
                  )}
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full">
                  {user.role === UserRole.MANAGER ? 'Gerente' : user.role === UserRole.ADMIN ? 'Admin' : `${user.shift}`}
                </span>
                <button onClick={onLogout} className="text-red-600 p-1">
                  <LogOut size={20}/>
                </button>
            </div>
        </div>
      </div>
      
      {/* Mobile Notification Modal (FullScreenish/Popover) */}
      {showNotifications && (
        <>
            {/* Overlay for Mobile */}
            <div 
                className="fixed inset-0 bg-black/20 z-40 md:hidden" 
                onClick={() => setShowNotifications(false)}
            ></div>
            
            {/* Dropdown for Mobile */}
            <div className="fixed top-14 right-2 w-[90%] max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <Bell size={16} /> Notificações
                    </h4>
                    <div className="flex items-center gap-2">
                         <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{alerts.length}</span>
                         <button onClick={() => setShowNotifications(false)} className="text-slate-400">
                            <X size={18} />
                         </button>
                    </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {alerts.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center">
                            <CheckSquare size={32} className="mb-2 opacity-20" />
                            Tudo em dia!
                        </div>
                    ) : (
                        alerts.map((alert, idx) => (
                            <div 
                            key={idx} 
                            onClick={() => handleAlertItemClick(alert)}
                            className={`p-4 border-b border-slate-50 active:bg-slate-100 transition-colors flex items-start gap-3 ${
                                alert.type === 'overdue' ? 'bg-red-50/20' : 'bg-orange-50/20'
                            }`}
                            >
                                <div className={`mt-0.5 shrink-0 ${alert.type === 'overdue' ? 'text-red-500' : 'text-orange-500'}`}>
                                    {alert.type === 'overdue' ? <AlertTriangle size={18} /> : <Clock size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold mb-1 uppercase tracking-wide ${alert.type === 'overdue' ? 'text-red-700' : 'text-orange-700'}`}>
                                        {alert.type === 'overdue' ? 'Atrasada' : 'Vence em breve'}
                                    </p>
                                    <p className="text-sm text-slate-800 font-semibold leading-tight mb-1">{alert.task.description}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                        <span>OM: {alert.task.omNumber}</span>
                                        <span className={`font-medium ${alert.type === 'overdue' ? 'text-red-600' : 'text-orange-600'}`}>
                                            {new Date(alert.task.dateMax).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-3 md:p-8 mt-14 mb-16 md:mt-0 md:mb-0 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center pb-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] h-16">
         {canViewDashboard && <MobileNavItem view="dashboard" icon={LayoutDashboard} label="Dash" />}
         <MobileNavItem view="tasks" icon={CheckSquare} label="Tarefas" />
         {canViewUsers && <MobileNavItem view="users" icon={Users} label="Usuários" />}
         {canViewReports && <MobileNavItem view="reports" icon={FileBarChart} label="Relatórios" />}
      </div>
    </div>
  );
};