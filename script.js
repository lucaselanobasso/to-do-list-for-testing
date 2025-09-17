class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addButton = document.getElementById('addButton');
        this.taskList = document.getElementById('taskList');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.filterButtons = {
            all: document.getElementById('filterAll'),
            pending: document.getElementById('filterPending'),
            completed: document.getElementById('filterCompleted')
        };
        this.clearCompleted = document.getElementById('clearCompleted');
    }

    attachEventListeners() {
        this.addButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        Object.keys(this.filterButtons).forEach(filter => {
            this.filterButtons[filter].addEventListener('click', () => this.setFilter(filter));
        });

        this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (text === '') {
            alert('Por favor, digite uma tarefa!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date()
        };

        this.tasks.push(task);
        this.taskInput.value = '';
        this.updateDisplay();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.updateDisplay();
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.updateDisplay();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        Object.keys(this.filterButtons).forEach(f => {
            this.filterButtons[f].classList.remove('active');
        });
        this.filterButtons[filter].classList.add('active');

        this.renderTasks();
    }

    clearCompletedTasks() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            alert('Não há tarefas concluídas para limpar!');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir ${completedCount} tarefa(s) concluída(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.updateDisplay();
        }
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '<div class="empty-state">Nenhuma tarefa encontrada</div>';
            return;
        }

        this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="app.toggleTask(${task.id})">
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn" onclick="app.deleteTask(${task.id})">Excluir</button>
            </li>
        `).join('');
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        
        this.totalTasks.textContent = `Total: ${total}`;
        this.completedTasks.textContent = `Concluídas: ${completed}`;
    }

    updateDisplay() {
        this.renderTasks();
        this.updateStats();
    }
}

// Inicializar a aplicação
const app = new TodoApp();