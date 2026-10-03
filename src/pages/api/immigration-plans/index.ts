import type { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../lib/server/firebase-admin';
import { requireAuth } from '../../../lib/server/auth';
import { enforceRateLimit } from '../../../lib/server/rate-limit';
import { analyzeDestinations, createPlanSteps, findRoute, isProfile, type DiagnosticProfile } from '../../../lib/global-guide';

const COST = 3;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const collection = adminDb.collection('immigrationPlans').doc(user.uid).collection('items');
  if (req.method === 'GET') {
    const snapshot = await collection.orderBy('createdAt', 'desc').limit(20).get();
    return res.status(200).json({ plans: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.()?.toISOString(), updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() })) });
  }
  if (!await enforceRateLimit(res, { scope: 'immigration-plan', key: user.uid, limit: 10, windowSeconds: 3600 })) return;
  const { requestId, countryId, routeId, profile } = req.body as { requestId?: string; countryId?: string; routeId?: string; profile?: DiagnosticProfile };
  if (!requestId || !/^[a-f0-9-]{36}$/.test(requestId) || !countryId || !routeId || !isProfile(profile)) return res.status(400).json({ error: 'Dados inválidos' });
  const found = findRoute(countryId, routeId);
  if (!found || !analyzeDestinations(profile).some((item) => item.countryId === countryId && item.routeId === routeId)) return res.status(400).json({ error: 'Rota não indicada para este perfil' });
  const steps = createPlanSteps(found.country.id, routeId, profile);
  const planRef = collection.doc(requestId);
  const userRef = adminDb.collection('users').doc(user.uid);
  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const [planDoc, userDoc] = await Promise.all([tx.get(planRef), tx.get(userRef)]);
      if (planDoc.exists) return { status: 200, plan: { id: requestId, ...planDoc.data() }, alreadyCreated: true };
      if (!userDoc.exists) return { status: 404, error: 'Conta não encontrada' };
      const data = userDoc.data() || {};
      const isAdmin = data.isAdmin === true || data.role === 'admin' || data.role === 'super_admin';
      const balance = Number(data.credits) || 0;
      if (!isAdmin && balance < COST) return { status: 402, error: 'Saldo de créditos insuficiente', required: COST, currentBalance: balance };
      const plan = { countryId: found.country.id, routeId, profile, steps, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
      tx.set(planRef, plan);
      if (!isAdmin) {
        tx.update(userRef, { credits: balance - COST, updatedAt: FieldValue.serverTimestamp() });
        tx.set(userRef.collection('creditHistory').doc(requestId), { userId: user.uid, type: 'spend', amount: -COST, balanceAfter: balance - COST, feature: 'immigration_plan', description: `Roteiro de imigração: ${found.country.name}`, createdAt: FieldValue.serverTimestamp() });
      }
      return { status: 201, plan: { id: requestId, countryId: found.country.id, routeId, profile, steps }, newBalance: isAdmin ? balance : balance - COST };
    });
    return res.status(result.status).json(result);
  } catch (error) {
    console.error('Immigration plan transaction failed:', error);
    return res.status(500).json({ error: 'Não foi possível salvar o roteiro. Nenhum crédito foi consumido.' });
  }
}
