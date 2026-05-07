import { NextApiRequest, NextApiResponse } from 'next';
import { spendCredits } from '../../../lib/credits';
import { FEATURE_COSTS, FeatureKey, isAdminUser } from '../../../lib/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/**
 * POST /api/credits/spend
 * Body: { userId: string, feature: FeatureKey }
 *
 * Consome créditos de forma segura no servidor.
 * Admins não gastam créditos.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, feature } = req.body as {
      userId: string;
      feature: FeatureKey;
    };

    if (!userId || !feature) {
      return res.status(400).json({ error: 'Missing userId or feature' });
    }

    if (!(feature in FEATURE_COSTS)) {
      return res.status(400).json({ error: `Invalid feature: ${feature}` });
    }

    // Verifica se é admin (admins não gastam créditos)
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const adminCheck = isAdminUser({
      isAdmin: userData.isAdmin,
      isPremium: userData.isPremium,
      role: userData.role,
    });

    if (adminCheck) {
      return res.status(200).json({ success: true, newBalance: userData.credits ?? 0, isAdmin: true });
    }

    // Consome créditos
    const result = await spendCredits(userId, feature);

    if (!result.success) {
      return res.status(402).json({
        error: result.error ?? 'Saldo de créditos insuficiente',
        currentBalance: userData.credits ?? 0,
        required: FEATURE_COSTS[feature],
      });
    }

    return res.status(200).json({ success: true, newBalance: result.newBalance });
  } catch (error: any) {
    console.error('Error spending credits:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
