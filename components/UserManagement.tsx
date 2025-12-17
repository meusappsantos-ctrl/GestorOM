import React, { useState } from 'react';
import { User, UserRole, Shift } from '../types';
import { Button } from './Button';
import { Trash2, UserPlus, ShieldAlert } from 'lucide-react';
import { hashPassword } from '../utils/security';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onAddUser, onDeleteUser }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shift, setShift] = useState<Shift>(Shift.A);
  const [role, setRole] = useState<UserRole>(UserRole.EXECUTOR);
  const [isProcessing, setIsProcessing] = useState(false);

  // Permissões
  const isManager = currentUser.role === UserRole.MANAGER;
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    setIsProcessing(true);

    try {
        // Validação de Segurança
        if (role === UserRole.MANAGER && !isManager) {
            alert("Apenas um Gerente pode criar outro Gerente.");
            return;
        }
        if (role === UserRole.ADMIN && !isManager) {
            alert("Apenas um Gerente pode criar Administradores.");
            return;
        }

        // Verifica duplicidade de usuário
        if (users.some(u => u.username === username)) {
            alert("Este nome de usuário já está em uso.");
            return;
        }

        // Gera o Hash da senha
        const passwordHash = await hashPassword(password);

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            username,
            passwordHash,
            role,
            shift: role === UserRole.EXECUTOR ? shift : undefined
        };

        onAddUser(newUser);
        setName('');
        setUsername('');
        setPassword('');
        // Reseta para executor por padrão
        setRole(UserRole.EXECUTOR);
    } catch (error) {
        console.error("Erro ao criar usuário", error);
        alert("Erro de segurança ao processar senha.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800">Gestão de Usuários</h2>
      
      {/* Create User Form */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center"><UserPlus size={20} className="mr-2"/> Novo Usuário</h3>
        
        {isAdmin && !isManager && (
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 flex items-start">
                <ShieldAlert className="text-blue-600 mr-2 shrink-0" size={18} />
                <p className="text-xs md:text-sm text-blue-700">
                    Como <strong>Administrador</strong>, você pode criar apenas contas de <strong>Executantes</strong>.
                </p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nome Completo</label>
            <input 
              type="text" required 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2 bg-white"
              value={name} onChange={e => setName(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Usuário (Login)</label>
            <input 
              type="text" required 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2 bg-white"
              value={username} onChange={e => setUsername(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700">Senha</label>
             <input 
               type="password" required 
               className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2 bg-white"
               value={password} onChange={e => setPassword(e.target.value)}
               disabled={isProcessing}
             />
             <p className="text-[10px] text-slate-400 mt-1">A senha será criptografada antes de salvar.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">Tipo</label>
              <select 
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2 bg-white"
                value={role} 
                onChange={e => setRole(e.target.value as UserRole)}
                disabled={isProcessing}
              >
                <option value={UserRole.EXECUTOR}>Executante</option>
                {/* Apenas Gerente vê as outras opções */}
                {isManager && <option value={UserRole.ADMIN}>Administrador</option>}
                {isManager && <option value={UserRole.MANAGER}>Gerente</option>}
              </select>
            </div>
            {role === UserRole.EXECUTOR && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Turno</label>
                <select 
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm border p-2 bg-white"
                  value={shift} onChange={e => setShift(e.target.value as Shift)}
                  disabled={isProcessing}
                >
                  <option value={Shift.A}>A</option>
                  <option value={Shift.B}>B</option>
                  <option value={Shift.C}>C</option>
                  <option value={Shift.D}>D</option>
                </select>
              </div>
            )}
          </div>
          <div className="md:col-span-2 mt-2">
            <Button type="submit" className="w-full md:w-auto" disabled={isProcessing}>
                {isProcessing ? 'Criptografando...' : 'Criar Conta'}
            </Button>
          </div>
        </form>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Turno</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {u.role === UserRole.MANAGER ? 'Gerente' : u.role === UserRole.ADMIN ? 'Administrador' : 'Executante'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.shift || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isManager && u.username !== 'rafael' && (
                      <button onClick={() => onDeleteUser(u.id)} className="text-red-600 hover:text-red-900 p-2" title="Excluir Usuário">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};