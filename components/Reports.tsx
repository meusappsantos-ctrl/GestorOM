
import React, { useRef, useState } from 'react';
import { Task, TaskStatus, Shift } from '../types';
import { Button } from './Button';
import { Download, FileText, Loader2, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportsProps {
  tasks: Task[];
}

export const Reports: React.FC<ReportsProps> = ({ tasks }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalTasks = tasks.length;
  const executedTasks = tasks.filter(t => t.status === TaskStatus.EXECUTED).length;
  const notExecutedTasks = tasks.filter(t => t.status === TaskStatus.NOT_EXECUTED).length;
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const executionRate = totalTasks > 0 ? ((executedTasks / totalTasks) * 100).toFixed(1) : '0';

  const shiftData = [Shift.A, Shift.B, Shift.C, Shift.D].map(shift => {
    const executed = tasks.filter(t => t.status === TaskStatus.EXECUTED && t.executedByShift === shift).length;
    const notExecuted = tasks.filter(t => t.status === TaskStatus.NOT_EXECUTED && t.executedByShift === shift).length; 
    return { name: `Turno ${shift}`, Executadas: executed, "Não Executadas": notExecuted };
  });

  const statusData = [
    { name: 'Executadas', value: executedTasks, color: '#16a34a' },
    { name: 'Não Executadas', value: notExecutedTasks, color: '#dc2626' },
    { name: 'Aguardando', value: pendingTasks, color: '#cbd5e1' },
  ];

  const handleExportCSV = () => {
    const headers = "ID,OM,Descrição,Responsável Modificação,Status,Turno Execução,Data Registro,Tolerância Max,Motivo\n";
    const rows = tasks.map(t => {
      const resp = t.updatedByUserName || 'N/A';
      return `${t.id},${t.omNumber},"${t.description.replace(/"/g, '""')}",${resp},${t.status},${t.executedByShift || ''},${t.dateExecuted || ''},${t.dateMax || ''},"${(t.reasonNotExecuted || '').replace(/"/g, '""')}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_conferencia_om_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', windowWidth: 1280 });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 190;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, imgHeight);
      pdf.save(`relatorio_operacional_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) { alert("Erro ao gerar PDF."); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="text-center md:text-left">
           <h2 className="text-xl md:text-2xl font-bold text-slate-800">Relatórios Gerenciais</h2>
           <p className="text-sm text-slate-500">Controle de modificações e desempenho.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handleExportCSV} variant="outline" className="flex-1 md:flex-none justify-center"><Download size={16} className="mr-2"/> CSV</Button>
          <Button onClick={handleExportPDF} disabled={isGenerating} className="flex-1 md:flex-none justify-center">
            {isGenerating ? <Loader2 size={16} className="mr-2 animate-spin"/> : <FileText size={16} className="mr-2"/>} PDF
          </Button>
        </div>
      </div>

      <div ref={reportRef} id="report-content" className="bg-white p-4 md:p-8 rounded-lg shadow-sm border border-slate-200 min-h-screen font-sans">
        <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 uppercase">Audit de Operações</h1>
            <p className="text-slate-600 font-medium">Conferência de Responsáveis por Modificação</p>
          </div>
          <div className="text-right"><p className="text-xs font-bold text-slate-700">EMITIDO EM</p><p className="text-slate-800 font-bold">{new Date().toLocaleDateString()}</p></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded border border-slate-300 text-center"><span className="block text-xs text-slate-500 uppercase font-bold">Total OMs</span><span className="text-2xl font-bold">{totalTasks}</span></div>
            <div className="p-4 bg-green-50 rounded border border-green-300 text-center"><span className="block text-xs text-green-700 uppercase font-bold">Executadas</span><span className="text-2xl font-bold text-green-700">{executedTasks}</span></div>
            <div className="p-4 bg-red-50 rounded border border-red-300 text-center"><span className="block text-xs text-red-700 uppercase font-bold">Não Realizadas</span><span className="text-2xl font-bold text-red-700">{notExecutedTasks}</span></div>
            <div className="p-4 bg-blue-50 rounded border border-blue-300 text-center"><span className="block text-xs text-blue-700 uppercase font-bold">Taxa</span><span className="text-2xl font-bold text-blue-700">{executionRate}%</span></div>
        </div>

        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-3">Tabela de Conferência (Rastreabilidade)</h3>
            <div className="border border-slate-300 rounded overflow-hidden">
                <table className="min-w-full divide-y divide-slate-300 text-[10px] md:text-xs">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-3 py-3 text-left font-bold text-slate-800 uppercase border-b border-slate-300">OM</th>
                            <th className="px-3 py-3 text-left font-bold text-slate-800 uppercase border-b border-slate-300">Descrição</th>
                            <th className="px-3 py-3 text-left font-bold text-slate-800 uppercase border-b border-slate-300">Status</th>
                            <th className="px-3 py-3 text-left font-bold text-slate-900 bg-blue-50 uppercase border-b border-slate-300"><div className="flex items-center gap-1"><UserCheck size={12}/> Responsável</div></th>
                            <th className="px-3 py-3 text-center font-bold text-slate-800 uppercase border-b border-slate-300">Turno</th>
                            <th className="px-3 py-3 text-left font-bold text-slate-800 uppercase border-b border-slate-300">Data Registro</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {tasks.map((task) => (
                        <tr key={task.id} className="even:bg-slate-50">
                            <td className="px-3 py-2 font-bold text-slate-900">{task.omNumber}</td>
                            <td className="px-3 py-2 text-slate-700 max-w-[200px] truncate">{task.description}</td>
                            <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full font-bold ${task.status === TaskStatus.EXECUTED ? 'text-green-700' : task.status === TaskStatus.NOT_EXECUTED ? 'text-red-700' : 'text-slate-500'}`}>{task.status.toUpperCase()}</span></td>
                            <td className="px-3 py-2 font-bold text-blue-800 bg-blue-50/30">{task.updatedByUserName || '-'}</td>
                            <td className="px-3 py-2 text-center font-bold">{task.executedByShift || '-'}</td>
                            <td className="px-3 py-2">{task.dateExecuted ? new Date(task.dateExecuted).toLocaleDateString() : '-'}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="mt-8 text-center text-[10px] text-slate-400">Documento de auditoria interna para controle de execuções por Administrador.</div>
      </div>
    </div>
  );
};
