#!/usr/bin/env node
// =============================================================================
// Script: add-credits.js
// Uso: node scripts/add-credits.js <email|uid> <quantidade> [motivo]
//
// Exemplos:
//   node scripts/add-credits.js user@email.com 50
//   node scripts/add-credits.js user@email.com 100 "Bônus de boas-vindas"
//   node scripts/add-credits.js abc123uid 30 "Correção manual"
//
// Requer: scripts/serviceAccountKey.json (baixe no Firebase Console)
// =============================================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const admin = require('firebase-admin');

// ─── Configuração ─────────────────────────────────────────────────────────────

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, 'serviceAccountKey.json');

let serviceAccount;
try {
  serviceAccount = require(SERVICE_ACCOUNT_PATH);
} catch {
  console.error('\n❌  Arquivo de service account não encontrado!');
  console.error(`   Esperado em: ${SERVICE_ACCOUNT_PATH}`);
  console.error('\n📋  Como obter o arquivo:');
  console.error('   1. Acesse: https://console.firebase.google.com/project/guia-imigracao-app/settings/serviceaccounts/adminsdk');
  console.error('   2. Clique em "Gerar nova chave privada"');
  console.error('   3. Salve como: scripts/serviceAccountKey.json');
  console.error('   4. ⚠️  NUNCA faça commit desse arquivo!\n');
  process.exit(1);
}

// Inicializa Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function printUsage() {
  console.log('\n📖  Uso:');
  console.log('   node scripts/add-credits.js <email|uid> <quantidade> [motivo]\n');
  console.log('📝  Exemplos:');
  console.log('   node scripts/add-credits.js user@email.com 50');
  console.log('   node scripts/add-credits.js user@email.com 100 "Bônus de boas-vindas"');
  console.log('   node scripts/add-credits.js abc123uid 30 "Correção manual"\n');
}

function isEmail(value) {
  return value.includes('@');
}

async function resolveUid(emailOrUid) {
  if (isEmail(emailOrUid)) {
    try {
      const user = await auth.getUserByEmail(emailOrUid);
      return { uid: user.uid, email: user.email, displayName: user.displayName };
    } catch {
      throw new Error(`Usuário com email "${emailOrUid}" não encontrado.`);
    }
  } else {
    try {
      const user = await auth.getUser(emailOrUid);
      return { uid: user.uid, email: user.email, displayName: user.displayName };
    } catch {
      throw new Error(`Usuário com UID "${emailOrUid}" não encontrado.`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [, , emailOrUid, amountStr, ...reasonParts] = process.argv;

  // Validar argumentos
  if (!emailOrUid || !amountStr) {
    printUsage();
    process.exit(1);
  }

  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount === 0) {
    console.error('\n❌  Quantidade inválida. Use um número inteiro (positivo para adicionar, negativo para remover).\n');
    process.exit(1);
  }

  const reason = reasonParts.join(' ') || (amount > 0 ? 'Adição manual de créditos' : 'Remoção manual de créditos');

  console.log('\n🔍  Buscando usuário...');

  let userInfo;
  try {
    userInfo = await resolveUid(emailOrUid);
  } catch (err) {
    console.error(`\n❌  ${err.message}\n`);
    process.exit(1);
  }

  const { uid, email, displayName } = userInfo;

  console.log(`\n👤  Usuário encontrado:`);
  console.log(`    Nome:  ${displayName || '(sem nome)'}`);
  console.log(`    Email: ${email}`);
  console.log(`    UID:   ${uid}`);

  // Buscar saldo atual
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error('\n❌  Documento do usuário não encontrado no Firestore.');
    console.error('   O usuário pode não ter completado o cadastro.\n');
    process.exit(1);
  }

  const currentCredits = userDoc.data().credits ?? 0;
  const newBalance = currentCredits + amount;

  if (newBalance < 0) {
    console.error(`\n❌  Saldo insuficiente para remover ${Math.abs(amount)} créditos.`);
    console.error(`   Saldo atual: ${currentCredits} créditos.\n`);
    process.exit(1);
  }

  console.log(`\n💳  Operação:`);
  console.log(`    Saldo atual:  ${currentCredits} créditos`);
  console.log(`    Alteração:    ${amount > 0 ? '+' : ''}${amount} créditos`);
  console.log(`    Novo saldo:   ${newBalance} créditos`);
  console.log(`    Motivo:       ${reason}`);

  // Confirmação
  console.log('\n⚠️   Confirmar operação? (s/n): ');

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question('', async (answer) => {
    rl.close();

    if (answer.toLowerCase() !== 's') {
      console.log('\n🚫  Operação cancelada.\n');
      process.exit(0);
    }

    console.log('\n⏳  Aplicando alteração...');

    try {
      await db.runTransaction(async (transaction) => {
        // Re-ler o doc dentro da transação para garantir consistência
        const freshDoc = await transaction.get(userRef);
        const freshCredits = freshDoc.data().credits ?? 0;
        const finalBalance = freshCredits + amount;

        if (finalBalance < 0) {
          throw new Error(`Saldo insuficiente na transação: ${freshCredits} disponíveis.`);
        }

        // Atualizar saldo
        transaction.update(userRef, {
          credits: finalBalance,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Registrar no histórico de créditos
        const historyRef = db.collection('users').doc(uid).collection('creditHistory').doc();
        transaction.set(historyRef, {
          userId: uid,
          type: amount > 0 ? 'bonus' : 'spend',
          amount: amount,
          balanceAfter: finalBalance,
          description: reason,
          source: 'admin_script',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      console.log('\n✅  Créditos atualizados com sucesso!');
      console.log(`    ${displayName || email} agora tem ${newBalance} créditos.\n`);

    } catch (err) {
      console.error(`\n❌  Erro ao aplicar alteração: ${err.message}\n`);
      process.exit(1);
    }

    process.exit(0);
  });
}

main().catch((err) => {
  console.error(`\n💥  Erro inesperado: ${err.message}\n`);
  process.exit(1);
});
