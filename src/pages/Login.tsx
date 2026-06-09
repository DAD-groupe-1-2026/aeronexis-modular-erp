import { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { apiClient } from '@aeronexis-dynamics/api-client';
import { useAuthStore } from '@aeronexis-dynamics/auth';
import { User } from '@aeronexis-dynamics/shared-types';

// Typage attendu selon le contrat d'interface
type LoginResponse = { user: User; token: string };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Zustand Store
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });

      if (res.status === 'failure') {
        setErrorMessage(res.error?.message || 'Une erreur inattendue est survenue.');
      } else if (res.status === 'success' && res.data) {
        // Appliquer l'état global et rediriger
        setAuth(res.data.user, res.data.token);
        
        // Redirection vers la racine pour que le RoleRedirector prenne le relais
        window.location.assign('/');
      }
    } catch (err) {
      setErrorMessage('Erreur réseau. Veuillez vérifier votre connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030304] text-slate-200 font-sans antialiased relative flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: `url('/background.jpeg')` }}
      />
      
      {/* Dark Overlay gradient for readability and blending */}
      <div className="absolute inset-0 z-0 bg-[#030304]/40"></div>

      {/* Background Atmospheric Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px] z-0 pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] z-0 pointer-events-none mix-blend-screen"></div>
      
      {/* Main Content Container */}
      <div className="z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-0 shadow-2xl rounded-3xl overflow-hidden border border-white/10 m-4 backdrop-blur-2xl bg-[#0a0a0c]/40">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden md:flex col-span-5 bg-black/20 p-12 flex-col justify-between border-r border-white/10">
          <div>
            <div className="flex items-center space-x-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <div className="w-5 h-5 border-2 border-slate-900 rotate-45"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">AERONEXIS</span>
            </div>
            <h2 className="text-3xl font-light text-white leading-tight mb-4">
              Portail d'accès <br/><span className="font-semibold text-indigo-400">Centralisé</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Architecture ERP modulaire. Passerelle sécurisée pour la gestion unifiée des micro-frontends.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
              <span>Système : Connecté</span>
            </div>
            <div className="text-[10px] text-slate-600 uppercase tracking-widest">
              Aeronexis ERP v4.2.0-stable
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="col-span-1 md:col-span-7 bg-transparent p-8 md:p-12 flex flex-col justify-center relative">
          <div className="absolute top-0 right-0 p-8 hidden md:block">
            <span className="text-[10px] text-slate-500 font-mono tracking-tighter">ID: NX-8842-X</span>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">Authentification</h1>
              <p className="text-slate-400 text-sm">Entrez vos identifiants pour accéder aux modules ERP.</p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3 text-red-400 animate-[pulse_0.5s_ease-in-out]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold ml-1">Adresse Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adresse@aeronexis.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">Mot de passe</label>
                  <a href="#" className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors uppercase font-bold tracking-tighter">Oublié ?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-5 h-5 bg-white/5 border border-white/20 rounded peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all duration-300"></div>
                    <svg className="absolute w-3.5 h-3.5 pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">Mémoriser la session</span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl shadow-xl shadow-white/5 hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-slate-950 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dynamics</span>
                      <ArrowRight className="w-5 h-5 text-slate-950" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 flex items-center justify-between text-[11px] text-slate-600 border-t border-white/5 pt-6">
              <div className="flex items-center space-x-4">
                <a href="#" className="hover:text-slate-400 transition-colors">Politique de sécurité</a>
                <a href="#" className="hover:text-slate-400 transition-colors">Architecture</a>
              </div>
              <span>Chiffrement TLS 1.3 Actif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Bar */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
    </div>
  );
}
