import type { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../lib/server/firebase-admin';
import { requireAuth } from '../../../lib/server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;
  const id = req.query.id;
  const { stepId, completed } = req.body as { stepId?: string; completed?: boolean };
  if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id) || typeof stepId !== 'string' || typeof completed !== 'boolean') return res.status(400).json({ error: 'Dados inválidos' });
  const ref = adminDb.collection('immigrationPlans').doc(user.uid).collection('items').doc(id);
  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      const steps = snap.data()?.steps;
      if (!Array.isArray(steps) || !steps.some((step) => step.id === stepId)) return null;
      const updated = steps.map((step) => step.id === stepId ? { ...step, completed } : step);
      tx.update(ref, { steps: updated, updatedAt: FieldValue.serverTimestamp() });
      return updated;
    });
    if (!result) return res.status(404).json({ error: 'Roteiro ou etapa não encontrada' });
    return res.status(200).json({ steps: result });
  } catch (error) {
    console.error('Immigration plan update failed:', error);
    return res.status(500).json({ error: 'Não foi possível atualizar a etapa' });
  }
}
