import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function ProfilePage() {
  const { email: userName, token, isAuthenticated } = useAuth();
  const [todoStats, setTodoStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodoStats() {
      if (!token) return;

      try {
        setLoading(true);
        setError('');

        const options = {
          method: 'GET',
          headers: { 'X-CSRF-TOKEN': token },
          credentials: 'include',
        };

        const response = await fetch('/api/tasks', options);

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }

        const todos = await response.json();
        const completed = todos.filter((todo) => todo.isCompleted).length;

        setTodoStats({
          total: todos.length,
          completed,
          active: todos.length - completed,
        });
      } catch (err) {
        setError(`Error loading statistics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchTodoStats();
  }, [token]);

  const completionPercentage = todoStats.total
    ? Math.round((todoStats.completed / todoStats.total) * 100)
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
        {loading && <p>Loading statistics...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && (
          <>
            {todoStats.total === 0 && <p>You do not have any todos yet.</p>}
            <dl>
              <dt>Total</dt>
              <dd>{todoStats.total}</dd>
              <dt>Completed</dt>
              <dd>{todoStats.completed}</dd>
              <dt>Active</dt>
              <dd>{todoStats.active}</dd>
              {todoStats.total > 0 && (
                <>
                  <dt>Completion</dt>
                  <dd>{completionPercentage}%</dd>
                </>
              )}
            </dl>
          </>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
