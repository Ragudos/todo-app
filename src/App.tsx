import { useState, useEffect, Fragment } from "react";

import "./App.css";

interface Todo {
  id: string;
  description: string;
  progress: number;
  isFinished: boolean;
}

const alphanum = "abcdefghijklmnopqrstuvwxyz0123456789";

function genId() {
  let id = "";

  for (let idx = 0; idx < 8; ++idx) {
    const random = Math.floor(Math.random() * (alphanum.length - 1));

    id += alphanum[random];
  }

  return id;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoDescription, setTodoDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!todoDescription) {
      return;
    }

    const newTodo = {
      id: genId(),
      description: todoDescription,
      progress: 0,
      isFinished: false,
    } satisfies Todo;

    setTodos((prevTodos) => {
      const newTodos = [
        ...prevTodos,
        newTodo
      ];

      localStorage.setItem("todos", JSON.stringify(newTodos))

      return newTodos;
    });

    setTodoDescription("");
  }

  function handleChange(todo: Todo) {
    setTodos((prevTodos) => {
      const newTodos = prevTodos.map((currTodo) => {
        return currTodo.id == todo.id ? todo : currTodo;
      });

      localStorage.setItem("todos", JSON.stringify(newTodos));

      return newTodos;
    });
  }

  function handleDelete(todoId: string) {
    setTodos((prevTodos) => {
      const newTodos = prevTodos.filter((currTodo) => {
        return currTodo.id == todoId ? null : currTodo;
      });

      localStorage.setItem("todos", JSON.stringify(newTodos));

      return newTodos;
    });
  }

  useEffect(() => {
    const storedTodos = localStorage.getItem("todos");

    if (storedTodos) {
      const parsedTodos = JSON.parse(storedTodos) as Todo[];

      setTodos(parsedTodos);
    }
  }, []);

  return (
    <Fragment>
      <div>
        <h1>Todo App</h1>

        <form action="" onSubmit={handleSubmit}>
          <label htmlFor="todo-description">Describe your todo</label>
          <input
            type="text"
            placeholder="Todo description"
            value={todoDescription}
            onChange={(e) => setTodoDescription(e.target.value)}
          />

          <button disabled={!todoDescription} type="submit">Submit</button>
        </form>
      </div>

      <ul className="todos">
        {todos.map((todo) => {
          return (
            <li key={todo.id}>
              <Todo todo={todo} handleChange={handleChange} handleDelete={handleDelete} />
            </li>
          )
        })}
      </ul>
    </Fragment>
  );
}

function Todo(props: { todo: Todo; handleChange: (todo: Todo) => void; handleDelete: (todoId: string) => void }) {
  const { todo, handleChange, handleDelete } = props;

  const [isFinished, setIsFinished] = useState(todo.isFinished);
  const [description, setDescription] = useState(todo.description);
  const [progress, setProgress] = useState(todo.progress);
  const [mode, setMode] = useState<"edit" | "view">("view");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMode((p) => {
      return p == "edit" ? "view" : "edit";
    });

    if (mode == "view") {
      return;
    }

    handleChange({
      id: todo.id,
      description: description,
      progress: progress,
      isFinished: isFinished,
    });
  }

  return (
    <form onSubmit={handleSubmit} action="" data-mode={mode}>
      {mode == "view" && (
        <Fragment>
          <button
            type="button"
            disabled={!isFinished}
            onClick={() => {
              if (isFinished) {
                handleDelete(todo.id);
              }
            }}
          >
            Delete
          </button>

          <input
            type="checkbox"
            checked={isFinished}
            disabled={todo.progress < 100}
            onChange={() => {
              if (todo.progress == 100) {
                setIsFinished((p) => {
                  return !p;
                });

                handleChange({
                  ...todo,
                  isFinished: !isFinished
                });
              }
            }}
          />
        </Fragment>
      )}

      {mode == "view" ? (
        <div>
          {todo.description}
        </div>
      ) : (
        <textarea
          placeholder="Enter your todo"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      )}

      {mode == "view" ? (
        <progress value={progress} max={100}>{progress}</progress>
      ) : (
        <input
          type="range"
          value={progress}
          onChange={(e) => {
            setProgress(+e.target.value);
          }}
          min={0}
          max={100}
        />
      )}

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit">
          {mode == "edit" ? "Save" : "Update"}
        </button>
        {mode == "edit" && (
          <button type="button" onClick={() => {
            setDescription(todo.description);
            setProgress(todo.progress);
            setMode("view");
          }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export { App };
