import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, CheckCircle2, XCircle, Moon, Sun, Filter, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const rawBase = (localStorage.getItem('API_BASE_URL') || '').trim();
const API_BASE = (rawBase ? (rawBase.startsWith('http') ? rawBase : `http://${rawBase}`) : 'https://chatbot-whatsapp-ssjm.onrender.com') as string;

type Chamado = {
  id: string;
  numero_whatsapp: string;
  nome_contato?: string;
  status: 'aguardando' | 'em_atendimento' | 'finalizado' | 'cancelado';
  dentro_expediente: boolean | null;
  horario_abertura: string;
  horario_finalizacao?: string | null;
};

type Stats = { aguardando: number; em_atendimento: number; finalizado: number; fora_expediente: number };
type Mensagem = { id: string; chamado_id: string; numero_whatsapp: string; mensagem: string; tipo_mensagem: string; timestamp: string };
type DetalheResponse = { chamado: Chamado; mensagens: Mensagem[] };

function useTheme() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('THEME') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('THEME', theme);
  }, [theme]);
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  return { theme, toggle };
}

function useToast() {
  const [toasts, setToasts] = useState<{ id: number; type: 'info' | 'success' | 'error' | 'warning'; msg: string }[]>([]);
  const idRef = useRef(1);
  const show = (type: 'info' | 'success' | 'error' | 'warning', msg: string, ms = 3000) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  };
  return { toasts, show };
}

export default function App() {
  const { theme, toggle } = useTheme();
  const { toasts, show } = useToast();

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [stats, setStats] = useState<Stats>({ aguardando: 0, em_atendimento: 0, finalizado: 0, fora_expediente: 0 });
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<DetalheResponse | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [expedienteFilter, setExpedienteFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtrados = useMemo(() => {
    let data = [...chamados];
    if (statusFilter) data = data.filter((c) => c.status === statusFilter);
    if (expedienteFilter) data = data.filter((c) => String(c.dentro_expediente) === expedienteFilter);
    if (dateFilter) data = data.filter((c) => new Date(c.horario_abertura).toISOString().split('T')[0] === dateFilter);
    if (search) data = data.filter((c) => (c.nome_contato?.toLowerCase().includes(search) || c.numero_whatsapp.includes(search)));
    return data;
  }, [chamados, statusFilter, expedienteFilter, dateFilter, search]);

  async function fetchChamados() {
    try {
      setLoadingTable(true);
      const res = await fetch(`${API_BASE}/api/chamados`);
      if (!res.ok) throw new Error('Falha ao carregar chamados');
      const data: Chamado[] = await res.json();
      setChamados(Array.isArray(data) ? data : []);
    } catch (e) {
      show('error', 'Erro ao carregar chamados');
    } finally {
      setLoadingTable(false);
    }
  }

  async function fetchStats() {
    try {
      setLoadingStats(true);
      const res = await fetch(`${API_BASE}/api/estatisticas`);
      if (!res.ok) throw new Error('Falha ao carregar estatísticas');
      const data: Stats = await res.json();
      setStats(data);
    } catch (e) {
      show('error', 'Erro ao carregar estatísticas');
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    fetchChamados();
    fetchStats();
    const id = setInterval(() => { fetchChamados(); fetchStats(); }, 30000);
    return () => clearInterval(id);
  }, []);

  const finalize = async (id: string) => {
    if (!confirm('Deseja finalizar este chamado?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/chamados/${id}/finalizar`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao finalizar');
      show('success', 'Chamado finalizado');
      fetchChamados();
      fetchStats();
    } catch {
      show('error', 'Erro ao finalizar chamado');
    }
  };

  const cancel = async (id: string) => {
    if (!confirm('Deseja cancelar este chamado?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/chamados/${id}/cancelar`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao cancelar');
      show('success', 'Chamado cancelado');
      fetchChamados();
      fetchStats();
    } catch {
      show('error', 'Erro ao cancelar chamado');
    }
  };

  const viewDetails = async (id: string) => {
    try {
      setDetailsLoading(true);
      setDetails(null);
      setDetailsOpen(true);
      const res = await fetch(`${API_BASE}/api/chamados/${id}`);
      if (!res.ok) throw new Error('Falha ao carregar detalhes');
      const data: DetalheResponse = await res.json();
      setDetails(data);
    } catch {
      show('error', 'Erro ao carregar detalhes');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDetailsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 min-h-screen">
      <header className="card p-6 flex items-center justify-between">
      <div>
          <h1 className="text-2xl md:text-3xl font-bold">📊 Dashboard de Chamados</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Gestão de atendimentos WhatsApp em tempo real</p>
      </div>
        <button className="btn btn-primary" onClick={toggle} aria-label="Alternar tema">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} <span className="hidden sm:inline">Tema</span>
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(
          [
            { label: 'Aguardando', value: stats.aguardando, color: 'text-yellow-500' },
            { label: 'Em Atendimento', value: stats.em_atendimento, color: 'text-sky-500' },
            { label: 'Finalizados', value: stats.finalizado, color: 'text-emerald-500' },
            { label: 'Fora do Expediente', value: stats.fora_expediente, color: 'text-rose-500' },
          ] as const
        ).map((s) => (
          <motion.div key={s.label} className="card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-sm text-gray-500 dark:text-gray-300">{s.label}</div>
            <div className={`text-3xl font-extrabold ${s.color}`}>{loadingStats ? '—' : s.value}</div>
          </motion.div>
        ))}
      </section>

      <section className="card p-5 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-semibold flex items-center gap-2"><Filter size={16} /> Filtros</span>
          <select className="btn-ghost border rounded-md px-2 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos os Status</option>
            <option value="aguardando">Aguardando</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select className="btn-ghost border rounded-md px-2 py-2" value={expedienteFilter} onChange={(e) => setExpedienteFilter(e.target.value)}>
            <option value="">Todos os Horários</option>
            <option value="true">Dentro do Expediente</option>
            <option value="false">Fora do Expediente</option>
          </select>
          <input type="date" className="btn-ghost border rounded-md px-2 py-2" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          <input type="text" placeholder="Buscar por número ou nome..." className="btn-ghost border rounded-md px-3 py-2" value={search} onChange={(e) => setSearch(e.target.value.toLowerCase())} />
          <button className="btn btn-ghost" onClick={() => { setStatusFilter(''); setExpedienteFilter(''); setDateFilter(''); setSearch(''); }}>
            <RefreshCcw size={16} /> Limpar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Nome</th>
                <th>Número</th>
                <th>Status</th>
                <th>Expediente</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingTable ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Carregando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum chamado encontrado</td></tr>
              ) : (
                filtrados.map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.horario_abertura).toLocaleString('pt-BR')}</td>
                    <td>{c.nome_contato || 'Sem nome'}</td>
                    <td>{c.numero_whatsapp}</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                    <td>{c.dentro_expediente ? '✅ Sim' : '❌ Não'}</td>
                    <td className="whitespace-nowrap">
                      <button className="btn btn-ghost" aria-label={`Ver detalhes do chamado ${c.id}`} onClick={() => viewDetails(c.id)}>
                        <Eye size={16} /> Ver
                      </button>
                      {c.status !== 'finalizado' && c.status !== 'cancelado' && (
                        <>
                          <button className="btn btn-ghost text-emerald-600" aria-label={`Finalizar chamado ${c.id}`} onClick={() => finalize(c.id)}>
                            <CheckCircle2 size={16} />
                          </button>
                          <button className="btn btn-ghost text-rose-600" aria-label={`Cancelar chamado ${c.id}`} onClick={() => cancel(c.id)}>
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="fixed right-4 bottom-4 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={`px-3 py-2 rounded-md shadow-lg text-white ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-rose-600' : t.type === 'warning' ? 'bg-amber-600' : 'bg-sky-600'}`}
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

