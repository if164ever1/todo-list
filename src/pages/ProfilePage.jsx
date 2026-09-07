import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function ProfilePage() {
  const { email: userName, token, isAuthenticated } = useAuth();
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    active: 0,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTodoStatistics() {
      if (!token) return;

      setIsLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({ limit: 100 });
        const response = await fetch(`/api/tasks?${params}`, {
          method: 'GET',
          headers: {
            'X-CSRF-TOKEN': token,
          },
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }

        const data = await response.json();
        const todos = Array.isArray(data) ? data : data.tasks ?? [];
        const completed = todos.filter((todo) => todo.isCompleted).length;

        setStatistics({
          total: todos.length,
          completed,
          active: todos.length - completed,
        });
      } catch (caughtError) {
        if (caughtError.name !== 'AbortError') {
          setError(`Error loading statistics: ${caughtError.message}`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchTodoStatistics();

    return () => controller.abort();
  }, [token]);

  const completionPercentage = statistics.total
    ? Math.round((statistics.completed / statistics.total) * 100)
    : 0;

  return (
    <main>
      <h2>User Profile</h2>

      <section>
        <h3>Account Information</h3>
        <p>Name: {userName || 'Unknown user'}</p>
        <p>Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
      </section>

      <section>
        <h3>Todo Statistics</h3>
        {isLoading && <p>Loading statistics...</p>}
        {error && <p role="alert">{error}</p>}
        {!isLoading && !error && (
          <dl>
            <dt>Total</dt>
            <dd>{statistics.total}</dd>
            <dt>Completed</dt>
            <dd>{statistics.completed}</dd>
            <dt>Active</dt>
            <dd>{statistics.active}</dd>
            {statistics.total > 0 && (
              <>
                <dt>Completion</dt>
                <dd>{completionPercentage}%</dd>
              </>
            )}
          </dl>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
