import React, { useState } from 'react';
import { Task, Category, TaskStatus, User, Shift, UserRole } from '../types';
import { Button } from './Button';
import { 
  Upload, AlertCircle, CheckCircle, Clock, FileSpreadsheet, X, Plus, Layers, 
  Trash2, Info, AlertTriangle, Briefcase, CalendarCheck, ListTodo, History, 
  Calendar, Hash, Tag, ArrowRight, Ban, Timer, AlertOctagon, Eye, AlignLeft, ShieldAlert,
  ArrowLeftRight, MapPin, Database, Search, Eraser, ClipboardList, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface TaskListProps {
  user: User;
  tasks: Task[];
  categories: Category[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Task) => void;
  onAddTasks: (tasks: Task[]) => void;
  onDeleteTask: (taskId: string) => void;
  onClearAllTasks: () => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

interface TaskCardProps {
  task: Task;
  categories: Category[];
  canManageStatus: boolean;
  canDelete: boolean;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onViewDetails: (task: Task) => void;
}

// Função auxiliar para calcular status do prazo
const getDeadlineStatus = (dateMaxStr: string) => {
  if (!dateMaxStr) return 'normal';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Ajuste para evitar problemas de fuso horário ao criar a data a partir da string YYYY-MM-DD
  const [y, m, d] = dateMaxStr.split('-').map(Number);
  const maxDate = new Date(y, m - 1, d);
  
  const diffTime = maxDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired'; // Vencido
  if (diffDays <= 3) return 'urgent'; // Vence em 3 dias ou menos
  return 'normal';
};

const PendingTaskCard: React.FC<TaskCardProps> = ({ task, categories, canManageStatus, canDelete, onStatusChange, onDelete, onViewDetails }) => {
  const deadlineStatus = getDeadlineStatus(task.dateMax);
  
  // Estilo base do card
  let cardStyle = "border-slate-200 hover:border-blue-200 hover:shadow-md";
  let stripeColor = "bg-blue-500 group-hover:w-1.5";
  let DeadlineBadge = null;

  if (deadlineStatus === 'expired') {
    cardStyle = "border-red-300 bg-red-50/40 hover:border-red-500 hover:shadow-red-100";
    stripeColor = "bg-red-500 w-1.5";
    DeadlineBadge = (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200 animate-pulse">
        <AlertOctagon size={12} /> Fora do Prazo
      </span>
    );
  } else if (deadlineStatus === 'urgent') {
    cardStyle = "border-orange-300 bg-orange-50/40 hover:border-orange-500 hover:shadow-orange-100";
    stripeColor = "bg-orange-500 w-1.5";
    DeadlineBadge = (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
        <Timer size={12} /> Prazo Próximo
      </span>
    );
  }

  return (
    <div 
      onClick={() => onViewDetails(task)}
      className={`group relative bg-white rounded-xl p-4 shadow-sm border transition-all duration-300 animate-fade-in overflow-hidden cursor-pointer ${cardStyle}`}
    >
      {/* Barra Lateral Colorida */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${stripeColor}`}></div>
      
      <div className="pl-3 flex flex-col md:flex-row gap-4 justify-between items-start">
        <div className="flex-1 space-y-2 w-full">
          {/* Cabeçalho do Card - Nº OM */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1 bg-slate-800 text-white px-2.5 py-1 rounded text-xs font-bold font-mono border border-slate-700 shadow-sm">
               OM: {task.omNumber}
            </span>
            {DeadlineBadge}
          </div>

          {/* Descrição Principal */}
          <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
            {task.description}
          </h3>

          {/* Centro de Trabalho */}
          <div className="flex items-center gap-2 mt-2">
             <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold uppercase tracking-wide">
                <Briefcase size={14} /> 
                {task.workCenter || 'CT Não Informado'}
             </div>
          </div>
        </div>

        {/* Ações */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="w-full md:w-auto md:min-w-[140px] flex flex-col gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-l md:pl-4 md:ml-2"
        >
          {canManageStatus ? (
            <>
              <button 
                type="button"
                onClick={() => onStatusChange(task, TaskStatus.EXECUTED)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors shadow-sm active:transform active:scale-95"
              >
                <CheckCircle size={16} /> Executado
              </button>
              <button 
                type="button"
                onClick={() => onStatusChange(task, TaskStatus.NOT_EXECUTED)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                <Ban size={16} /> Não Executado
              </button>
              {canDelete && (
                <button 
                    type="button"
                    onClick={() => onDelete(task.id)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200 text-xs font-medium py-2 px-3 rounded-lg transition-colors mt-1"
                >
                    <Trash2 size={14} /> Excluir Tarefa
                </button>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
               <span className="w-full text-center text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-3 rounded-lg flex items-center justify-center gap-2">
                  <Eye size={14} /> Visualização
               </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CompletedTaskCard: React.FC<TaskCardProps> = ({ task, categories, canManageStatus, canDelete, onStatusChange, onDelete, onViewDetails }) => {
  const isExecuted = task.status === TaskStatus.EXECUTED;
  
  return (
    <div 
      onClick={() => onViewDetails(task)}
      className={`relative rounded-xl p-4 border transition-all duration-300 cursor-pointer ${
      isExecuted 
        ? 'bg-gradient-to-br from-white to-emerald-50/30 border-emerald-100 shadow-sm hover:shadow-md' 
        : 'bg-gradient-to-br from-white to-rose-50/30 border-rose-100 shadow-sm hover:shadow-md'
    }`}>
      {/* Badge de Status */}
      <div className="absolute top-4 right-4">
        {isExecuted ? (
          <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-full border border-emerald-100">
            <CheckCircle size={12} className="fill-current" /> Executado
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-rose-600 bg-rose-100/50 px-2 py-1 rounded-full border border-rose-100">
            <AlertTriangle size={12} className="fill-current" /> Não Realizado
          </span>
        )}
      </div>

      <div className="pr-24 mb-2"> 
         <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-500 font-bold">OM {task.omNumber}</span>
         </div>
         <h3 className={`text-base font-bold ${isExecuted ? 'text-slate-800' : 'text-slate-700'}`}>
            {task.description}
         </h3>
         <div className="flex items-center gap-1 mt-1 text-xs font-medium text-slate-500">
            <Briefcase size={12} /> {task.workCenter || 'N/A'}
         </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-sm">
        <div className="flex flex-wrap gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                isExecuted 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                : 'bg-rose-50 text-rose-800 border-rose-100'
            }`}>
                <Briefcase size={14} /> Turno {task.executedByShift}
            </div>
        </div>

        {canManageStatus && (
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                 <button 
                    type="button"
                    onClick={() => onStatusChange(task, TaskStatus.PENDING)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                >
                    <History size={12}/> Resetar
                </button>
                 {canDelete && (
                    <button 
                        type="button"
                        onClick={() => onDelete(task.id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium border border-transparent hover:border-red-200 px-2 py-1 rounded transition-colors"
                        title="Excluir Tarefa"
                    >
                        <Trash2 size={14}/> Excluir
                    </button>
                 )}
            </div>
        )}
      </div>
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ 
  user, tasks, categories, onUpdateTask, onAddTask, onAddTasks, onDeleteTask, onClearAllTasks, onAddCategory, onDeleteCategory 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showReasonModal, setShowReasonModal] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showShiftModal, setShowShiftModal] = useState<string | null>(null);

  // New confirmation modals state
  const [showClearModal, setShowClearModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);
  
  const [reasonText, setReasonText] = useState('');
  const [selectedShift, setSelectedShift] = useState<Shift>(Shift.A);
  
  const [showImport, setShowImport] = useState(false);
  // Unused state removed for cleaner code: importMode
  // const [importMode, setImportMode] = useState<'text' | 'file'>('file');
  const [csvText, setCsvText] = useState('');

  // DEFINIÇÃO DE PERMISSÕES
  // Gerente: Pode fazer TUDO (add, delete, import, status)
  const isManager = user.role === UserRole.MANAGER;
  // Admin: Pode mudar status, NÃO PODE excluir, NÃO PODE adicionar (exceto usuarios, que fica em outra tela)
  const isAdmin = user.role === UserRole.ADMIN;
  // Executante: Somente leitura
  const isExecutor = user.role === UserRole.EXECUTOR;

  const canManageStatus = isManager || isAdmin;
  const canEditStructure = isManager; // Adicionar tarefas, categorias, importar, excluir
  const canDelete = isManager; // Só gerente exclui tarefas

  // Extrair Centros de Trabalho Únicos
  const uniqueWorkCenters = React.useMemo(() => {
    const centers = new Set<string>();
    tasks.forEach(t => {
      if (t.workCenter && t.workCenter.trim()) {
        centers.add(t.workCenter.trim());
      }
    });
    return Array.from(centers).sort();
  }, [tasks]);

  // Logic de filtragem combinada (Categoria + Work Center + Busca)
  const filteredTasks = tasks.filter(t => {
    // Filtro de Categoria
    const matchesCategory = selectedCategory === 'all' || t.categoryId === selectedCategory;
    
    // Filtro de Centro de Trabalho
    const matchesWorkCenter = selectedWorkCenter === 'all' || t.workCenter === selectedWorkCenter;

    // Filtro de Busca
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
        t.omNumber.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        (t.workCenter?.toLowerCase() || '').includes(lowerQuery);

    return matchesCategory && matchesWorkCenter && matchesSearch;
  });

  const pendingTasks = filteredTasks.filter(t => t.status === TaskStatus.PENDING);
  const completedTasks = filteredTasks.filter(t => t.status !== TaskStatus.PENDING);

  const currentCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    if (newStatus === TaskStatus.NOT_EXECUTED) {
      setShowReasonModal(task.id);
      setReasonText('');
      setSelectedShift(user.shift || Shift.A);
    } else if (newStatus === TaskStatus.EXECUTED) {
      setSelectedShift(user.shift || Shift.A);
      setShowShiftModal(task.id);
    } else {
      onUpdateTask({
        ...task,
        status: newStatus,
        dateExecuted: undefined,
        reasonNotExecuted: undefined,
        executedByShift: undefined
      });
    }
  };

  const handleReasonSubmit = () => {
    if (!showReasonModal) return;
    const task = tasks.find(t => t.id === showReasonModal);
    if (task) {
      onUpdateTask({
        ...task,
        status: TaskStatus.NOT_EXECUTED,
        reasonNotExecuted: reasonText,
        dateExecuted: new Date().toISOString(),
        executedByShift: selectedShift
      });
    }
    setShowReasonModal(null);
  };

  const handleExecutionSubmit = () => {
    if (!showShiftModal) return;
    const task = tasks.find(t => t.id === showShiftModal);
    if (task) {
      onUpdateTask({
        ...task,
        status: TaskStatus.EXECUTED,
        dateExecuted: new Date().toISOString(),
        executedByShift: selectedShift
      });
    }
    setShowShiftModal(null);
  };

  const handleCreateCategory = () => {
    if(!newCategoryName.trim()) return;
    const newCat = { id: `cat-${Date.now()}`, name: newCategoryName };
    onAddCategory(newCat);
    setNewCategoryName('');
  };

  // --- Handlers para exclusão de Categoria ---
  const initiateCategoryDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Previne seleção da aba
    e.preventDefault();
    setCategoryToDelete({ id, name });
  };

  const confirmCategoryDelete = () => {
    if (categoryToDelete) {
        onDeleteCategory(categoryToDelete.id);
        if (selectedCategory === categoryToDelete.id) {
            setSelectedCategory('all');
        }
        setCategoryToDelete(null);
    }
  };

  // --- Handlers para Limpeza Geral ---
  const initiateClearAll = () => {
      setShowClearModal(true);
  };

  const confirmClearAll = () => {
      onClearAllTasks();
      setShowClearModal(false);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  // --- LÓGICA DE IMPORTAÇÃO ---
  const processImportData = (data: any[]) => {
    const tasksToAdd: Task[] = [];
    const duplicates: Task[] = [];
    const importErrors: string[] = [];
    
    // Normalização robusta
    const normalizeKey = (k: string) => k ? k.toString().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9]/g, "") 
      : '';

    const isSpecificCategory = selectedCategory !== 'all';

    data.forEach((row: any, index: number) => {
      const keys = Object.keys(row);
      
      const omKey = keys.find(k => {
         const n = normalizeKey(k);
         return n === 'nom' || n === 'om' || n === 'numeroom' || n === 'numero';
      });
      
      const descKey = keys.find(k => {
         const n = normalizeKey(k);
         return n === 'descricao' || n === 'desc' || n.includes('descricaodaatividade') || n.includes('atividade'); 
      });

      const wcKey = keys.find(k => {
          const n = normalizeKey(k);
          return n === 'centrodetrabalho' || n === 'ct' || n === 'local' || n === 'setor' || n === 'centro';
      });

      const minKey = keys.find(k => {
         const n = normalizeKey(k);
         return n === 'toleranciaminima' || n === 'tolmin' || n === 'dataminima' || n.includes('datainicio') || n === 'inicio';
      });
      
      const maxKey = keys.find(k => {
         const n = normalizeKey(k);
         return n === 'toleranciamaxima' || n === 'tolmax' || n === 'datamaxima' || n.includes('datafim') || n === 'fim' || n === 'prazo';
      });

      const catKey = keys.find(k => normalizeKey(k).includes('cat') || normalizeKey(k) === 'categoria'); 

      if (!omKey || !descKey) return; 

      const om = String(row[omKey]);
      const desc = String(row[descKey]);
      const wc = wcKey ? String(row[wcKey]) : '';
      
      const formatDate = (val: any) => {
         if (val === null || val === undefined || val === '') return ''; 
         if (typeof val === 'number') {
            const date = new Date((val - 25569) * 86400 * 1000);
            const offset = date.getTimezoneOffset() * 60 * 1000;
            const adjustedDate = new Date(date.getTime() + offset);
            return !isNaN(adjustedDate.getTime()) ? adjustedDate.toISOString().split('T')[0] : '';
         }
         const sVal = String(val).trim();
         if (!sVal) return '';
         const datePart = sVal.split(' ')[0];
         if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) return datePart;
         const match = datePart.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
         if (match) {
             const day = match[1].padStart(2, '0');
             const month = match[2].padStart(2, '0');
             let year = match[3];
             if (year.length === 2) year = '20' + year;
             return `${year}-${month}-${day}`;
         }
         return ''; 
      };

      const rawMin = minKey ? row[minKey] : null;
      const rawMax = maxKey ? row[maxKey] : null;

      const min = rawMin ? formatDate(rawMin) : '';
      const max = rawMax ? formatDate(rawMax) : '';

      if (rawMin && !min) {
        importErrors.push(`Linha ${index + 2}: Data Mínima inválida ("${rawMin}") para a OM ${om}. Formatos aceitos: DD/MM/AAAA ou AAAA-MM-DD.`);
      }
      if (rawMax && !max) {
        importErrors.push(`Linha ${index + 2}: Data Máxima inválida ("${rawMax}") para a OM ${om}. Formatos aceitos: DD/MM/AAAA ou AAAA-MM-DD.`);
      }

      let catId = categories[0]?.id || 'default';
      if (isSpecificCategory) {
        catId = selectedCategory;
      } else if (catKey) {
        const catName = row[catKey];
        if (catName) {
          const foundCat = categories.find(c => c.name.toLowerCase() === String(catName).toLowerCase());
          if (foundCat) catId = foundCat.id;
        }
      }

      const mappedKeys = [omKey, descKey, wcKey, minKey, maxKey, catKey].filter(k => k !== undefined);
      const additionalData: Record<string, any> = {};
      
      keys.forEach(key => {
          if (!mappedKeys.includes(key)) {
              let val = row[key];
              if (normalizeKey(key).includes('data') && typeof val === 'number') {
                   val = formatDate(val);
              }
              additionalData[key] = val;
          }
      });

      const existingTask = tasks.find(t => t.omNumber === om && t.categoryId === catId);

      if (existingTask) {
        duplicates.push({
            ...existingTask, 
            description: desc,
            workCenter: wc,
            dateMin: min,
            dateMax: max,
            additionalData: additionalData,
            status: TaskStatus.PENDING, 
            dateExecuted: undefined,
            executedByShift: undefined,
            reasonNotExecuted: undefined
        });
      } else {
        tasksToAdd.push({
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            omNumber: om,
            description: desc,
            workCenter: wc,
            dateMin: min,
            dateMax: max,
            categoryId: catId,
            status: TaskStatus.PENDING,
            additionalData: additionalData 
        });
      }
    });

    let message = "";
    
    if (importErrors.length > 0) {
        alert(
            `AVISO: Problemas de formatação de data encontrados:\n\n` +
            importErrors.slice(0, 5).join('\n') + 
            (importErrors.length > 5 ? `\n...e mais ${importErrors.length - 5} erros.` : '') +
            `\n\nEssas tarefas serão importadas SEM as datas inválidas.`
        );
    }

    if (tasksToAdd.length > 0) {
        onAddTasks(tasksToAdd);
        message += `Importadas ${tasksToAdd.length} novas tarefas. `;
    }

    if (duplicates.length > 0) {
        const shouldReplace = window.confirm(
            `ATENÇÃO: Foram encontradas ${duplicates.length} tarefas com o mesmo Nº OM na mesma categoria.\n\n` +
            `Deseja SUBSTITUIR estas tarefas e resetar seu status para Pendente?\n\n` +
            `[OK] - Substituir dados antigos\n[Cancelar] - Ignorar duplicatas e manter originais`
        );

        if (shouldReplace) {
            duplicates.forEach(task => onUpdateTask(task));
            message += `\n${duplicates.length} tarefas duplicadas foram atualizadas.`;
        } else {
            message += `\n${duplicates.length} tarefas duplicadas foram ignoradas.`;
        }
    }

    if (message) {
        alert(message);
        setShowImport(false);
        setCsvText('');
    } else if (importErrors.length === 0 && tasksToAdd.length === 0 && duplicates.length === 0) {
        alert("Nenhum dado válido encontrado para importação.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        processImportData(jsonData);
      } catch (error) {
        console.error("Erro ao ler arquivo:", error);
        alert("Erro ao processar o arquivo. Verifique o formato.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; 
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Tarefas</h2>
          <p className="text-slate-500 text-xs md:text-sm">Gerencie e execute as OMs programadas.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 flex items-start">
            <Info className="text-blue-600 mr-2 shrink-0" size={16} />
            <p className="text-xs text-blue-700">
                Você é um Administrador. Você pode gerenciar a execução, mas não pode adicionar/excluir tarefas.
            </p>
        </div>
      )}
      
      {isExecutor && (
        <div className="bg-slate-50 border-l-4 border-slate-400 p-3 flex items-start">
            <Info className="text-slate-600 mr-2 shrink-0" size={16} />
            <p className="text-xs text-slate-700">
                Modo Visualização. Você pode ver as tarefas, mas não pode alterá-las.
            </p>
        </div>
      )}

      {/* Categories / Import Header - APENAS GERENTE PODE ADICIONAR/IMPORTAR */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {canEditStructure && (
          <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                    <span className="text-xs md:text-sm font-medium text-slate-600 shrink-0">
                      <Layers size={14} className="inline mr-1"/> Nova:
                    </span>
                    <input 
                      type="text" 
                      placeholder="Nome categoria..." 
                      className="border rounded p-1.5 text-xs md:text-sm w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                    />
                    <Button type="button" size="sm" onClick={handleCreateCategory} variant="secondary" className="shrink-0">
                      <Plus size={14}/> <span className="hidden sm:inline ml-1">Add</span>
                    </Button>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Botão de Excluir Categoria */}
                    {selectedCategory !== 'all' && (
                        <Button 
                            type="button"
                            variant="danger" 
                            size="sm" 
                            onClick={(e) => initiateCategoryDelete(e, selectedCategory, currentCategoryName || '')}
                            className="shrink-0"
                        >
                            <Trash2 size={14} className="mr-1" /> Excluir <span className="hidden sm:inline">Categoria</span>
                        </Button>
                    )}

                    {/* Botões Globais de Gerente: Limpar Tudo e Importar */}
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-300">
                        <Button 
                            type="button"
                            variant="danger" 
                            size="sm" 
                            onClick={initiateClearAll} 
                            className="shrink-0 bg-red-600 text-white hover:bg-red-700 border-red-600"
                            title="Apagar todas as tarefas do banco de dados"
                        >
                            <Eraser size={14} className="mr-1" /> <span className="hidden sm:inline">Limpar Lista</span><span className="sm:hidden">Limpar</span>
                        </Button>

                        <Button type="button" variant="outline" size="sm" onClick={() => setShowImport(!showImport)} className="shrink-0">
                            <Upload size={14} className="mr-2" /> 
                            {selectedCategory === 'all' ? 'Importar' : 'Importar Nesta'}
                        </Button>
                    </div>
                </div>
            </div>
          </div>
        )}

        <div className="flex overflow-x-auto border-b border-slate-200 px-2 pt-2 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap outline-none flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Todas
          </button>
          {categories.map(c => (
            <div
              key={c.id}
              className={`flex items-center border-b-2 transition-colors whitespace-nowrap outline-none flex-shrink-0 group ${
                selectedCategory === c.id
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              <button 
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-3 text-xs md:text-sm font-medium outline-none ${
                    selectedCategory === c.id ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {c.name}
              </button>
              
              {canEditStructure && (
                <button 
                    type="button"
                    onClick={(e) => initiateCategoryDelete(e, c.id, c.name)}
                    className={`mr-2 p-1.5 rounded-full hover:bg-red-100 text-slate-300 hover:text-red-500 transition-colors ${selectedCategory === c.id ? 'text-blue-300' : ''}`}
                    title="Excluir categoria"
                >
                    <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Barra de Busca e Filtro de Work Center */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Barra de Busca */}
        <div className="relative flex-1">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search size={18} className="text-slate-400" />
           </div>
           <input
             type="text"
             className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
             placeholder="Buscar por Nº OM, Descrição..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
            {searchQuery && (
                <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                    <X size={18} />
                </button>
            )}
        </div>

        {/* Filtro de Centro de Trabalho */}
        <div className="relative md:w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Briefcase size={18} className="text-slate-400" />
           </div>
           <select 
              value={selectedWorkCenter}
              onChange={(e) => setSelectedWorkCenter(e.target.value)}
              className="block w-full pl-10 pr-8 py-3 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm appearance-none cursor-pointer truncate"
           >
              <option value="all">Todos os Centros</option>
              {uniqueWorkCenters.map(wc => (
                  <option key={wc} value={wc}>{wc}</option>
              ))}
           </select>
           <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                <ChevronDown size={16} />
           </div>
        </div>
      </div>

      {/* Import Section - SOMENTE GERENTE */}
      {showImport && canEditStructure && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-slate-200 relative animate-fade-in mb-6">
           <button type="button" onClick={() => setShowImport(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
             <X size={20} />
           </button>
           
           <h3 className="font-bold text-lg mb-2 flex items-center">
             <FileSpreadsheet className="mr-2 text-green-600"/> Importar Tarefas (Excel Completo)
           </h3>
           
           <div className="mb-4 text-xs md:text-sm text-slate-600 flex items-start bg-blue-50 p-3 rounded">
                <Info size={16} className="mr-2 mt-0.5 flex-shrink-0 text-blue-500"/>
                <span>O sistema importará <strong>todas</strong> as colunas do Excel. Colunas não padrões serão exibidas nos detalhes da tarefa.</span>
           </div>

           <div className="space-y-4">
               <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 md:p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                 <input 
                   type="file" 
                   accept=".xlsx, .xls, .csv" 
                   onChange={handleFileUpload}
                   className="hidden" 
                   id="file-upload"
                 />
                 <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload size={28} className="text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Selecione o arquivo Excel</span>
                 </label>
               </div>
               <p className="text-xs text-center text-slate-500">
                  Colunas esperadas para o Card: <strong>Nº OM, Descrição, Centro de Trabalho, Tolerância Mínima/Máxima</strong>.
               </p>
           </div>
        </div>
      )}

      {/* VIEW TABS */}
      <div className="flex items-center w-full border-b border-slate-200 mb-4 bg-white rounded-t-lg shadow-sm">
        <button 
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'pending' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <ListTodo size={16} className="mr-2" />
            Pendentes ({pendingTasks.length})
        </button>
        <button 
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex-1 flex items-center justify-center py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'completed' 
                ? 'border-green-600 text-green-600 bg-green-50/30' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <History size={16} className="mr-2" />
            Histórico ({completedTasks.length})
        </button>
      </div>

      {/* Task List Content */}
      <div className="space-y-3 md:space-y-4 min-h-[300px]">
        {activeTab === 'pending' ? (
            <div className="grid gap-3 md:gap-4">
                {pendingTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">
                        {searchQuery || selectedWorkCenter !== 'all' ? (
                             <Search size={40} className="mb-3 opacity-20"/>
                        ) : (
                             <ListTodo size={40} className="mb-3 opacity-20"/>
                        )}
                        <p className="text-sm">
                            {searchQuery || selectedWorkCenter !== 'all' ? 'Nenhuma tarefa encontrada com os filtros atuais.' : 'Sem tarefas pendentes.'}
                        </p>
                    </div>
                ) : (
                    pendingTasks.map(task => (
                        <PendingTaskCard 
                            key={task.id} 
                            task={task} 
                            categories={categories}
                            canManageStatus={canManageStatus}
                            canDelete={canDelete}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteClick}
                            onViewDetails={setSelectedTask}
                        />
                    ))
                )}
            </div>
        ) : (
            <div className="grid gap-3 md:gap-4">
                {completedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">
                        {searchQuery || selectedWorkCenter !== 'all' ? (
                             <Search size={40} className="mb-3 opacity-20"/>
                        ) : (
                             <History size={40} className="mb-3 opacity-20"/>
                        )}
                        <p className="text-sm">
                            {searchQuery || selectedWorkCenter !== 'all' ? 'Nenhuma tarefa encontrada com os filtros atuais.' : 'Nenhum histórico encontrado.'}
                        </p>
                    </div>
                ) : (
                    completedTasks.map(task => (
                        <CompletedTaskCard 
                            key={task.id} 
                            task={task} 
                            categories={categories}
                            canManageStatus={canManageStatus}
                            canDelete={canDelete}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteClick}
                            onViewDetails={setSelectedTask}
                        />
                    ))
                )}
            </div>
        )}
      </div>

      {/* --- MODAIS DE CONFIRMAÇÃO --- */}

      {/* Modal de Limpar Lista */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-lg p-5 w-[95%] max-w-sm shadow-2xl border-l-4 border-red-600">
            <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center">
                <AlertTriangle className="mr-2" /> Limpar Tudo?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
                Você está prestes a apagar <strong>todas as tarefas</strong>. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowClearModal(false)} size="sm">Cancelar</Button>
                <Button type="button" variant="danger" onClick={confirmClearAll} size="sm">Confirmar Limpeza</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Excluir Categoria */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-lg p-5 w-[95%] max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Categoria?</h3>
            <p className="text-sm text-slate-600 mb-6">
                Tem certeza que deseja excluir a categoria <strong>"{categoryToDelete.name}"</strong>?
                <br/><br/>
                <span className="text-xs text-slate-500 bg-slate-100 p-2 rounded block">
                    Nota: As tarefas vinculadas permanecerão visíveis na aba "Todas".
                </span>
            </p>
            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setCategoryToDelete(null)} size="sm">Cancelar</Button>
                <Button type="button" variant="danger" onClick={confirmCategoryDelete} size="sm">Excluir</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
             {/* Header */}
             <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-start shrink-0">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-xs font-bold font-mono border border-slate-600">
                         OM {selectedTask.omNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                         selectedTask.status === TaskStatus.EXECUTED ? 'bg-green-500 text-white' :
                         selectedTask.status === TaskStatus.NOT_EXECUTED ? 'bg-red-500 text-white' :
                         'bg-blue-500 text-white'
                      }`}>
                         {selectedTask.status === TaskStatus.EXECUTED ? 'Executado' : 
                          selectedTask.status === TaskStatus.NOT_EXECUTED ? 'Não Executado' : 'Pendente'}
                      </span>
                   </div>
                   <h2 className="text-lg font-bold text-white leading-tight">{selectedTask.description}</h2>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
                >
                   <X size={24} />
                </button>
             </div>

             {/* Body Scrollable */}
             <div className="p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
                
                {/* Info Principal */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                         <Briefcase size={12} /> Centro de Trabalho
                      </p>
                      <p className="text-sm font-bold text-slate-800 break-words">
                         {selectedTask.workCenter || 'N/A'}
                      </p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                         <Tag size={12} /> Categoria
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                         {categories.find(c => c.id === selectedTask.categoryId)?.name || 'Geral'}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1 bg-blue-50 p-2 rounded border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
                         <ArrowLeftRight size={12} /> Tol. Mínima
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                         {selectedTask.dateMin ? new Date(selectedTask.dateMin).toLocaleDateString('pt-BR') : '-'}
                      </p>
                   </div>
                   <div className="space-y-1 bg-orange-50 p-2 rounded border border-orange-100">
                      <p className="text-xs font-bold text-orange-600 uppercase flex items-center gap-1">
                         <AlertCircle size={12} /> Tol. Máxima
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                         {selectedTask.dateMax ? new Date(selectedTask.dateMax).toLocaleDateString('pt-BR') : '-'}
                      </p>
                   </div>
                </div>
                
                {/* DADOS ADICIONAIS DO EXCEL */}
                {selectedTask.additionalData && Object.keys(selectedTask.additionalData).length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3 border-b border-slate-200 pb-1">
                             <Database size={16} className="text-blue-500"/> Informações Adicionais
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(selectedTask.additionalData).map(([key, value]) => (
                                <div key={key} className="text-sm border-l-2 border-slate-300 pl-3 py-1">
                                    <span className="block text-xs font-semibold text-slate-500 uppercase">{key}</span>
                                    <span className="block text-slate-800">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status de Execução UNIFICADO */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                   <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
                      <ClipboardList size={16} className="text-blue-600"/> Detalhes da Execução / Status
                   </h4>
                   
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                         <span className="text-slate-500 text-xs block font-bold uppercase mb-1">Turno Execução</span>
                         <span className={`font-medium text-base ${selectedTask.executedByShift ? 'text-slate-800' : 'text-slate-400'}`}>
                            {selectedTask.executedByShift || '-'}
                         </span>
                      </div>
                      <div>
                         <span className="text-slate-500 text-xs block font-bold uppercase mb-1">Data Registro</span>
                         <span className={`font-medium text-base ${selectedTask.dateExecuted ? 'text-slate-800' : 'text-slate-400'}`}>
                            {selectedTask.dateExecuted ? new Date(selectedTask.dateExecuted).toLocaleString('pt-BR') : '-'}
                         </span>
                      </div>
                   </div>

                   <div>
                      <span className="text-slate-500 text-xs block font-bold uppercase mb-1">Motivo Não Execução / Obs</span>
                      <p className={`font-medium p-3 rounded border text-sm ${
                         selectedTask.reasonNotExecuted 
                         ? 'bg-red-50 text-slate-800 border-red-100' 
                         : 'bg-white text-slate-400 border-slate-200 italic'
                      }`}>
                         {selectedTask.reasonNotExecuted || 'Nenhum motivo registrado.'}
                      </p>
                   </div>
                </div>

             </div>

             <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end shrink-0">
                <Button type="button" onClick={() => setSelectedTask(null)}>Fechar</Button>
             </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-lg p-5 w-[95%] max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center">
                <AlertTriangle className="mr-2"/> Não Executar
            </h3>
            
            <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Turno Reportando</label>
                <div className="grid grid-cols-4 gap-2">
                    {[Shift.A, Shift.B, Shift.C, Shift.D].map((shift) => (
                        <button
                            type="button"
                            key={shift}
                            onClick={() => setSelectedShift(shift)}
                            className={`py-2 px-1 rounded font-bold border text-sm transition-all ${
                                selectedShift === shift 
                                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                            {shift}
                        </button>
                    ))}
                </div>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-2">Motivo</label>
            <textarea
              className="w-full border border-slate-300 rounded p-3 mb-4 h-24 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
              placeholder="Descreva o motivo..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            ></textarea>

            <div className="flex justify-end space-x-2 border-t pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowReasonModal(null)} size="sm">Cancelar</Button>
              <Button type="button" variant="danger" onClick={handleReasonSubmit} disabled={!reasonText.trim()} size="sm">Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Selection Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-lg p-5 w-[95%] max-w-sm shadow-2xl">
                <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center">
                    <CheckCircle className="text-green-600 mr-2" /> Confirmar
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                    Qual turno realizou esta atividade?
                </p>
                
                <div className="mb-6 bg-slate-50 p-3 rounded border border-slate-100">
                    <div className="grid grid-cols-4 gap-2">
                        {[Shift.A, Shift.B, Shift.C, Shift.D].map((shift) => (
                            <button
                                type="button"
                                key={shift}
                                onClick={() => setSelectedShift(shift)}
                                className={`py-3 rounded font-bold border transition-all ${
                                    selectedShift === shift 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                {shift}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-2 border-t pt-4">
                    <Button type="button" variant="secondary" onClick={() => setShowShiftModal(null)} size="sm">Cancelar</Button>
                    <Button type="button" variant="success" onClick={handleExecutionSubmit} size="sm">Confirmar</Button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-lg p-5 w-[95%] max-w-sm shadow-2xl border-l-4 border-red-500">
            <div className="flex items-start mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3 shrink-0">
                    <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Excluir?</h3>
                    <p className="text-sm text-slate-600 mt-1">
                        Remover esta OM permanentemente?
                    </p>
                </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <Button type="button" variant="secondary" onClick={() => setTaskToDelete(null)} size="sm">Cancelar</Button>
              <Button type="button" variant="danger" onClick={confirmDelete} size="sm">Excluir</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};