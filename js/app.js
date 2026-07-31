document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Greeting Widget & Custom Name ---
  const greetingTimeEl = document.getElementById('greeting-time');
  const greetingDateEl = document.getElementById('greeting-date');
  const greetingMessageEl = document.getElementById('greeting-message');
  const usernameInput = document.getElementById('username-input');

  let savedName = localStorage.getItem('dashboard_username') || '';
  if (usernameInput) usernameInput.value = savedName;

  if (usernameInput) {
    usernameInput.addEventListener('input', (e) => {
      savedName = e.target.value.trim();
      localStorage.setItem('dashboard_username', savedName);
      updateClock();
    });
  }

  function updateClock() {
    const now = new Date();
    greetingTimeEl.textContent = now.toLocaleTimeString();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    greetingDateEl.textContent = now.toLocaleDateString('en-US', options);

    const hours = now.getHours();
    let greeting = 'Good Evening';
    if (hours < 12) greeting = 'Good Morning';
    else if (hours < 18) greeting = 'Good Afternoon';

    greetingMessageEl.textContent = savedName ? `${greeting}, ${savedName}` : greeting;
  }

  setInterval(updateClock, 1000);
  updateClock();

  // --- 2. Dark/Light Mode Challenge ---
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const isDarkMode = localStorage.getItem('dashboard_darkmode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      themeToggle.textContent = '☀️ Light Mode';
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const activeDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('dashboard_darkmode', activeDark);
      themeToggle.textContent = activeDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
  }

  // --- 3. Focus Timer Widget (25 Mins) ---
  let timer;
  let timeLeft = 25 * 60;
  let isRunning = false;

  const timerDisplay = document.getElementById('timer-display');
  const timerStart = document.getElementById('timer-start');
  const timerStop = document.getElementById('timer-stop');
  const timerReset = document.getElementById('timer-reset');

  function renderTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  timerStart.addEventListener('click', () => {
    if (!isRunning) {
      isRunning = true;
      timer = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          renderTimer();
        } else {
          clearInterval(timer);
          isRunning = false;
          alert('Focus session completed!');
        }
      }, 1000);
    }
  });

  timerStop.addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
  });

  timerReset.addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    timeLeft = 25 * 60;
    renderTimer();
  });

  // --- 4. To-Do List Widget ---
  const todoInput = document.getElementById('todo-input');
  const todoAddBtn = document.getElementById('todo-add-btn');
  const todoList = document.getElementById('todo-list');
  const todoError = document.getElementById('todo-error');

  let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [];

  function saveAndRenderTasks() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    todoList.innerHTML = '';

    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifySpaceBetween = 'space-between';
      li.style.margin = '8px 0';

      li.innerHTML = `
        <span style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
          <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
          ${task.text}
        </span>
        <div>
          <button class="btn-edit" data-index="${index}">Edit</button>
          <button class="btn-delete" data-index="${index}">Delete</button>
        </div>
      `;

      todoList.appendChild(li);
    });
  }

  function addTask() {
    const taskText = todoInput.value.trim();
    todoError.textContent = '';

    if (!taskText) return;

    // Challenge: Prevent Duplicate Tasks
    const isDuplicate = tasks.some(t => t.text.toLowerCase() === taskText.toLowerCase());
    if (isDuplicate) {
      todoError.textContent = 'Task already exists!';
      return;
    }

    tasks.push({ text: taskText, completed: false });
    todoInput.value = '';
    saveAndRenderTasks();
  }

  todoAddBtn.addEventListener('click', addTask);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  todoList.addEventListener('click', (e) => {
    const index = e.target.dataset.index;

    if (e.target.type === 'checkbox') {
      tasks[index].completed = e.target.checked;
      saveAndRenderTasks();
    } else if (e.target.classList.contains('btn-delete')) {
      tasks.splice(index, 1);
      saveAndRenderTasks();
    } else if (e.target.classList.contains('btn-edit')) {
      const newText = prompt('Edit task:', tasks[index].text);
      if (newText !== null && newText.trim() !== '') {
        tasks[index].text = newText.trim();
        saveAndRenderTasks();
      }
    }
  });

  saveAndRenderTasks();

  // --- 5. Quick Links Widget ---
  const linksLabelInput = document.getElementById('links-label-input');
  const linksUrlInput = document.getElementById('links-url-input');
  const linksAddBtn = document.getElementById('links-add-btn');
  const linksPanel = document.getElementById('links-panel');
  const linksError = document.getElementById('links-error');

  let quickLinks = JSON.parse(localStorage.getItem('dashboard_links')) || [
    { name: 'Google', url: 'https://google.com' },
    { name: 'Gmail', url: 'https://mail.google.com' }
  ];

  function saveAndRenderLinks() {
    localStorage.setItem('dashboard_links', JSON.stringify(quickLinks));
    linksPanel.innerHTML = '';

    quickLinks.forEach((link, index) => {
      const btnWrapper = document.createElement('div');
      btnWrapper.style.display = 'inline-block';
      btnWrapper.style.margin = '5px';

      btnWrapper.innerHTML = `
        <a href="${link.url}" target="_blank" style="padding: 6px 12px; background: #4f46e5; color: white; text-decoration: none; border-radius: 4px;">${link.name}</a>
        <button class="btn-delete-link" data-index="${index}" style="margin-left: 2px;">✕</button>
      `;
      linksPanel.appendChild(btnWrapper);
    });
  }

  linksAddBtn.addEventListener('click', () => {
    const name = linksLabelInput.value.trim();
    let url = linksUrlInput.value.trim();
    linksError.textContent = '';

    if (!name || !url) {
      linksError.textContent = 'Please fill both Label and URL.';
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    quickLinks.push({ name, url });
    linksLabelInput.value = '';
    linksUrlInput.value = '';
    saveAndRenderLinks();
  });

  linksPanel.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete-link')) {
      const index = e.target.dataset.index;
      quickLinks.splice(index, 1);
      saveAndRenderLinks();
    }
  });

  saveAndRenderLinks();
});