import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Redireciona automaticamente /subscription para /comprar-creditos.
 * Mantido para compatibilidade com links antigos.
 */
export default function SubscriptionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/comprar-creditos');
  }, [router]);
  return null;
}
