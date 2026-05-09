import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { CREDIT_PACKAGES, FEATURE_COSTS, formatPrice } from '../lib/stripe';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  HiCreditCard,
  HiShieldCheck,
} from 'react-icons/hi';
import {
  HiArrowRight,
  HiSparkles,
  HiRocketLaunch,
  HiAcademicCap,
  HiDocumentText,
  HiMicrophone,
  HiGlobeAlt,
  HiArrowPath,
  HiPlusCircle,
} from 'react-icons/hi2';

interface CreditHistoryEntry {
  id: string;
  type: 'purchase' | 'spend' | 'bonus' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: any;
}

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  purchase: { label: 'Compra',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  spend:    { label: 'Uso',     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  bonus:    { label: 'Bônus',   cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  refund:   { label: 'Reemb.', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function GerenciarCreditos() {
  const { user, userProfile } = useAuth();
  const { credits, loading: creditsLoading, isAdmin } = useCredits();
  const router = useRouter();
  const [history, setHistory] = useState<CreditHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Carrega histórico de transações
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      try {
        const histRef = collection(db, 'users', user.uid, 'creditHistory');
        const q = query(histRef, orderBy('createdAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        const entries = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CreditHistoryEntry[];
        setHistory(entries);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  if (!user) return null;

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── Breadcrumb ──────────────────────────────── */}
          <div className="flex items-center gap-3 mb-2">
            <Link href="/perfil">
              <span className="text-sm text-slate-500 hover:text-slate-700 cursor-pointer">← Perfil</span>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Meus Créditos</h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie seu saldo e histórico de créditos.</p>
          </div>

          {/* ── Saldo atual ─────────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'radial-gradient(circle at 80% 20%, #fff, transparent 60%)'
            }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Saldo Disponível</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-6xl font-black">
                    {creditsLoading ? '—' : isAdmin ? '∞' : credits}
                  </span>
                  <span className="text-white/70 text-lg font-medium">créditos</span>
                </div>
                {isAdmin && (
                  <p className="text-white/80 text-sm">Conta admin — créditos ilimitados</p>
                )}
                {!isAdmin && !creditsLoading && (
                  <p className="text-white/70 text-sm">
                    ≈ {Math.floor(credits / FEATURE_COSTS.training)} treino{Math.floor(credits / FEATURE_COSTS.training) !== 1 ? 's' : ''} de entrevista disponíveis
                  </p>
                )}
              </div>
              <Link href="/comprar-creditos">
                <button className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors shadow-lg">
                  <HiPlusCircle className="w-4 h-4" />
                  Comprar Créditos
                </button>
              </Link>
            </div>
          </div>

          {/* ── Custo por funcionalidade ─────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HiSparkles className="w-5 h-5 text-amber-500" /> Custo por funcionalidade
            </h3>
            <div className="space-y-3">
              {[
                { icon: <HiAcademicCap className="w-4 h-4 text-blue-500" />, label: 'Treinamento de entrevista (texto)', cost: FEATURE_COSTS.training },
                { icon: <HiMicrophone className="w-4 h-4 text-emerald-500" />, label: 'Treinamento com modo voz', cost: FEATURE_COSTS.training_voice },
                { icon: <HiDocumentText className="w-4 h-4 text-violet-500" />, label: 'Assistente DS-160', cost: FEATURE_COSTS.ds160 },
                { icon: <HiGlobeAlt className="w-4 h-4 text-amber-500" />, label: 'Análise EB2-NIW com IA', cost: FEATURE_COSTS.eb2niw },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    {f.icon}
                    {f.label}
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {f.cost} crédito{f.cost > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pacotes rápidos ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <HiRocketLaunch className="w-5 h-5 text-blue-500" /> Comprar créditos
              </h3>
              <Link href="/comprar-creditos" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Ver todos <HiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(CREDIT_PACKAGES).map((pkg) => (
                <Link href="/comprar-creditos" key={pkg.id}>
                  <div className={`rounded-xl border-2 p-3 text-center cursor-pointer hover:shadow-md transition-all ${
                    pkg.highlight ? 'border-blue-300 bg-blue-50' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <span className="text-lg">{pkg.emoji}</span>
                    <p className="font-bold text-slate-900 text-sm mt-1">{pkg.totalCredits}</p>
                    <p className="text-xs text-slate-400">créditos</p>
                    <p className={`text-xs font-semibold mt-1 ${pkg.highlight ? 'text-blue-600' : 'text-slate-600'}`}>
                      {formatPrice(pkg.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Histórico ────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HiArrowPath className="w-5 h-5 text-slate-400" /> Histórico de Créditos
            </h3>

            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <HiCreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma transação ainda.</p>
                <Link href="/comprar-creditos">
                  <button className="mt-3 text-xs text-blue-600 font-medium hover:text-blue-700">
                    Comprar créditos →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => {
                  const typeInfo = TYPE_LABELS[entry.type] ?? { label: entry.type, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
                  const isPositive = entry.amount > 0;
                  const date = entry.createdAt?.toDate
                    ? entry.createdAt.toDate()
                    : entry.createdAt
                    ? new Date(entry.createdAt)
                    : null;

                  return (
                    <div key={entry.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${typeInfo.cls}`}>
                        {typeInfo.label}
                      </span>
                      <p className="flex-1 text-sm text-slate-600 truncate">{entry.description}</p>
                      <div className="text-right shrink-0">
                        <p className={`font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {isPositive ? '+' : ''}{entry.amount}
                        </p>
                        {date && (
                          <p className="text-xs text-slate-400">
                            {date.toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Trust ────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-3 text-sm text-slate-500">
            <HiShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <p>Créditos não expiram. Pagamentos processados com segurança via Stripe.</p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
