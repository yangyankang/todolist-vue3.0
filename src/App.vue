<template>
  <section
    id="app"
    class="todoapp"
  >
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autocomplete="off"
        autofocus
        v-model="input"
        @keyup.enter="addTodo"
      >
    </header>
    <section class="main" v-show="count">
      <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        v-model="allDone"
      >
      <label for="toggle-all">Mark all as complete</label>
      <ul
        class="todo-list"
        v-for="todo in filterTodos"
        :key="todo"
      >
        <li :class="{editing: todo === editingTodo, completed: todo.completed}">
          <div class="view">
            <input
              class="toggle"
              type="checkbox"
              v-model="todo.completed"
            >
            <label @dblclick="editTodo(todo)">{{ todo.text }}</label>
            <button
              class="destroy"
              @click="removeToto(todo)"
            ></button>
          </div>
          <input
            class="edit"
            type="text"
            v-editiing-focus="todo === editingTodo"
            v-model="todo.text"
            @keyup.enter="doneEdit(todo)"
            @blur="doneEdit(todo)"
            @keyup.esc="cancelEdit(todo)"
          >
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="count">
      <span class="todo-count">
        <strong>{{ remainCount }}</strong> {{ remainCount > 1 ? 'items' : 'item'}} left
      </span>
      <ul class="filters">
        <li><a href="#/all">All</a></li>
        <li><a href="#/active">Active</a></li>
        <li><a href="#/completed">Completed</a></li>
      </ul>
      <button class="clear-completed" v-show="count > remainCount" @click="clearCompleted">
        Clear completed
      </button>
    </footer>
  </section>
  <footer class="info">
    <p>Double-click to edit a todo</p>
    <!-- Remove the below line ↓ -->
    <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
    <!-- Change this out with your name and url ↓ -->
    <p>Created by <a>Tommy·Yang</a></p>
    <p>Part of <a
        href="http://todomvc.com"
        target="_blank"
      >TodoMVC</a></p>
  </footer>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watchEffect } from "vue";
import "./assets/index.css";
import userLocalStorage from './utils/useLocalStorage'


const  { setItem, getItem } = userLocalStorage()


// 1.添加待办事项
const useAdd = (todos) => {
  const input = ref("");
  const addTodo = () => {
    const text = input.value && input.value.trim();
    if (!text) return;
    todos.value.unshift({
      text,
      completed: false,
    });

    input.value = "";
  };
  return {
    input,
    addTodo,
  };
};

// 2.删除待办事项
const useRemove = (todos) => {
  const removeToto = (todo) => {
    let findIndex = todos.value.findIndex((item) => item === todo);
    todos.value.splice(findIndex, 1);
  };

  const clearCompleted =() => {
    todos.value = todos.value.filter(todo => !todo.completed)
  }
  return {
    removeToto,
    clearCompleted
  };
};

// 3.编辑待办事项
const useEdit = (remove) => {
  let beforeEditingText = "";
  let editingTodo = ref(null);
  const editTodo = (todo) => {
    beforeEditingText = todo.text;
    editingTodo.value = todo;
  };

  const doneEdit = (todo) => {
    if (!editingTodo.value) return;
    todo.text = todo.text.trim();
    todo.text || remove(todo);
    todo.text = editingTodo.value.text;
    editingTodo.value = null;
  };

  const cancelEdit = (todo) => {
    editingTodo.value = null;
    todo.text = beforeEditingText;
  };

  return {
    editingTodo,
    editTodo,
    doneEdit,
    cancelEdit,
  };
};

// 4.过滤
const useFilter = todos => {
  const allDone = computed({
    get() {
      return !todos.value.filter(todo => !todo.completed).length
    },
    set(value) {
      todos.value.forEach(todo => {
        todo.completed = value
      })
    }
  })

  const type = ref('all')
  const filter = {
    all: todos => todos,
    active: todos => todos.filter(todo => !todo.completed),
    completed: todos => todos.filter(todo => todo.completed)
  }


  const filterTodos = computed(() => {
    return filter[type.value](todos.value)
  })

  const count = computed(() => {
    return todos.value.length
  })

  const remainCount = computed(() => {
    return todos.value.filter(todo => !todo.completed).length
  })
  const onHashChange = () => {
    const hash = window.location.hash.replace('#/', '')

    console.log(hash)
    if(filter[hash]){
      type.value = hash
    }else {
      type.value ='all'
      window.location.hash = ''
    }
  }
  onMounted(() => {
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
  }) 

   onUnmounted(() => {
    window.removeEventListener('hashchange', onHashChange)
  }) 
  return {
    count,
    remainCount,
    allDone,
    filterTodos
  }
}


// 5. 本地存储
const useStorage = () => {
  let KEY = 'TODOKEYS'
  
  const todos = ref(getItem(KEY) || [])

  watchEffect(() => {
      setItem(KEY, todos.value)
  })
  return todos
}

export default {
  name: "App",
  setup() {
    const todos = useStorage();
    const { removeToto, clearCompleted } = useRemove(todos);
    return {
      todos,
      removeToto,
      clearCompleted,
      ...useAdd(todos),
      ...useEdit(removeToto),
      ...useFilter(todos)
    };
  },
  directives: {
    editiingFocus: (el, binding) => {
      binding.value && el.focus();
    },
  },
};
</script>

<style>
</style>
