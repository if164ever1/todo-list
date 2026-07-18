import './App.css'
import './TodoList.jsx'
import TodoList from './TodoList.jsx'
import './TodoForm.jsx'
import TodoForm from './TodoForm.jsx'


function App() {
  
  return (
    <div>
      <h1>Todo List</h1>
      <TodoForm/>
      <TodoList/>
      
    </div>
  )
}

export default App
