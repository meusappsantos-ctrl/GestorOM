import React from 'react';
import { Task, TaskStatus, Shift } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  tasks: Task[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  // Logic for KPIs
  const totalTasks = tasks.length;
  const executedTasks = tasks.filter(t => t.status === TaskStatus.EXECUTED).length;
  const notExecutedTasks = tasks.filter(t => t.status === TaskStatus.NOT_EXECUTED).length;
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;

  const executionRate = totalTasks > 0 ? ((executedTasks / totalTasks) * 100).toFixed(1) : '0';

  // Logic for Shift Performance Chart
  const shiftData = [Shift.A, Shift.B, Shift.C, Shift.D].map(shift => {
    const executed = tasks.filter(t => t.status === TaskStatus.EXECUTED && t.executedByShift === shift).length;
    const notExecuted = tasks.filter(t => t.status === TaskStatus.NOT_EXECUTED && t.executedByShift === shift).length; 
    return {
      name: `Turno ${shift}`,
      Executadas: executed,
      "Não Executadas": notExecuted
    };
  });

  // Pie Data
  const statusData = [
    { name: 'Executadas', value: executedTasks, color: '#16a34a' },
    { name: 'Não Executadas', value: notExecutedTasks, color: '#dc2626' },
    { name: 'Aguardando', value: pendingTasks, color: '#cbd5e1' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800">Painel de Desempenho</h2>

      {/* KPI Cards - Mobile: 2 cols, Desktop: 4 cols */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs md:text-sm font-medium text-slate-500 uppercase">Total de OMs</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-1 md:mt-2">{totalTasks}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-green-500">
          <p className="text-xs md:text-sm font-medium text-slate-500 uppercase">Executadas</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1 md:mt-2">{executedTasks}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-red-500">
          <p className="text-xs md:text-sm font-medium text-slate-500 uppercase">Não Executadas</p>
          <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1 md:mt-2">{notExecutedTasks}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs md:text-sm font-medium text-slate-500 uppercase">Taxa Execução</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1 md:mt-2">{executionRate}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Bar Chart - Performance by Shift */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-4">Desempenho por Turno</h3>
          <div className="h-64 md:h-80 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} width={30} tick={{fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="Executadas" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Não Executadas" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Overall Status */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-4">Status Geral</h3>
          <div className="h-64 md:h-80 flex justify-center text-xs">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{fontSize: '12px'}}/>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};