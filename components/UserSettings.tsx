import React, { useState } from 'react';
import { UserAccount, AccessLevel } from '../types';
import { Save, User, Shield, Key, CheckCircle, AlertCircle, Link } from 'lucide-react';

interface UserSettingsProps {
  currentUser: UserAccount;
  onUpdateUser: (updatedUser: UserAccount) => void;
  nfsLink: string;
  onUpdateNfsLink: (newLink: string) => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ currentUser, onUpdateUser, nfsLink, onUpdateNfsLink }) => {
  // User profile state
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState(currentUser.password);
  const [confirmPassword, setConfirmPassword] = useState(currentUser.password);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(currentUser.accessLevel);
  const [showUserSuccess, setShowUserSuccess] = useState(false);
  const [userError, setUserError] = useState('');

  // NFS link state
  const [localNfsLink, setLocalNfsLink] = useState(nfsLink);
  const [showNfsSuccess, setShowNfsSuccess] = useState(false);
  const [nfsError, setNfsError] = useState('');

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    
    if (!username || !password) {
      setUserError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setUserError('As senhas não coincidem.');
      return;
    }

    const updated: UserAccount = {
      ...currentUser,
      username,
      password,
      accessLevel
    };

    onUpdateUser(updated);
    setShowUserSuccess(true);
    setTimeout(() => setShowUserSuccess(false), 3000);
  };

  const handleNfsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNfsError('');

    if (!localNfsLink.trim()) {
      setNfsError('O link da NFS-e não pode estar vazio.');
      return;
    }

    try {
      new URL(localNfsLink);
    } catch (_) {
      setNfsError('Insira uma URL válida (ex: https://...).');
      return;
    }

    onUpdateNfsLink(localNfsLink);
    setShowNfsSuccess(true);
    setTimeout(() => setShowNfsSuccess(false), 3000);
  };

  const isAdmin = currentUser.accessLevel === 'ADMIN';

  return (
    <div className="pt-4 space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Dados do Usuário Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Shield className="text-blue-600" size={20} />
          <h2 className="font-bold text-gray-800">Dados do Usuário</h2>
        </div>
        
        <form onSubmit={handleUserSubmit} className="p-6 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              Login (Nome de Usuário)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Ex: joao_suporte"
            />
          </div>

          {/* Access Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Shield size={16} className="text-gray-400" />
              Nível de Acesso
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
            >
              <option value="ADMIN">Administrador (Acesso Total)</option>
              <option value="SUPPORT">Suporte (Acesso Limitado)</option>
            </select>
            <p className="mt-1.5 text-xs text-gray-400 italic leading-relaxed">
              {accessLevel === 'ADMIN' 
                ? 'Permite gerenciar usuários, financeiro e todas as ordens de serviço.' 
                : 'Permite gerenciar ordens de serviço. Bloqueia financeiro e configurações.'}
            </p>
          </div>

          {/* Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Key size={16} className="text-gray-400" />
                Nova Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Key size={16} className="text-gray-400" />
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* User Messages */}
          {userError && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-[fadeIn_0.3s_ease-out]">
              <AlertCircle size={16} />
              {userError}
            </div>
          )}

          {showUserSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100 animate-[fadeIn_0.3s_ease-out]">
              <CheckCircle size={16} />
              Perfil atualizado com sucesso!
            </div>
          )}

          {/* User Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>

      {/* NFS Configuration Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Link className="text-teal-600" size={20} />
          <h2 className="font-bold text-gray-800">Configuração do Link NFS-e</h2>
        </div>

        <form onSubmit={handleNfsSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Padrão (URL)</label>
            <input
              type="url"
              value={localNfsLink}
              onChange={(e) => setLocalNfsLink(e.target.value)}
              readOnly={!isAdmin}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
                isAdmin 
                ? 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100' 
                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              placeholder="https://www.nfse.gov.br/..."
            />
            <p className="mt-1.5 text-xs text-gray-400 italic leading-relaxed">
              Define o destino do botão "Emitir NFS-e" no menu lateral.
            </p>
          </div>

          {/* NFS Messages */}
          {nfsError && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-[fadeIn_0.3s_ease-out]">
              <AlertCircle size={16} />
              {nfsError}
            </div>
          )}

          {showNfsSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100 animate-[fadeIn_0.3s_ease-out]">
              <CheckCircle size={16} />
              Link da NFS-e atualizado!
            </div>
          )}

          {isAdmin && (
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Salvar Alterações Link
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
          <Shield size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 text-sm mb-1">Gerenciamento Centralizado</h4>
          <p className="text-blue-700 text-xs leading-relaxed">
            Todas as suas configurações são armazenadas localmente no navegador. Se você mudar de dispositivo, as alterações precisarão ser replicadas.
          </p>
        </div>
      </div>
    </div>
  );
};