import { useState, useEffect } from 'react';

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

  return csrfToken;
}