import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {

  const [todos, setTodos] = useState([])
  const [newTask, setNewTask] = useState('')
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    // SELECT * FROM todos ORDER BY id ASC
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data)
    }
  }

  const addTodo = async () => {
    //INSERT INTO todos (task, is_completed) VALUES (newTask, false)
    //SELECT * FROM todos WHERE task = newTask
    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: newTask, is_completed: false }])
      .select()
    if (error) {
      console.error('Error inserting todo:', error)
    } else if (Array.isArray(data)) {
      setTodos(prevTodos => [...prevTodos, ...data])
      setNewTask('')
    }
  }

  const updateTodo = async (id) => {
    //UPDATE todos SET task = editingText WHERE id = id
    const { error } = await supabase
      .from('todos')
      .update({ task: editingText })
      .eq('id', id)
    if (error) console.error('Error updating todo:', error)
    else fetchTodos()
    setEditingId(null)
    setEditingText('')
  }

  const toggleCompletion = async (id, is_completed) => {
    //update todos set is_completed = !is_completed
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !is_completed })
      .eq('id', id)
    if (error) console.error('Error updating todo:', error)
    else fetchTodos()
  };

  const deleteTodo = async (id) => {
    //delete from todos where id = id
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
    if (error) console.error('Error deleting todo:', error)
    else fetchTodos()
  }

  return (
    <div className='App'>
      <h1>Supabase Todo App</h1>
      <div className='new-task'>
        <input type="text"
          placeholder="New task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTodo} className="btn-add">Add</button>
      </div>
      <ul className='tasks'>
        {todos.map((todo) => (
          <li key={todo.id} className='task-list'>
            {editingId === todo.id ? (
              <input type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => updateTodo(todo.id)}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <span
                    style={{ textDecoration: todo.is_completed ? 'line-through' : 'none' }}
                    onDoubleClick={() => {
                      setEditingId(todo.id);
                      setEditingText(todo.task);
                    }}
                  >
                    {todo.task}
                  </span>
                </div>
                <div style={{ marginLeft: '1rem' }}>
                  <button onClick={() => toggleCompletion(todo.id, todo.is_completed)}>Toggle</button>
                  <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App;
