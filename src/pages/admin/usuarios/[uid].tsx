import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  writeBatch,
  where,
} from 'firebase/firestore';
import { Layout } from '../../../components/layout/Layout';
import { useAuth } from '../../../hooks/useAuth';
import { useCredits } from '../../../hooks/useCredits';
import { db } from '../../../lib/firebase';
import { isAdminUser } from '../../../lib/stripe';
import { TrainingSession } from '../../../lib/training-history';
import {
  HiArrowLeft,
  HiUser,
  HiEnvelope,
  HiCreditCard,
  HiSparkles,
  HiAcademicCap,
  HiClock,
  HiCheckCircle,
  HiTrash,
} from 'react-icons/hi2';

type FirestoreDate = { toDate?: () => Date } | Date | null | undefined;

interface CreditEntry {
  id: string;
  type: 'purchase' | 'spend' | 'bonus' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt?: FirestoreDate;
}

interface UserDetails {
  isAdmin: boolean;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  credits: number;
  totalCreditsEarned: number;
  recommendedVisa?: string;
  selectedVisa?: string;
  subscriptionStatus?: string;
  hasCompletedQuestionnaire?: boolean;
  interviewsPracticed?: number;
  createdAt?: FirestoreDate;
  lastLoginAt?: FirestoreDate;
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

function formatDateTime(value: FirestoreDate): string {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleString('pt-BR');
}

export default function AdminUserDetailsPage() {
  const router = useRouter();
  const { uid } = router.query;
  const { user, loading } = useAuth();
  const { isAdmin, loading: creditsLoading } = useCredits();

  const [target, setTarget] = useState<UserDetails | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Record<string, unknown> | null>(null);
  const [trainingStats, setTrainingStats] = useState<Record<string, unknown> | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [history, setHistory] = useState<CreditEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (!loading && !creditsLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [loading, creditsLoading, user, isAdmin, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || !isAdmin || !uid || Array.isArray(uid)) return;
      setLoadingData(true);
      try {
        const userRef = doc(db, 'users', uid);
        const questionnaireRef = doc(db, 'questionnaires', uid);
        const trainingStatsRef = doc(db, 'training_stats', uid);

        const [userSnap, questionnaireSnap, statsSnap, sessionsSnap, historySnap] = await Promise.all([
          getDoc(userRef),
          getDoc(questionnaireRef),
          getDoc(trainingStatsRef),
          getDocs(
            query(
              collection(db, 'training_sessions'),
              where('userId', '==', uid),
              limit(20)
            )
          ),
          getDocs(
            query(
              collection(db, 'users', uid, 'creditHistory'),
              orderBy('createdAt', 'desc'),
              limit(30)
            )
          ),
        ]);

        if (!userSnap.exists()) {
          setTarget(null);
          return;
        }

        const userData = userSnap.data() as Record<string, unknown>;
        const role = (userData.role as string) || 'user';
        const targetIsAdmin = isAdminUser({
          isAdmin: userData.isAdmin as boolean | undefined,
          isPremium: userData.isPremium as boolean | undefined,
          role,
        });
        setTarget({
          uid,
          email: (userData.email as string) || '—',
          displayName:
            (userData.displayName as string) ||
            (userData.fullName as string) ||
            (userData.name as string) ||
            'Usuário',
          role,
          isAdmin: targetIsAdmin,
          credits: typeof userData.credits === 'number' ? userData.credits : 0,
          totalCreditsEarned: typeof userData.totalCreditsEarned === 'number' ? userData.totalCreditsEarned : 0,
          recommendedVisa: userData.recommendedVisa as string | undefined,
          selectedVisa: userData.selectedVisa as string | undefined,
          subscriptionStatus: userData.subscriptionStatus as string | undefined,
          hasCompletedQuestionnaire: userData.hasCompletedQuestionnaire as boolean | undefined,
          interviewsPracticed: userData.interviewsPracticed as number | undefined,
          createdAt: userData.createdAt as FirestoreDate,
          lastLoginAt: userData.lastLoginAt as FirestoreDate,
        });

        setQuestionnaire(questionnaireSnap.exists() ? (questionnaireSnap.data() as Record<string, unknown>) : null);
        setTrainingStats(statsSnap.exists() ? (statsSnap.data() as Record<string, unknown>) : null);

        const rawSessions = sessionsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as TrainingSession[];

        rawSessions.sort((a, b) => {
          const ta = toDate(a.createdAt)?.getTime() ?? 0;
          const tb = toDate(b.createdAt)?.getTime() ?? 0;
          return tb - ta;
        });
        setSessions(rawSessions);

        const creditHistory = historySnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CreditEntry, 'id'>),
        }));
        setHistory(creditHistory);
      } catch (error) {
        console.error('Erro ao carregar detalhe do usuário:', error);
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [user, isAdmin, uid]);

  const creditTotals = useMemo(() => {
    return history.reduce(
      (acc, entry) => {
        if (entry.type === 'purchase' && entry.amount > 0) acc.purchased += entry.amount;
        if (entry.type === 'spend' && entry.amount < 0) acc.spent += Math.abs(entry.amount);
        return acc;
      },
      { purchased: 0, spent: 0 }
    );
  }, [history]);

  const handleDeleteUserData = async () => {
    if (!target || deleting) return;
    setDeleting(true);
    try {
      const batch = writeBatch(db);

      // Docs diretos por UID
      batch.delete(doc(db, 'users', target.uid));
      batch.delete(doc(db, 'questionnaires', target.uid));
      batch.delete(doc(db, 'training_stats', target.uid));
      batch.delete(doc(db, 'visaPaths', target.uid));
      batch.delete(doc(db, 'ds160', target.uid));

      // Histórico de créditos (subcoleção)
      const creditSnap = await getDocs(collection(db, 'users', target.uid, 'creditHistory'));
      creditSnap.forEach((d) => batch.delete(d.ref));

      // Coleções por userId
      const [trainingSessionsSnap, analysisSnap, chatSnap] = await Promise.all([
        getDocs(query(collection(db, 'training_sessions'), where('userId', '==', target.uid))),
        getDocs(query(collection(db, 'analysisResults'), where('userId', '==', target.uid))),
        getDocs(query(collection(db, 'chatSessions'), where('userId', '==', target.uid))),
      ]);

      trainingSessionsSnap.forEach((d) => batch.delete(d.ref));
      analysisSnap.forEach((d) => batch.delete(d.ref));
      chatSnap.forEach((d) => batch.delete(d.ref));

      // Leads pelo email (se existir)
      if (target.email && target.email !== '—') {
        const leadsSnap = await getDocs(query(collection(db, 'leads'), where('email', '==', target.email)));
        leadsSnap.forEach((d) => batch.delete(d.ref));
      }

      await batch.commit();
      setFeedbackModal({
        open: true,
        type: 'success',
        title: 'Usuário excluído',
        message: `Os dados de "${target.displayName}" foram removidos com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao excluir dados do usuário:', error);
      setFeedbackModal({
        open: true,
        type: 'error',
        title: 'Erro ao excluir',
        message: 'Não foi possível excluir os dados do usuário. Verifique as permissões de admin.',
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

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
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
                <HiArrowLeft className="w-4 h-4" />
                Voltar ao painel
              </span>
            </Link>
            {target && (
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <HiTrash className="w-4 h-4" />
                {deleting ? 'Excluindo...' : 'Excluir Usuário'}
              </button>
            )}
          </div>

          {loadingData ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !target ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
              Usuário não encontrado.
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-blue-600">Detalhe do usuário</p>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">{target.displayName}</h1>
                    <p className="text-slate-500 text-sm">{target.email}</p>
                    <p className="text-xs text-slate-400 mt-2">UID: {target.uid}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Créditos atuais</p>
                      <p className="text-xl font-black text-slate-900">{target.credits}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Comprados</p>
                      <p className="text-xl font-black text-emerald-700">{creditTotals.purchased}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Gastos</p>
                      <p className="text-xl font-black text-rose-700">{creditTotals.spent}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Treinos</p>
                      <p className="text-xl font-black text-blue-700">{sessions.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <HiUser className="w-5 h-5 text-blue-600" />
                      Visão do usuário na plataforma
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-500 text-xs">Visto recomendado</p>
                        <p className="font-semibold text-slate-800">{target.recommendedVisa || '—'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-500 text-xs">Visto selecionado</p>
                        <p className="font-semibold text-slate-800">{target.selectedVisa || '—'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-500 text-xs">Questionário</p>
                        <p className="font-semibold text-slate-800">{target.hasCompletedQuestionnaire ? 'Completo' : 'Pendente'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-500 text-xs">Modelo de acesso</p>
                        <p className="font-semibold text-slate-800">{target.isAdmin ? 'Admin' : 'Por créditos'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-500 text-xs">Treinos registrados</p>
                        <p className="font-semibold text-slate-800">{target.interviewsPracticed ?? 0}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-500 text-xs">Total de créditos ganhos</p>
                        <p className="font-semibold text-slate-800">{target.totalCreditsEarned}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <HiAcademicCap className="w-5 h-5 text-violet-600" />
                      Histórico de treinamento
                    </h2>
                    {sessions.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhuma sessão registrada.</p>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((s) => (
                          <div key={s.id} className="rounded-xl border border-slate-100 p-4">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <p className="font-semibold text-slate-900 text-sm">{s.scenarioName}</p>
                              <span className="text-xs text-slate-500">{formatDate(s.createdAt)}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                              <span className="inline-flex items-center gap-1"><HiSparkles className="w-3.5 h-3.5" /> {s.visaType}</span>
                              <span className="inline-flex items-center gap-1"><HiClock className="w-3.5 h-3.5" /> {s.duration ?? 0}s</span>
                              <span className="inline-flex items-center gap-1"><HiCheckCircle className="w-3.5 h-3.5" /> {s.completed ? 'Completo' : 'Incompleto'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <HiCreditCard className="w-5 h-5 text-amber-600" />
                      Histórico de créditos
                    </h2>
                    {history.length === 0 ? (
                      <p className="text-sm text-slate-500">Sem transações registradas.</p>
                    ) : (
                      <div className="space-y-2">
                        {history.map((h) => (
                          <div key={h.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{h.description}</p>
                              <p className="text-xs text-slate-500">{formatDateTime(h.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${h.amount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {h.amount >= 0 ? '+' : ''}{h.amount}
                              </p>
                              <p className="text-xs text-slate-500">Saldo: {h.balanceAfter}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="font-bold text-slate-900 mb-3">Conta</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-700 inline-flex items-center gap-2"><HiEnvelope className="w-4 h-4 text-slate-400" />{target.email}</p>
                      <p className="text-slate-700">Role: <span className="font-semibold">{target.role}</span></p>
                      <p className="text-slate-700">Criado em: <span className="font-semibold">{formatDate(target.createdAt)}</span></p>
                      <p className="text-slate-700">Último login: <span className="font-semibold">{formatDate(target.lastLoginAt)}</span></p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="font-bold text-slate-900 mb-3">Questionário</h3>
                    {!questionnaire ? (
                      <p className="text-sm text-slate-500">Não preenchido.</p>
                    ) : (
                      <div className="space-y-2 text-sm text-slate-700">
                        <p>Profissão: <span className="font-semibold">{(questionnaire.occupation as string) || '—'}</span></p>
                        <p>Objetivo: <span className="font-semibold">{(questionnaire.immigrationGoal as string) || '—'}</span></p>
                        <p>Nível de inglês: <span className="font-semibold">{(questionnaire.englishLevel as string) || '—'}</span></p>
                        <p>Experiência: <span className="font-semibold">{(questionnaire.yearsOfExperience as string) || '—'}</span></p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="font-bold text-slate-900 mb-3">Estatísticas de treino</h3>
                    {!trainingStats ? (
                      <p className="text-sm text-slate-500">Sem estatísticas.</p>
                    ) : (
                      <div className="space-y-2 text-sm text-slate-700">
                        <p>Sessões totais: <span className="font-semibold">{(trainingStats.totalSessions as number) || 0}</span></p>
                        <p>Sessões completas: <span className="font-semibold">{(trainingStats.completedSessions as number) || 0}</span></p>
                        <p>Mensagens: <span className="font-semibold">{(trainingStats.totalMessages as number) || 0}</span></p>
                        <p>Visto favorito: <span className="font-semibold">{(trainingStats.favoriteVisaType as string) || '—'}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showDeleteModal && target && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <HiTrash className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Você está prestes a excluir os dados de <span className="font-semibold text-slate-800">{target.displayName}</span>.
              Essa ação é irreversível.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUserData}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                <HiTrash className="w-4 h-4" />
                {deleting ? 'Excluindo...' : 'Excluir agora'}
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackModal.open && (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
              feedbackModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              <HiCheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{feedbackModal.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{feedbackModal.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setFeedbackModal((prev) => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Fechar
              </button>
              {feedbackModal.type === 'success' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Voltar ao painel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
