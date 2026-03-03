// SHA-256 of "tg891218"
const ADMIN_PASS_HASH = '7f70389ae1e6f94f98e7d0254a496d518d4b46c3cbeed031ae0f7980daebd59a';
const ADMIN_EMAIL = 'thiago.giordano@gmail.com';
const SESSION_KEY = 'rc_admin_auth';

const sha256 = async (text: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const adminLogin = async (email: string, password: string): Promise<boolean> => {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) return false;
  const hash = await sha256(password);
  if (hash !== ADMIN_PASS_HASH) return false;
  sessionStorage.setItem(SESSION_KEY, '1');
  return true;
};

export const adminLogout = () => sessionStorage.removeItem(SESSION_KEY);

export const isAdminAuthenticated = () => sessionStorage.getItem(SESSION_KEY) === '1';
