import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { db } from '../../lib/firebase';
import {
  HiUserGroup,
  HiCreditCard,
  HiMagnifyingGlass,
  HiArrowRight,
  HiShieldCheck,
} from 'react-icons/hi2';

type FirestoreDate = { toDate?: () => Date } | Date | null | undefined;

interface UserRow {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isAdmin: boolean;
  credits: number;
  totalCreditsEarned: number;
  purchasedCredits: number;
  spentCredits: number;
  txCount: number;
  selectedVisa: string;
  createdAt?: FirestoreDate;
  lastLoginAt?: FirestoreDate;
}

interface CreditAgg {
  purchasedCredits: number;
  spentCredits: number;
  txCount: number;
}

function toDate(value: FirestoreDate): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return null;
}

function formatDate(value: FirestoreDate): string {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleDateString('pt-BR');
}

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const { isAdmin, loading: creditsLoading } = useCredits();

  const [rows, setRows] = useState<UserRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !creditsLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [loading, creditsLoading, user, isAdmin, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || !isAdmin) return;
      setLoadingData(true);
      setLoadError('');
      try {
        const [usersSnap, historySnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collectionGroup(db, 'creditHistory')),
        ]);

        const creditMap = new Map<string, CreditAgg>();
        historySnap.forEach((docSnap) => {
          const data = docSnap.data() as {
            userId?: string;
            type?: string;
            amount?: number;
          };
          const userId = data.userId;
          if (!userId) return;

          const current = creditMap.get(userId) ?? {
            purchasedCredits: 0,
            spentCredits: 0,
            txCount: 0,
          };
          current.txCount += 1;

          if (data.type === 'purchase' && typeof data.amount === 'number' && data.amount > 0) {
            current.purchasedCredits += data.amount;
          }
          if (data.type === 'spend' && typeof data.amount === 'number' && data.amount < 0) {
            current.spentCredits += Math.abs(data.amount);
          }

          creditMap.set(userId, current);
        });

        const users: UserRow[] = usersSnap.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          const uid = docSnap.id;
          const agg = creditMap.get(uid);
          const displayName =
            (data.displayName as string) ||
            (data.fullName as string) ||
            (data.name as string) ||
            'Usuário';

          return {
            uid,
            email: (data.email as string) || '—',
            displayName,
            role: (data.role as string) || 'user',
            isAdmin: data.isAdmin === true || data.role === 'admin' || data.role === 'super_admin',
            credits: typeof data.credits === 'number' ? data.credits : 0,
            totalCreditsEarned: typeof data.totalCreditsEarned === 'number' ? data.totalCreditsEarned : 0,
            purchasedCredits: agg?.purchasedCredits ?? 0,
            spentCredits: agg?.spentCredits ?? 0,
            txCount: agg?.txCount ?? 0,
            selectedVisa: (data.selectedVisa as string) || (data.recommendedVisa as string) || '—',
            createdAt: (data.createdAt as FirestoreDate) ?? null,
            lastLoginAt: (data.lastLoginAt as FirestoreDate) ?? null,
          };
        });

        users.sort((a, b) => {
          const da = toDate(a.createdAt)?.getTime() ?? 0;
          const dbt = toDate(b.createdAt)?.getTime() ?? 0;
          return dbt - da;
        });

        setRows(users);
      } catch (error) {
        console.error('Erro ao carregar painel admin:', error);
        setLoadError('Não foi possível carregar os usuários. Verifique se sua conta possui role admin/super_admin ou isAdmin=true no Firestore.');
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [user, isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.displayName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.uid.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const totalUsers = rows.length;
    const adminUsers = rows.filter((r) => r.isAdmin).length;
    const availableCredits = rows.reduce((acc, r) => acc + r.credits, 0);
    const purchasedCredits = rows.reduce((acc, r) => acc + r.purchasedCredits, 0);
    const spentCredits = rows.reduce((acc, r) => acc + r.spentCredits, 0);

    return {
      totalUsers,
      adminUsers,
      availableCredits,
      purchasedCredits,
      spentCredits,
    };
  }, [rows]);

  if (loading || creditsLoading || !user || !isAdmin) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #F8FAFC 50%, #EEF2FF 100%)' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Painel administrativo</p>
              <h1 className="text-3xl font-bold text-slate-900 mt-1">Gestão completa de usuários</h1>
              <p className="text-slate-500 text-sm mt-1">Visão geral de conta, créditos, consumo e status da base.</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
              <HiShieldCheck className="w-4 h-4" />
              Admin: {userProfile?.displayName || userProfile?.name || user.email}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Usuários', value: stats.totalUsers, icon: <HiUserGroup className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600' },
              { label: 'Transações de crédito', value: rows.reduce((acc, r) => acc + r.txCount, 0), icon: <HiCreditCard className="w-5 h-5" />, color: 'from-emerald-500 to-teal-600' },
              { label: 'Admins', value: stats.adminUsers, icon: <HiShieldCheck className="w-5 h-5" />, color: 'from-violet-500 to-purple-600' },
              { label: 'Créditos disponíveis', value: stats.availableCredits, icon: <HiCreditCard className="w-5 h-5" />, color: 'from-amber-500 to-orange-500' },
              { label: 'Créditos comprados', value: stats.purchasedCredits, icon: <HiCreditCard className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500' },
              { label: 'Créditos gastos', value: stats.spentCredits, icon: <HiCreditCard className="w-5 h-5" />, color: 'from-rose-500 to-red-500' },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center mb-3`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-black text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500 font-medium">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <h2 className="font-bold text-slate-900">Usuários cadastrados</h2>
              <div className="relative w-full sm:w-80">
                <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, email ou UID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            {loadError && (
              <div className="mx-4 mt-4 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {loadError}
              </div>
            )}

            {loadingData ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="px-4 py-3 font-semibold">Usuário</th>
                      <th className="px-4 py-3 font-semibold">Créditos</th>
                      <th className="px-4 py-3 font-semibold">Comprados</th>
                      <th className="px-4 py-3 font-semibold">Gastos</th>
                      <th className="px-4 py-3 font-semibold">Transações</th>
                      <th className="px-4 py-3 font-semibold">Visto</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Último login</th>
                      <th className="px-4 py-3 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.uid} className="border-b border-slate-50 text-sm">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{r.displayName}</p>
                          <p className="text-xs text-slate-500">{r.email}</p>
                          <p className="text-[11px] text-slate-400">UID: {r.uid.slice(0, 12)}...</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">{r.credits}</td>
                        <td className="px-4 py-3 text-emerald-700 font-semibold">{r.purchasedCredits}</td>
                        <td className="px-4 py-3 text-rose-700 font-semibold">{r.spentCredits}</td>
                        <td className="px-4 py-3">{r.txCount}</td>
                        <td className="px-4 py-3">{r.selectedVisa}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            r.isAdmin
                              ? 'bg-violet-50 text-violet-700 border-violet-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {r.isAdmin ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(r.lastLoginAt)}</td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/usuarios/${r.uid}`}>
                            <span className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs cursor-pointer">
                              Ver completo <HiArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
