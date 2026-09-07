import { useEffect, useReducer } from 'react';
import TodoForm from './TodoForm.jsx';
import TodoList from './TodoList/TodoList.jsx';
import SortBy from '../../shared/SortBy.jsx';
import FilterInput from '../../shared/FilterInput.jsx';
import useDebounce from '../../utils/useDebounce.js';
import {
  initialTodoState,
  TODO_ACTIONS,
  todoReducer,
} from '../../reducers/todoReducer.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

function TodosPage() {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  const {
    todoList,
    error,
    filterError,
    isTodoListLoading,
    sortBy,
    sortDirection,
    filterTerm,
    dataVersion,
  } = state;
  const debouncedFilterTerm = useDebounce(filterTerm, 300);

  const handleFilterChange = (newTerm) => {
    dispatch({ type: TODO_ACTIONS.SET_FILTER, payload: newTerm });
  };

  const handleSortByChange = (newSortBy) => {
    dispatch({
      type: TODO_ACTIONS.SET_SORT,
      payload: { sortBy: newSortBy, sortDirection },
    });
  };

  const handleSortDirectionChange = (newSortDirection) => {
    dispatch({
      type: TODO_ACTIONS.SET_SORT,
      payload: { sortBy, sortDirection: newSortDirection },
    });
  };

  useEffect(() => {
    const fetchTodos = async () => {
      dispatch({ type: TODO_ACTIONS.FETCH_START });

      try {
        const paramsObject = {
          sortBy,
          sortDirection,
          limit: 100,
        };

        if (debouncedFilterTerm) {
          paramsObject.find = debouncedFilterTerm;
        }

        const params = new URLSearchParams(paramsObject);
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
        const todos = data.tasks;
        dispatch({
          type: TODO_ACTIONS.FETCH_SUCCESS,
          payload: { todos },
        });
      } catch (error) {
        const isFilterError = Boolean(
          debouncedFilterTerm ||
          sortBy !== 'createdAt' ||
          sortDirection !== 'desc'
        );
        const message = isFilterError
          ? `Error filtering/sorting todos: ${error.message}`
          : `Error fetching todos: ${error.message}`;

        dispatch({
          type: TODO_ACTIONS.FETCH_ERROR,
          payload: { isFilterError, message },
        });
      }
    };

    if (token) {
      fetchTodos();
    }
  }, [token, sortBy, sortDirection, debouncedFilterTerm]);

  async function addTodo(todoTitle) {
    const newTodo = {
      id: Date.now(),
      title: todoTitle,
      isCompleted: false,
    };

    dispatch({ type: TODO_ACTIONS.ADD_TODO_START, payload: newTodo });

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
      dispatch({
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: { temporaryId: newTodo.id, savedTodo },
      });
    } catch (caughtError) {
      dispatch({
        type: TODO_ACTIONS.ADD_TODO_ERROR,
        payload: {
          temporaryId: newTodo.id,
          message: caughtError.message,
        },
      });
    }
  }

  async function completeTodo(id) {
    const originalTodo = todoList.find(todo => todo.id === id);

    dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_START, payload: id });

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

      dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS });
    } catch (caughtError) {
      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_ERROR,
        payload: { originalTodo, message: caughtError.message },
      });
    }
  }

  async function updateTodo(editedTodo) {
    const originalTodo = todoList.find(todo => todo.id === editedTodo.id);

    dispatch({ type: TODO_ACTIONS.UPDATE_TODO_START, payload: editedTodo });

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

      dispatch({ type: TODO_ACTIONS.UPDATE_TODO_SUCCESS });
    } catch (caughtError) {
      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_ERROR,
        payload: { originalTodo, message: caughtError.message },
      });
    }
  }

  return (
    <>
      {error && (
        <section role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: TODO_ACTIONS.CLEAR_ERROR })}
          >
            Clear Error
          </button>
        </section>
      )}
      {filterError && (
        <div>
          <p>{filterError}</p>
          <button
            type="button"
            onClick={() =>
              dispatch({ type: TODO_ACTIONS.CLEAR_FILTER_ERROR })
            }
          >
            Clear Filter Error
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: TODO_ACTIONS.RESET_FILTERS })}
          >
            Reset Filters
          </button>
        </div>
      )}
      {isTodoListLoading && <p>Loading todos...</p>}
      <SortBy
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={handleSortByChange}
        onSortDirectionChange={handleSortDirectionChange}
      />
      <FilterInput
        filterTerm={filterTerm}
        onFilterChange={handleFilterChange}
      />
      <TodoForm onAddTodo={addTodo} />
      {!isTodoListLoading && (
        <TodoList
          todoList={todoList}
          dataVersion={dataVersion}
          onCompleteTodo={completeTodo}
          onUpdateTodo={updateTodo}
        />
      )}
    </>
  );
}

export default TodosPage;
