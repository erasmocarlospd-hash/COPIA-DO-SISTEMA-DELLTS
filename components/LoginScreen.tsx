import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';
import { INITIAL_USERS } from '../constants';

interface LoginScreenProps {
  onLogin: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      // Get users from localStorage or initial
      const savedUsers = localStorage.getItem('techservice_users');
      const users: UserAccount[] = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
      
      const user = users.find(u => u.username.toUpperCase() === username.toUpperCase() && u.password === password);

      if (user) {
        localStorage.setItem('techservice_auth', 'true');
        localStorage.setItem('techservice_current_user_id', user.id);
        onLogin(user);
      } else {
        setError('Usuário ou senha incorretos');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.5s_ease-out]">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dellts Informática</h1>
            <p className="text-gray-500 text-sm">Entre para acessar o painel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} focus:ring-2 outline-none transition-all`}
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} focus:ring-2 outline-none transition-all`}
                  placeholder="Sua senha"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg animate-[fadeIn_0.3s_ease-out]">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        <div className="bg-gray-50 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">© 2024 Dellts Informática</p>
        </div>
      </div>
    </div>
  );
};