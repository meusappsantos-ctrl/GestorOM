
import React, { useState } from 'react';
import { Task, Category, TaskStatus, User, Shift, UserRole } from '../types';
import { Button } from './Button';
import { 
  Upload, CheckCircle, X, Plus, Layers, 
  Trash2, Info, AlertTriangle, Briefcase, 
  ListTodo, Tag, Ban, Timer, AlertOctagon, Eye, UserCheck, 
  Search, Eraser, ClipboardList, ChevronDown, FileSpreadsheet
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

const getDeadlineInfo = (dateMaxStr: string) => {
  if (!dateMaxStr) return { status: 'normal', days: 0 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateMaxStr.split('-').map(Number);
  const maxDate = new Date(y, m - 1, d);
  const diffTime = maxDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { status: 'expired', days: Math.abs(diffDays) };
  if (diffDays <= 2) return { status: 'urgent', days: diffDays };
  return { status: 'normal', days: diffDays };
};

const PendingTaskCard: React.FC<TaskCardProps> = ({ task, categories, canManageStatus, canDelete, onStatusChange, onDelete, onViewDetails }) => {
  const deadline = getDeadlineInfo(task.dateMax);
  let cardStyle = "border-slate-200 hover:border-blue-200 hover:shadow-md";
  let stripeColor = "bg-blue-500 group-hover:w-1.5";
  let DeadlineBadge = null;

  if (deadline.status === 'expired') {
    cardStyle = "border-red-400 bg-red-50 hover:border-red-600 hover:shadow-red-200 ring-1 ring-red-100";
    stripeColor = "bg-red-600 w-2";
    DeadlineBadge = (
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-red-600 px-2.5 py-1 rounded-md border border-red-700 animate-pulse shadow-sm">
        <AlertOctagon size={14} /> ATRASADA ({deadline.days}d)
      </span>
    );
  } else if (deadline.status === 'urgent') {
    cardStyle = "border-amber-400 bg-amber-50/60 hover:border-amber-600 hover:shadow-amber-200 ring-1 ring-amber-100";
    stripeColor = "bg-amber-600 w-2";
    DeadlineBadge = (
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2.5 py-1 rounded-md border border-amber-400 shadow-sm">
        <Timer size={14} /> VENCE EM {deadline.days === 0 ? 'HOJE' : `${deadline.days}d`}
      </span>
    );
  }

  return (
    <div 
      onClick={() => onViewDetails(task)}
      className={`group relative bg-white rounded-xl p-4 shadow-sm border transition-all duration-300 animate-fade-in overflow-hidden cursor-pointer ${cardStyle}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 transition-all ${stripeColor}`}></div>
      <div className="pl-3 flex flex-col md:flex-row gap-4 justify-between items-start">
        <div className="flex-1 space-y-2 w-full">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1 bg-slate-800 text-white px-2.5 py-1 rounded text-xs font-bold font-mono border border-slate-700 shadow-sm">
               OM: {task.omNumber}
            </span>
            {DeadlineBadge}
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
            {task.description}
          </h3>
          <div className="flex items-center gap-2 mt-2">
             <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold uppercase tracking-wide">
                <Briefcase size={14} /> 
                {task.workCenter || 'CT Não Informado'}
             </div>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="w-full md:w-auto md:min-w-[140px] flex flex-col gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-l md:pl-4 md:ml-2">
          {canManageStatus ? (
            <>
              <button 
                type="button"
                onClick={() => onStatusChange(task, TaskStatus.EXECUTED)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors shadow-sm active:transform active:scale-95"
              >
                <CheckCircle size={16} /> Executado
              </button>
              <button 
                type="button"
                onClick={() => onStatusChange(task, TaskStatus.NOT_EXECUTED)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors"
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

export const TaskList: React.FC<TaskListProps> = ({ user, tasks, categories, onUpdateTask, onAddTask, onAddTasks, onDeleteTask, onClearAllTasks, onAddCategory, onDeleteCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>('all');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showReasonModal, setShowReasonModal] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showShiftModal, setShowShiftModal] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [selectedShift, setSelectedShift] = useState<Shift>(Shift.A);
  const [showImport, setShowImport] = useState(false);
  
  const isManager = user.role === UserRole.MANAGER;
  const isAdmin = user.role === UserRole.ADMIN;
  const canManageStatus = isManager || isAdmin;
  const canEditStructure = isManager;
  const canDelete = isManager;

  const uniqueWorkCenters = React.useMemo(() => {
    const centers = new Set<string>();
    tasks.forEach(t => { if (t.workCenter && t.workCenter.trim()) centers.add(t.workCenter.trim()); });
    return Array.from(centers).sort();
  }, [tasks]);

  const filteredTasks = tasks.filter(t => {
    // Filtro principal: Apenas Pendentes conforme solicitado
    if (t.status !== TaskStatus.PENDING) return false;
    
    const matchesCategory = selectedCategory === 'all' || t.categoryId === selectedCategory;
    const matchesWorkCenter = selectedWorkCenter === 'all' || t.workCenter === selectedWorkCenter;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || t.omNumber.toLowerCase().includes(lowerQuery) || t.description.toLowerCase().includes(lowerQuery) || (t.workCenter?.toLowerCase() || '').includes(lowerQuery);
    return matchesCategory && matchesWorkCenter && matchesSearch;
  });

  const currentCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    if (newStatus === TaskStatus.NOT_EXECUTED) {
      setShowReasonModal(task.id);
      setReasonText('');
      setSelectedShift(user.shift || Shift.A);
    } else if (newStatus === TaskStatus.EXECUTED) {
      setSelectedShift(user.shift || Shift.A);
      setShowShiftModal(task.id);
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
        executedByShift: selectedShift,
        updatedByUserName: user.name
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
        executedByShift: selectedShift,
        updatedByUserName: user.name
      });
    }
    setShowShiftModal(null);
  };

  const handleCreateCategory = () => {
    if(!newCategoryName.trim()) return;
    onAddCategory({ id: `cat-${Date.now()}`, name: newCategoryName });
    setNewCategoryName('');
  };

  const initiateCategoryDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    e.preventDefault();
    setCategoryToDelete({ id, name });
  };

  const confirmCategoryDelete = () => {
    if (categoryToDelete) {
        onDeleteCategory(categoryToDelete.id);
        if (selectedCategory === categoryToDelete.id) setSelectedCategory('all');
        setCategoryToDelete(null);
    }
  };

  const initiateClearAll = () => setShowClearModal(true);
  const confirmClearAll = () => { onClearAllTasks(); setShowClearModal(false); };
  const handleDeleteClick = (taskId: string) => setTaskToDelete(taskId);
  const confirmDelete = () => { if (taskToDelete) { onDeleteTask(taskToDelete); setTaskToDelete(null); } };

  const processImportData = (data: any[]) => {
    const tasksToAdd: Task[] = [];
    const duplicates: Task[] = [];
    const normalizeKey = (k: string) => k ? k.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "") : '';
    const isSpecificCategory = selectedCategory !== 'all';
    
    data.forEach((row: any, index: number) => {
      const keys = Object.keys(row);
      const omKey = keys.find(k => { const n = normalizeKey(k); return n === 'nom' || n === 'om' || n === 'numeroom' || n === 'numero'; });
      const descKey = keys.find(k => { const n = normalizeKey(k); return n === 'descricao' || n === 'desc' || n.includes('descricaodaatividade') || n.includes('atividade'); });
      const wcKey = keys.find(k => { const n = normalizeKey(k); return n === 'centrodetrabalho' || n === 'ct' || n === 'local' || n === 'setor' || n === 'centro'; });
      const minKey = keys.find(k => { const n = normalizeKey(k); return n === 'toleranciaminima' || n === 'tolmin' || n === 'dataminima' || n.includes('datainicio') || n === 'inicio'; });
      const maxKey = keys.find(k => { const n = normalizeKey(k); return n === 'toleranciamaxima' || n === 'tolmax' || n === 'datamaxima' || n.includes('datafim') || n === 'fim' || n === 'prazo'; });
      const catKey = keys.find(k => normalizeKey(k).includes('cat') || normalizeKey(k) === 'categoria'); 
      
      if (!omKey || !descKey) return; 
      const om = String(row[omKey]);
      const desc = String(row[descKey]);
      const wc = wcKey ? String(row[wcKey]) : '';
      
      const formatDate = (val: any) => {
         if (!val) return ''; 
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

      const min = minKey ? formatDate(row[minKey]) : '';
      const max = maxKey ? formatDate(row[maxKey]) : '';
      
      let catId = categories[0]?.id || 'default';
      if (isSpecificCategory) catId = selectedCategory;
      else if (catKey) {
        const catName = row[catKey];
        if (catName) {
          const foundCat = categories.find(c => c.name.toLowerCase() === String(catName).toLowerCase());
          if (foundCat) catId = foundCat.id;
        }
      }

      const additionalData: Record<string, any> = {};
      keys.forEach(key => { if (![omKey, descKey, wcKey, minKey, maxKey, catKey].includes(key)) additionalData[key] = row[key]; });
      
      const existingTask = tasks.find(t => t.omNumber === om && t.categoryId === catId);
      if (existingTask) duplicates.push({ ...existingTask, description: desc, workCenter: wc, dateMin: min, dateMax: max, additionalData: additionalData, status: TaskStatus.PENDING });
      else tasksToAdd.push({ id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, omNumber: om, description: desc, workCenter: wc, dateMin: min, dateMax: max, categoryId: catId, status: TaskStatus.PENDING, additionalData: additionalData });
    });

    if (tasksToAdd.length > 0) onAddTasks(tasksToAdd);
    if (duplicates.length > 0) {
        if (window.confirm(`Substituir ${duplicates.length} tarefas duplicadas?`)) duplicates.forEach(task => onUpdateTask(task));
    }
    setShowImport(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        processImportData(jsonData);
      } catch (error) { alert("Erro ao processar o arquivo."); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; 
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Lista de Tarefas Pendentes</h2>
          <p className="text-slate-500 text-xs md:text-sm">Acompanhamento e execução de OMs abertas.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 flex items-start">
            <Info className="text-blue-600 mr-2 shrink-0" size={16} />
            <p className="text-xs text-blue-700">Modo Administrador: Registro de execuções ativado.</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {canEditStructure && (
          <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                    <span className="text-xs md:text-sm font-medium text-slate-600 shrink-0"><Layers size={14} className="inline mr-1"/> Nova:</span>
                    <input type="text" placeholder="Nome categoria..." className="border rounded p-1.5 text-xs md:text-sm w-full bg-white outline-none" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}/>
                    <Button type="button" size="sm" onClick={handleCreateCategory} variant="secondary" className="shrink-0"><Plus size={14}/></Button>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {selectedCategory !== 'all' && <Button type="button" variant="danger" size="sm" onClick={(e) => initiateCategoryDelete(e, selectedCategory, currentCategoryName || '')} className="shrink-0"><Trash2 size={14}/></Button>}
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-300">
                        <Button type="button" variant="danger" size="sm" onClick={initiateClearAll} className="shrink-0 bg-red-600"><Eraser size={14}/></Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowImport(!showImport)} className="shrink-0"><Upload size={14}/></Button>
                    </div>
                </div>
            </div>
          </div>
        )}
        <div className="flex overflow-x-auto border-b border-slate-200 px-2 pt-2 scrollbar-hide">
          <button type="button" onClick={() => setSelectedCategory('all')} className={`px-4 py-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap outline-none ${selectedCategory === 'all' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Todas</button>
          {categories.map(c => (
            <div key={c.id} className={`flex items-center border-b-2 whitespace-nowrap group ${selectedCategory === c.id ? 'border-blue-600 bg-blue-50/50' : 'border-transparent'}`}>
              <button type="button" onClick={() => setSelectedCategory(c.id)} className={`px-4 py-3 text-xs md:text-sm font-medium outline-none ${selectedCategory === c.id ? 'text-blue-600' : 'text-slate-500'}`}>{c.name}</button>
              {canEditStructure && <button type="button" onClick={(e) => initiateCategoryDelete(e, c.id, c.name)} className="mr-2 p-1.5 rounded-full hover:bg-red-100 text-slate-300 hover:text-red-500"><X size={14}/></button>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-slate-400" /></div>
           <input type="text" className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg bg-white text-sm shadow-sm" placeholder="Buscar por Nº OM, Descrição..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
           {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"><X size={18} /></button>}
        </div>
        <div className="relative md:w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase size={18} className="text-slate-400" /></div>
           <select value={selectedWorkCenter} onChange={(e) => setSelectedWorkCenter(e.target.value)} className="block w-full pl-10 pr-8 py-3 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm shadow-sm appearance-none cursor-pointer">
              <option value="all">Todos os Centros</option>
              {uniqueWorkCenters.map(wc => <option key={wc} value={wc}>{wc}</option>)}
           </select>
           <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500"><ChevronDown size={16} /></div>
        </div>
      </div>

      {showImport && canEditStructure && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-slate-200 relative animate-fade-in mb-6">
           <button type="button" onClick={() => setShowImport(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
           <h3 className="font-bold text-lg mb-2 flex items-center"><FileSpreadsheet className="mr-2 text-green-600"/> Importar Dados Operacionais</h3>
           <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 md:p-8 text-center bg-slate-50">
             <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" id="file-upload"/>
             <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center"><Upload size={28} className="text-slate-400 mb-2" /><span className="text-sm font-medium text-slate-700">Selecione o arquivo Excel</span></label>
           </div>
        </div>
      )}

      <div className="space-y-3 md:space-y-4 min-h-[300px]">
        {filteredTasks.map(task => (
            <PendingTaskCard key={task.id} task={task} categories={categories} canManageStatus={canManageStatus} canDelete={canDelete} onStatusChange={handleStatusChange} onDelete={handleDeleteClick} onViewDetails={setSelectedTask}/>
        ))}
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm animate-fade-in">
             <ListTodo size={48} className="text-slate-200 mb-3" />
             <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">Sem OMs Pendentes</p>
             <p className="text-slate-400 text-sm">Todas as atividades deste filtro foram concluídas ou não existem.</p>
          </div>
        )}
      </div>

      {/* Detalhes da Tarefa */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
             <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-start shrink-0">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-xs font-bold font-mono">OM {selectedTask.omNumber}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-500 text-white">Pendente</span>
                   </div>
                   <h2 className="text-lg font-bold text-white leading-tight">{selectedTask.description}</h2>
                </div>
                <button type="button" onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white p-1 rounded-full"><X size={24} /></button>
             </div>
             <div className="p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Briefcase size={12} /> Centro de Trabalho</p>
                      <p className="text-sm font-bold text-slate-800 break-words">{selectedTask.workCenter || 'N/A'}</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Tag size={12} /> Categoria</p>
                      <p className="text-sm font-bold text-slate-800">{categories.find(c => c.id === selectedTask.categoryId)?.name || 'Geral'}</p>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4">
                   <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2"><ClipboardList size={16} className="text-blue-600"/> Prazos Planejados</h4>
                   <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div className="text-slate-600 uppercase">Data Início: <span className="text-slate-800 ml-1">{selectedTask.dateMin || '-'}</span></div>
                      <div className="text-slate-600 uppercase">Prazo Máximo: <span className="text-red-600 ml-1">{selectedTask.dateMax || '-'}</span></div>
                   </div>
                </div>
             </div>
             <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end shrink-0"><Button type="button" onClick={() => setSelectedTask(null)}>Fechar</Button></div>
          </div>
        </div>
      )}

      {/* Modal Motivo */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-lg p-5 w-[95%] max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center"><AlertTriangle className="mr-2"/> Não Executar</h3>
            <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selecione seu Turno</label>
                <div className="grid grid-cols-4 gap-2">
                    {[Shift.A, Shift.B, Shift.C, Shift.D].map((shift) => (
                        <button type="button" key={shift} onClick={() => setSelectedShift(shift)} className={`py-2 px-1 rounded font-bold border text-sm transition-all ${selectedShift === shift ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-300'}`}>{shift}</button>
                    ))}
                </div>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Motivo da Não Execução</label>
            <textarea className="w-full border border-slate-300 rounded p-3 mb-4 h-24 outline-none text-slate-800" placeholder="Descreva o motivo..." value={reasonText} onChange={(e) => setReasonText(e.target.value)}></textarea>
            <div className="flex justify-end space-x-2 border-t pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowReasonModal(null)} size="sm">Cancelar</Button>
              <Button type="button" variant="danger" onClick={handleReasonSubmit} disabled={!reasonText.trim()} size="sm">Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Turno Execução */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-lg p-5 w-[95%] max-w-sm shadow-2xl">
                <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center"><CheckCircle className="text-green-600 mr-2" /> Confirmar Execução</h3>
                <p className="text-sm text-slate-600 mb-4">Selecione o turno responsável:</p>
                <div className="mb-6 bg-slate-50 p-3 rounded border border-slate-100">
                    <div className="grid grid-cols-4 gap-2">
                        {[Shift.A, Shift.B, Shift.C, Shift.D].map((shift) => (
                            <button type="button" key={shift} onClick={() => setSelectedShift(shift)} className={`py-3 rounded font-bold border transition-all ${selectedShift === shift ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>{shift}</button>
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
    </div>
  );
};
