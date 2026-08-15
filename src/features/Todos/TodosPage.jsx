import { useEffect, useState } from 'react';
import TodoForm from './TodoForm.jsx';
import TodoList from './TodoList/TodoList.jsx';

function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      setIsTodoListLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          limit: 100,
        });
        const response = await fetch(`/api/tasks?${params}`, {
          headers: {
            'X-CSRF-TOKEN': token,
          },
          credentials: 'include',
        });

        if (response.status === 401) {
          throw new Error('unauthorized');
        }

        if (!response.ok) {
          throw new Error('Unable to fetch todos');
        }

        const data = await response.json();
        setTodoList(data.tasks);
      } catch (caughtError) {
        setError(caughtError.message);
      } finally {
        setIsTodoListLoading(false);
      }
    };

    if (token) {
      fetchTodos();
    }
  }, [token]);

  async function addTodo(todoTitle) {
    const newTodo = {
      id: Date.now(),
      title: todoTitle,
      isCompleted: false,
    };

    setTodoList(previous => [newTodo, ...previous]);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newTodo.title,
          isCompleted: newTodo.isCompleted,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to add todo');
      }

      const savedTodo = data.task ?? data;
      setTodoList(previous =>
        previous.map(todo => todo.id === newTodo.id ? savedTodo : todo)
      );
    } catch (caughtError) {
      setTodoList(previous =>
        previous.filter(todo => todo.id !== newTodo.id)
      );
      setError(caughtError.message);
    }
  }

  async function completeTodo(id) {
    const originalTodo = todoList.find(todo => todo.id === id);

    setTodoList(previous =>
      previous.map(todo =>
        todo.id === id ? { ...todo, isCompleted: true } : todo
      )
    );
    setError('');

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({ isCompleted: true }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Unable to complete todo');
      }
    } catch (caughtError) {
      if (originalTodo) {
        setTodoList(previous =>
          previous.map(todo => todo.id === id ? originalTodo : todo)
        );
      }
      setError(caughtError.message);
    }
  }

  async function updateTodo(editedTodo) {
    const originalTodo = todoList.find(todo => todo.id === editedTodo.id);

    setTodoList(previous =>
      previous.map(todo =>
        todo.id === editedTodo.id ? { ...editedTodo } : todo
      )
    );
    setError('');

    try {
      const response = await fetch(`/api/tasks/${editedTodo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editedTodo.title,
          isCompleted: editedTodo.isCompleted,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Unable to update todo');
      }
    } catch (caughtError) {
      if (originalTodo) {
        setTodoList(previous =>
          previous.map(todo =>
            todo.id === editedTodo.id ? originalTodo : todo
          )
        );
      }
      setError(caughtError.message);
    }
  }

  return (
    <>
      {error && (
        <section role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setError('')}>
            Clear Error
          </button>
        </section>
      )}
      {isTodoListLoading && <p>Loading todos...</p>}
      <TodoForm onAddTodo={addTodo} />
      {!isTodoListLoading && (
        <TodoList
          todoList={todoList}
          onCompleteTodo={completeTodo}
          onUpdateTodo={updateTodo}
        />
      )}
    </>
  );
}

export default TodosPage;
