import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function Logoff() {
  const { logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOff, setIsLoggingOff] = useState(false);

  const handleLogout = async () => {
    setLogoutError('');
    setIsLoggingOff(true);

    try {
      const result = await logout();

      if (!result.success) {
        setLogoutError(result.error);
      }
    } catch (error) {
      setLogoutError(`Error: ${error.name} | ${error.message}`);
    } finally {
      setIsLoggingOff(false);
    }
  };

  return (
    <div>
      {logoutError && <p role="alert">{logoutError}</p>}
      <button type="button" onClick={handleLogout} disabled={isLoggingOff}>
        {isLoggingOff ? 'Logging off...' : 'Log Off'}
      </button>
    </div>
  );
}

export default Logoff;
