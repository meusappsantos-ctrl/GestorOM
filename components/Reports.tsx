import React, { useRef, useState } from 'react';
import { Task, TaskStatus, Shift } from '../types';
import { Button } from './Button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportsProps {
  tasks: Task[];
}

export const Reports: React.FC<ReportsProps> = ({ tasks }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Lógica de Dados (KPIs e Gráficos) ---
  const totalTasks = tasks.length;
  const executedTasks = tasks.filter(t => t.status === TaskStatus.EXECUTED).length;
  const notExecutedTasks = tasks.filter(t => t.status === TaskStatus.NOT_EXECUTED).length;
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const executionRate = totalTasks > 0 ? ((executedTasks / totalTasks) * 100).toFixed(1) : '0';

  const shiftData = [Shift.A, Shift.B, Shift.C, Shift.D].map(shift => {
    const executed = tasks.filter(t => t.status === TaskStatus.EXECUTED && t.executedByShift === shift).length;
    const notExecuted = tasks.filter(t => t.status === TaskStatus.NOT_EXECUTED && t.executedByShift === shift).length; 
    return {
      name: `Turno ${shift}`,
      Executadas: executed,
      "Não Executadas": notExecuted
    };
  });

  const statusData = [
    { name: 'Executadas', value: executedTasks, color: '#16a34a' },
    { name: 'Não Executadas', value: notExecutedTasks, color: '#dc2626' },
    { name: 'Aguardando', value: pendingTasks, color: '#cbd5e1' },
  ];

  // --- Funções de Exportação ---

  const handleExportCSV = () => {
    const headers = "ID,OM,Descrição,Categoria,Status,Turno Execução,Data Execução,Tolerância Min,Tolerância Max,Motivo Não Execução\n";
    const rows = tasks.map(t => {
      return `${t.id},${t.omNumber},"${t.description}",${t.categoryId},${t.status},${t.executedByShift || ''},${t.dateExecuted || ''},${t.dateMin || ''},${t.dateMax || ''},"${t.reasonNotExecuted || ''}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_om_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      // Configuração para simular Desktop
      const desktopWidth = 1280; // Largura forçada para garantir layout expandido

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Resolução (2x é bom para retina/impressão)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: desktopWidth, // Simula janela larga para o html2canvas
        onclone: (clonedDoc) => {
            // Esta função roda na cópia do DOM antes de renderizar
            const element = clonedDoc.getElementById('report-content');
            if (element) {
                // Força a largura no elemento clonado para ativar o grid desktop (grid-cols-4 etc)
                element.style.width = `${desktopWidth}px`;
                element.style.padding = '40px'; // Garante margem interna na impressão
                
                // Ajustes opcionais de estilo para impressão
                const charts = element.querySelectorAll('.recharts-responsive-container');
                charts.forEach((chart: any) => {
                    // Força altura fixa nos gráficos para não colapsarem
                    chart.style.height = '350px';
                });
            }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Criação do PDF A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210; // Largura A4 em mm
      const pdfHeight = 297; // Altura A4 em mm
      const margin = 10; // Margem visual no PDF

      // Calcula a altura da imagem no PDF mantendo a proporção
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * (pdfWidth - (margin * 2))) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = margin;
      const contentWidth = pdfWidth - (margin * 2);

      // Adiciona primeira página
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pdfHeight - (margin * 2));

      // Paginação: Se o conteúdo for maior que uma página
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Posição negativa para mostrar o resto da imagem
        pdf.addPage();
        // Adiciona a mesma imagem deslocada para cima
        // Nota: Isso pode cortar linhas de texto ao meio. Para precisão perfeita de texto, seria necessário gerar múltiplos canvas, 
        // mas essa abordagem é robusta para layouts mistos com gráficos.
        pdf.addImage(imgData, 'PNG', margin, -(pdfHeight - margin) + heightLeft, contentWidth, imgHeight);
        heightLeft -= (pdfHeight - (margin * 2));
      }

      pdf.save(`relatorio_completo_om_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="text-center md:text-left">
           <h2 className="text-xl md:text-2xl font-bold text-slate-800">Relatórios Detalhados</h2>
           <p className="text-sm text-slate-500">Visualize e exporte os dados operacionais.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handleExportCSV} variant="outline" className="flex-1 md:flex-none justify-center">
            <Download size={16} className="mr-2"/> <span className="md:hidden">CSV</span><span className="hidden md:inline">Exportar CSV</span>
          </Button>
          <Button onClick={handleExportPDF} disabled={isGenerating} className="flex-1 md:flex-none justify-center">
            {isGenerating ? <Loader2 size={16} className="mr-2 animate-spin"/> : <FileText size={16} className="mr-2"/>}
            {isGenerating ? 'Gerando...' : 'Baixar PDF'}
          </Button>
        </div>
      </div>

      {/* 
        Container de Relatório Visual 
        Este é o container que será "impresso" no PDF.
        A ID 'report-content' é crucial para a função de exportação.
      */}
      <div ref={reportRef} id="report-content" className="bg-white p-4 md:p-8 rounded-lg shadow-sm border border-slate-200 min-h-screen font-sans">
        
        {/* PDF Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 uppercase tracking-tight">Relatório Gerencial</h1>
            <p className="text-slate-600 font-medium mt-1">Gestor de Tarefas Operacionais</p>
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            <p className="text-sm font-bold text-slate-700 uppercase">Data de Emissão</p>
            <p className="text-slate-800 font-medium">{new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* KPIs Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <div className="p-3 md:p-4 bg-slate-50 rounded border border-slate-300 text-center">
                <span className="block text-[10px] md:text-xs text-slate-600 uppercase font-bold tracking-wider">Total OMs</span>
                <span className="block text-2xl md:text-3xl font-bold text-slate-900">{totalTasks}</span>
            </div>
            <div className="p-3 md:p-4 bg-green-50 rounded border border-green-300 text-center">
                <span className="block text-[10px] md:text-xs text-green-800 uppercase font-bold tracking-wider">Executadas</span>
                <span className="block text-2xl md:text-3xl font-bold text-green-800">{executedTasks}</span>
            </div>
            <div className="p-3 md:p-4 bg-red-50 rounded border border-red-300 text-center">
                <span className="block text-[10px] md:text-xs text-red-800 uppercase font-bold tracking-wider">Não Executadas</span>
                <span className="block text-2xl md:text-3xl font-bold text-red-800">{notExecutedTasks}</span>
            </div>
            <div className="p-3 md:p-4 bg-blue-50 rounded border border-blue-300 text-center">
                <span className="block text-[10px] md:text-xs text-blue-800 uppercase font-bold tracking-wider">Eficiência</span>
                <span className="block text-2xl md:text-3xl font-bold text-blue-800">{executionRate}%</span>
            </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-blue-600 pl-3">Desempenho por Turno</h3>
                <div className="h-80 border border-slate-200 rounded p-4 bg-white">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shiftData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="name" tick={{fontSize: 11, fill: '#334155'}} axisLine={{stroke: '#cbd5e1'}} tickLine={false} />
                        <YAxis tick={{fontSize: 11, fill: '#334155'}} axisLine={false} tickLine={false} />
                        <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}}/>
                        <Bar dataKey="Executadas" fill="#16a34a" name="Executadas" />
                        <Bar dataKey="Não Executadas" fill="#dc2626" name="Não Executadas" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-blue-600 pl-3">Distribuição de Status</h3>
                <div className="h-80 border border-slate-200 rounded p-4 bg-white">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        >
                        {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}}/>
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Detailed Table */}
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-3">Detalhamento das OMs</h3>
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-300 text-xs">
                <thead className="bg-slate-100">
                    <tr>
                    <th scope="col" className="px-3 py-3 text-left font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 whitespace-nowrap">OM</th>
                    <th scope="col" className="px-3 py-3 text-left font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 min-w-[150px]">Descrição</th>
                    <th scope="col" className="px-3 py-3 text-left font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 whitespace-nowrap">Status</th>
                    <th scope="col" className="px-3 py-3 text-center font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 whitespace-nowrap">Turno</th>
                    <th scope="col" className="px-3 py-3 text-left font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 whitespace-nowrap">Tol. Min</th>
                    <th scope="col" className="px-3 py-3 text-left font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 whitespace-nowrap">Tol. Max</th>
                    <th scope="col" className="px-3 py-3 text-left font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 min-w-[150px]">Obs/Motivo</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {tasks.map((task) => (
                    <tr key={task.id} className="even:bg-slate-50">
                        <td className="px-3 py-2 whitespace-nowrap font-bold text-slate-900 border-r border-slate-100">
                        {task.omNumber}
                        </td>
                        <td className="px-3 py-2 text-slate-700 font-medium">
                        {task.description}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase tracking-wide border ${
                            task.status === TaskStatus.EXECUTED ? 'bg-green-100 text-green-800 border-green-200' : 
                            task.status === TaskStatus.NOT_EXECUTED ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                            {task.status === TaskStatus.EXECUTED ? 'EXECUTADO' : 
                            task.status === TaskStatus.NOT_EXECUTED ? 'NÃO EXECUTADO' : 'PENDENTE'}
                        </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700 font-bold text-center">
                        {task.executedByShift || '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700 font-medium">
                        {task.dateMin ? new Date(task.dateMin).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700 font-medium">
                        {task.dateMax ? new Date(task.dateMax).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-3 py-2 text-slate-600 italic">
                        {task.reasonNotExecuted || '-'}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
              </div>
            </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 font-medium">
            Relatório gerado automaticamente pelo sistema Gestor OM - Documento para uso interno.
        </div>
      </div>
    </div>
  );
};