document.addEventListener('DOMContentLoaded', function() {
    // Timer state
    const timerState = {
        hours: 0,
        minutes: 25,
        seconds: 0,
        isRunning: false,
        isPaused: false,
        timerId: null,
        currentSessionType: 'work',
        sessionsCompleted: 0,
        totalFocusTime: 0,
        todayFocusTime: 0,
        todaySessions: 0,
        history: [],
        todos: [],
        startTime: null,
        originalDurationHours: 0,
        originalDurationMinutes: 25,
        workDurationHours: 0,
        workDurationMinutes: 25,
        shortBreakDurationHours: 0,
        shortBreakDurationMinutes: 5,
        longBreakDurationHours: 0,
        longBreakDurationMinutes: 15,
        autoStartBreaks: false,
        lastUpdateDate: new Date().toDateString()
    };

    // DOM Elements
    const timerDisplay = document.getElementById('timer-display');
    const sessionStatus = document.getElementById('session-status');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const skipBtn = document.getElementById('skip-btn');
    const progressRing = document.getElementById('progress-ring');
    const progressRingSmall = document.getElementById('progress-ring-small');
    const currentSessionTypeEl = document.getElementById('current-session-type');
    const autoStartBreaksEl = document.getElementById('auto-start-breaks');
    const toast = document.getElementById('toast');

    // Work duration elements
    const workHoursEl = document.getElementById('work-hours');
    const workMinutesEl = document.getElementById('work-minutes');
    const shortBreakHoursEl = document.getElementById('short-break-hours');
    const shortBreakMinutesEl = document.getElementById('short-break-minutes');
    const longBreakHoursEl = document.getElementById('long-break-hours');
    const longBreakMinutesEl = document.getElementById('long-break-minutes');

    // Session type dropdown
    const sessionTypeSelected = document.getElementById('session-type-selected');
    const sessionTypeItems = document.getElementById('session-type-items');

    // Statistics elements (Desktop)
    const totalSessionsEl = document.getElementById('total-sessions');
    const totalFocusTimeEl = document.getElementById('total-focus-time');
    const todaySessionsEl = document.getElementById('today-sessions');
    const todayFocusTimeEl = document.getElementById('today-focus-time');
    
    // Statistics elements (Mobile)
    const totalSessionsMobileEl = document.getElementById('total-sessions-mobile');
    const totalFocusTimeMobileEl = document.getElementById('total-focus-time-mobile');
    const todaySessionsMobileEl = document.getElementById('today-sessions-mobile');
    const todayFocusTimeMobileEl = document.getElementById('today-focus-time-mobile');

    // History elements (Desktop)
    const historyList = document.getElementById('history-list');
    const exportHistoryBtn = document.getElementById('export-history');
    const clearHistoryBtn = document.getElementById('clear-history');
    
    // History elements (Mobile)
    const historyListMobile = document.getElementById('history-list-mobile');
    const exportHistoryMobileBtn = document.getElementById('export-history-mobile');
    const clearHistoryMobileBtn = document.getElementById('clear-history-mobile');

    // Todo elements (Desktop)
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    
    // Todo elements (Mobile)
    const todoFormMobile = document.getElementById('todo-form-mobile');
    const todoInputMobile = document.getElementById('todo-input-mobile');
    const todoListMobile = document.getElementById('todo-list-mobile');

    // Collapsible panels (Desktop)
    const toggleStatsBtn = document.getElementById('toggle-stats');
    const toggleHistoryBtn = document.getElementById('toggle-history');
    const toggleTodoBtn = document.getElementById('toggle-todo');
    const toggleSettingsBtn = document.getElementById('toggle-settings');
    const statsContent = document.getElementById('stats-content');
    const historyContent = document.getElementById('history-content');
    const todoContent = document.getElementById('todo-content');
    const settingsContent = document.getElementById('settings-content');
    
    // Collapsible panels (Mobile)
    const toggleStatsMobileBtn = document.getElementById('toggle-stats-mobile');
    const toggleHistoryMobileBtn = document.getElementById('toggle-history-mobile');
    const toggleTodoMobileBtn = document.getElementById('toggle-todo-mobile');
    const statsContentMobile = document.getElementById('stats-content-mobile');
    const historyContentMobile = document.getElementById('history-content-mobile');
    const todoContentMobile = document.getElementById('todo-content-mobile');

    // Fullscreen elements
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenTimerDisplay = document.getElementById('fullscreen-timer-display');
    const fullscreenSessionStatus = document.getElementById('fullscreen-session-status');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');

    // Load saved data from localStorage
    loadFromLocalStorage();
    
    // Initialize UI
    updateDisplay();
    updateStatistics();
    renderHistory();
    renderTodos();
    updateProgressRing();

    // Update UI with current state
    if (workHoursEl) workHoursEl.textContent = timerState.workDurationHours;
    if (workMinutesEl) workMinutesEl.textContent = timerState.workDurationMinutes;
    if (shortBreakHoursEl) shortBreakHoursEl.textContent = timerState.shortBreakDurationHours;
    if (shortBreakMinutesEl) shortBreakMinutesEl.textContent = timerState.shortBreakDurationMinutes;
    if (longBreakHoursEl) longBreakHoursEl.textContent = timerState.longBreakDurationHours;
    if (longBreakMinutesEl) longBreakMinutesEl.textContent = timerState.longBreakDurationMinutes;
    if (autoStartBreaksEl) autoStartBreaksEl.checked = timerState.autoStartBreaks;

    // Event Listeners
    if (startPauseBtn) startPauseBtn.addEventListener('click', toggleTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (skipBtn) skipBtn.addEventListener('click', skipSession);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', enterFullscreen);
    if (exitFullscreenBtn) exitFullscreenBtn.addEventListener('click', exitFullscreen);

    // Duration controls
    document.getElementById('work-hours-decrease')?.addEventListener('click', () => adjustDuration('work', 'hours', -1));
    document.getElementById('work-hours-increase')?.addEventListener('click', () => adjustDuration('work', 'hours', 1));
    document.getElementById('work-minutes-decrease')?.addEventListener('click', () => adjustDuration('work', 'minutes', -1));
    document.getElementById('work-minutes-increase')?.addEventListener('click', () => adjustDuration('work', 'minutes', 1));
    
    document.getElementById('short-break-hours-decrease')?.addEventListener('click', () => adjustDuration('short-break', 'hours', -1));
    document.getElementById('short-break-hours-increase')?.addEventListener('click', () => adjustDuration('short-break', 'hours', 1));
    document.getElementById('short-break-minutes-decrease')?.addEventListener('click', () => adjustDuration('short-break', 'minutes', -1));
    document.getElementById('short-break-minutes-increase')?.addEventListener('click', () => adjustDuration('short-break', 'minutes', 1));
    
    document.getElementById('long-break-hours-decrease')?.addEventListener('click', () => adjustDuration('long-break', 'hours', -1));
    document.getElementById('long-break-hours-increase')?.addEventListener('click', () => adjustDuration('long-break', 'hours', 1));
    document.getElementById('long-break-minutes-decrease')?.addEventListener('click', () => adjustDuration('long-break', 'minutes', -1));
    document.getElementById('long-break-minutes-increase')?.addEventListener('click', () => adjustDuration('long-break', 'minutes', 1));

    // Session type dropdown
    if (sessionTypeSelected) {
        sessionTypeSelected.addEventListener('click', () => {
            if (sessionTypeItems) sessionTypeItems.classList.toggle('select-show');
        });
    }

    if (sessionTypeItems) {
        sessionTypeItems.addEventListener('click', (e) => {
            if (e.target.dataset.value) {
                setSessionType(e.target.dataset.value);
                sessionTypeItems.classList.remove('select-show');
            }
        });
    }

    // Auto start breaks toggle
    if (autoStartBreaksEl) {
        autoStartBreaksEl.addEventListener('change', (e) => {
            timerState.autoStartBreaks = e.target.checked;
            saveToLocalStorage();
        });
    }

    // History controls
    if (exportHistoryBtn) exportHistoryBtn.addEventListener('click', exportHistory);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);

    // Todo form (Desktop)
    if (todoForm) {
        todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addTodo();
        });
    }
    
    // Todo form (Mobile)
    if (todoFormMobile) {
        todoFormMobile.addEventListener('submit', (e) => {
            e.preventDefault();
            addTodoMobile();
        });
    }
    
    // Mobile history buttons
    if (exportHistoryMobileBtn) exportHistoryMobileBtn.addEventListener('click', exportHistory);
    if (clearHistoryMobileBtn) clearHistoryMobileBtn.addEventListener('click', clearHistory);

    // Collapsible panels (Desktop)
    if (toggleStatsBtn) toggleStatsBtn.addEventListener('click', () => togglePanel('stats'));
    if (toggleHistoryBtn) toggleHistoryBtn.addEventListener('click', () => togglePanel('history'));
    if (toggleTodoBtn) toggleTodoBtn.addEventListener('click', () => togglePanel('todo'));
    if (toggleSettingsBtn) toggleSettingsBtn.addEventListener('click', () => togglePanel('settings'));
    
    // Collapsible panels (Mobile)
    if (toggleStatsMobileBtn) toggleStatsMobileBtn.addEventListener('click', () => togglePanel('stats-mobile'));
    if (toggleHistoryMobileBtn) toggleHistoryMobileBtn.addEventListener('click', () => togglePanel('history-mobile'));
    if (toggleTodoMobileBtn) toggleTodoMobileBtn.addEventListener('click', () => togglePanel('todo-mobile'));

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (sessionTypeSelected && sessionTypeItems && 
            !sessionTypeSelected.contains(e.target) && !sessionTypeItems.contains(e.target)) {
            sessionTypeItems.classList.remove('select-show');
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            toggleTimer();
        } else if (e.key === 'r' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            resetTimer();
        } else if (e.key === 's' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            skipSession();
        }
    });

    // Check if date changed for daily stats reset
    function checkDateChange() {
        const currentDate = new Date().toDateString();
        if (timerState.lastUpdateDate !== currentDate) {
            timerState.todayFocusTime = 0;
            timerState.todaySessions = 0;
            timerState.lastUpdateDate = currentDate;
            saveToLocalStorage();
            updateStatistics();
        }
    }

    // Timer functions
    function toggleTimer() {
        if (timerState.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        timerState.isRunning = true;
        timerState.isPaused = false;
        
        if (startPauseBtn) {
            startPauseBtn.querySelector('i').className = 'ri-pause-fill';
            startPauseBtn.querySelector('span').textContent = 'Pause';
        }
        const statusText = `${getSessionTypeName(timerState.currentSessionType)} in progress`;
        if (sessionStatus) sessionStatus.textContent = statusText;
        if (fullscreenSessionStatus) fullscreenSessionStatus.textContent = statusText;
        
        timerState.timerId = setInterval(() => {
            if (timerState.seconds === 0) {
                if (timerState.minutes === 0) {
                    if (timerState.hours === 0) {
                        // Timer finished
                        completeSession();
                    } else {
                        timerState.hours--;
                        timerState.minutes = 59;
                        timerState.seconds = 59;
                    }
                } else {
                    timerState.minutes--;
                    timerState.seconds = 59;
                }
            } else {
                timerState.seconds--;
            }
            
            updateDisplay();
            updateProgressRing();
            saveToLocalStorage();
        }, 1000);
    }

    function pauseTimer() {
        timerState.isRunning = false;
        timerState.isPaused = true;
        clearInterval(timerState.timerId);
        
        if (startPauseBtn) {
            startPauseBtn.querySelector('i').className = 'ri-play-fill';
            startPauseBtn.querySelector('span').textContent = 'Resume';
        }
        if (sessionStatus) sessionStatus.textContent = 'Paused';
        if (fullscreenSessionStatus) fullscreenSessionStatus.textContent = 'Paused';
    }

    function resetTimer() {
        clearInterval(timerState.timerId);
        timerState.isRunning = false;
        timerState.isPaused = false;
        
        // Reset to current session type duration
        const duration = getCurrentSessionDuration();
        timerState.hours = duration.hours;
        timerState.minutes = duration.minutes;
        timerState.seconds = 0;
        timerState.originalDurationHours = duration.hours;
        timerState.originalDurationMinutes = duration.minutes;
        
        if (startPauseBtn) {
            startPauseBtn.querySelector('i').className = 'ri-play-fill';
            startPauseBtn.querySelector('span').textContent = 'Start';
        }
        if (sessionStatus) sessionStatus.textContent = 'Ready to start';
        if (fullscreenSessionStatus) fullscreenSessionStatus.textContent = 'Ready to start';
        
        updateDisplay();
        updateProgressRing();
        saveToLocalStorage();
    }

    // Fullscreen functions
    function enterFullscreen() {
        if (fullscreenOverlay) {
            fullscreenOverlay.classList.remove('hidden');
            updateDisplay();
            const statusText = sessionStatus ? sessionStatus.textContent : 'Ready to start';
            if (fullscreenSessionStatus) fullscreenSessionStatus.textContent = statusText;
        }
    }

    function exitFullscreen() {
        if (fullscreenOverlay) {
            fullscreenOverlay.classList.add('hidden');
        }
    }

    function skipSession() {
        if (timerState.isRunning) {
            completeSession();
        } else {
            nextSession();
        }
    }

    function completeSession() {
        clearInterval(timerState.timerId);
        timerState.isRunning = false;
        timerState.isPaused = false;
        
        // Record session
        const sessionDuration = timerState.originalDurationHours * 60 + timerState.originalDurationMinutes;
        const sessionData = {
            type: timerState.currentSessionType,
            duration: sessionDuration,
            completedAt: new Date().toISOString(),
            date: new Date().toDateString()
        };
        
        timerState.history.push(sessionData);
        timerState.sessionsCompleted++;
        
        // Update statistics
        if (timerState.currentSessionType === 'work') {
            timerState.totalFocusTime += sessionDuration;
            timerState.todayFocusTime += sessionDuration;
            timerState.todaySessions++;
        }
        
        // Show completion notification
        showToast(`${getSessionTypeName(timerState.currentSessionType)} completed!`);
        
        // Move to next session
        nextSession();
        
        updateStatistics();
        renderHistory();
        saveToLocalStorage();
    }

    function nextSession() {
        // Determine next session type
        if (timerState.currentSessionType === 'work') {
            // After work, go to break (long break every 4 sessions, short break otherwise)
            if (timerState.sessionsCompleted % 4 === 0) {
                setSessionType('long-break');
            } else {
                setSessionType('short-break');
            }
        } else {
            // After break, go to work
            setSessionType('work');
        }
        
        // Auto start if enabled and it's a break
        if (timerState.autoStartBreaks && timerState.currentSessionType !== 'work') {
            setTimeout(() => {
                startTimer();
            }, 1000);
        }
    }

    function getCurrentSessionDuration() {
        switch (timerState.currentSessionType) {
            case 'work':
                return { hours: timerState.workDurationHours, minutes: timerState.workDurationMinutes };
            case 'short-break':
                return { hours: timerState.shortBreakDurationHours, minutes: timerState.shortBreakDurationMinutes };
            case 'long-break':
                return { hours: timerState.longBreakDurationHours, minutes: timerState.longBreakDurationMinutes };
            default:
                return { hours: timerState.workDurationHours, minutes: timerState.workDurationMinutes };
        }
    }

    function setSessionType(type) {
        timerState.currentSessionType = type;
        if (currentSessionTypeEl) currentSessionTypeEl.textContent = getSessionTypeName(type);
        
        // Reset timer to new duration
        const duration = getCurrentSessionDuration();
        timerState.hours = duration.hours;
        timerState.minutes = duration.minutes;
        timerState.seconds = 0;
        timerState.originalDurationHours = duration.hours;
        timerState.originalDurationMinutes = duration.minutes;
        
        updateDisplay();
        updateProgressRing();
        saveToLocalStorage();
    }

    function getSessionTypeName(type) {
        switch (type) {
            case 'work':
                return 'Work Session';
            case 'short-break':
                return 'Short Break';
            case 'long-break':
                return 'Long Break';
            default:
                return 'Work Session';
        }
    }

    function adjustDuration(type, unit, change) {
        if (timerState.isRunning) return;
        
        if (type === 'work') {
            if (unit === 'hours') {
                timerState.workDurationHours = Math.max(0, Math.min(23, timerState.workDurationHours + change));
                if (workHoursEl) workHoursEl.textContent = timerState.workDurationHours;
            } else {
                timerState.workDurationMinutes = Math.max(1, Math.min(59, timerState.workDurationMinutes + change));
                if (workMinutesEl) workMinutesEl.textContent = timerState.workDurationMinutes;
            }
        } else if (type === 'short-break') {
            if (unit === 'hours') {
                timerState.shortBreakDurationHours = Math.max(0, Math.min(23, timerState.shortBreakDurationHours + change));
                if (shortBreakHoursEl) shortBreakHoursEl.textContent = timerState.shortBreakDurationHours;
            } else {
                timerState.shortBreakDurationMinutes = Math.max(1, Math.min(59, timerState.shortBreakDurationMinutes + change));
                if (shortBreakMinutesEl) shortBreakMinutesEl.textContent = timerState.shortBreakDurationMinutes;
            }
        } else if (type === 'long-break') {
            if (unit === 'hours') {
                timerState.longBreakDurationHours = Math.max(0, Math.min(23, timerState.longBreakDurationHours + change));
                if (longBreakHoursEl) longBreakHoursEl.textContent = timerState.longBreakDurationHours;
            } else {
                timerState.longBreakDurationMinutes = Math.max(1, Math.min(59, timerState.longBreakDurationMinutes + change));
                if (longBreakMinutesEl) longBreakMinutesEl.textContent = timerState.longBreakDurationMinutes;
            }
        }
        
        // Update current timer if it matches the type being adjusted
        if (timerState.currentSessionType === type) {
            const duration = getCurrentSessionDuration();
            timerState.hours = duration.hours;
            timerState.minutes = duration.minutes;
            timerState.seconds = 0;
            timerState.originalDurationHours = duration.hours;
            timerState.originalDurationMinutes = duration.minutes;
            updateDisplay();
            updateProgressRing();
        }
        
        saveToLocalStorage();
    }

    function updateDisplay() {
        const hours = String(timerState.hours).padStart(1, '0');
        const minutes = String(timerState.minutes).padStart(2, '0');
        const displayTime = `${hours}:${minutes}`;
        if (timerDisplay) timerDisplay.textContent = displayTime;
        if (fullscreenTimerDisplay) fullscreenTimerDisplay.textContent = displayTime;
    }

    function updateProgressRing() {
        const totalSeconds = (timerState.originalDurationHours * 3600) + (timerState.originalDurationMinutes * 60);
        const currentSeconds = (timerState.hours * 3600) + (timerState.minutes * 60) + timerState.seconds;
        const progress = (totalSeconds - currentSeconds) / totalSeconds;
        
        // Desktop progress ring (radius = 120)
        const circumference = 2 * Math.PI * 120;
        const offset = circumference - (progress * circumference);
        if (progressRing) progressRing.style.strokeDashoffset = offset;
        
        // Mobile progress ring (radius = 88)
        const circumferenceSmall = 2 * Math.PI * 88;
        const offsetSmall = circumferenceSmall - (progress * circumferenceSmall);
        if (progressRingSmall) progressRingSmall.style.strokeDashoffset = offsetSmall;
    }

    function updateStatistics() {
        checkDateChange();
        
        // Update desktop statistics
        if (totalSessionsEl) totalSessionsEl.textContent = timerState.sessionsCompleted;
        if (totalFocusTimeEl) totalFocusTimeEl.textContent = formatTime(timerState.totalFocusTime);
        if (todaySessionsEl) todaySessionsEl.textContent = timerState.todaySessions;
        if (todayFocusTimeEl) todayFocusTimeEl.textContent = formatTime(timerState.todayFocusTime);
        
        // Update mobile statistics
        if (totalSessionsMobileEl) totalSessionsMobileEl.textContent = timerState.sessionsCompleted;
        if (totalFocusTimeMobileEl) totalFocusTimeMobileEl.textContent = formatTime(timerState.totalFocusTime);
        if (todaySessionsMobileEl) todaySessionsMobileEl.textContent = timerState.todaySessions;
        if (todayFocusTimeMobileEl) todayFocusTimeMobileEl.textContent = formatTime(timerState.todayFocusTime);
    }

    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    function showToast(message) {
        const toastMessage = document.getElementById('toast-message');
        if (toastMessage) toastMessage.textContent = message;
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // History functions
    function renderHistory() {
        const historyHTML = timerState.history.length === 0 
            ? '<div class="text-center text-gray-500 py-8">No sessions recorded yet</div>'
            : [...timerState.history].reverse().map(session => {
                const date = new Date(session.completedAt);
                return `
                    <div class="session-item fade-in">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="session-type-badge session-type-${session.type}">
                                    ${getSessionTypeName(session.type)}
                                </span>
                                <span class="text-sm text-gray-400">${Math.floor(session.duration / 60)}h ${session.duration % 60}m</span>
                            </div>
                            <div class="text-xs text-gray-500">
                                ${date.toLocaleString()}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        
        // Update both desktop and mobile history lists
        if (historyList) historyList.innerHTML = historyHTML;
        if (historyListMobile) historyListMobile.innerHTML = historyHTML;
    }

    function exportHistory() {
        if (timerState.history.length === 0) {
            showToast('No history to export');
            return;
        }
        
        const csvContent = [
            ['Session Type', 'Duration (minutes)', 'Completed At', 'Date'],
            ...timerState.history.map(session => [
                getSessionTypeName(session.type),
                session.duration,
                session.completedAt,
                session.date
            ])
        ].map(row => row.join(',')).join('\\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pomodoro-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        showToast('History exported successfully');
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all session history?')) {
            timerState.history = [];
            timerState.sessionsCompleted = 0;
            timerState.totalFocusTime = 0;
            timerState.todayFocusTime = 0;
            timerState.todaySessions = 0;
            renderHistory();
            updateStatistics();
            saveToLocalStorage();
            showToast('History cleared');
        }
    }

    // Todo functions
    function addTodo() {
        if (!todoInput) return;
        
        const text = todoInput.value.trim();
        if (!text) return;
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        timerState.todos.push(todo);
        todoInput.value = '';
        renderTodos();
        saveToLocalStorage();
    }

    function toggleTodo(id) {
        const todo = timerState.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            renderTodos();
            saveToLocalStorage();
        }
    }

    function deleteTodo(id) {
        timerState.todos = timerState.todos.filter(t => t.id !== id);
        renderTodos();
        saveToLocalStorage();
    }

    function renderTodos() {
        const todoHTML = timerState.todos.length === 0 
            ? '<div class="text-center text-gray-500 py-8">No tasks added yet</div>'
            : timerState.todos.map(todo => `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})">
                        ${todo.completed ? '<i class="ri-check-line text-white text-xs"></i>' : ''}
                    </div>
                    <div class="todo-text">${todo.text}</div>
                    <div class="todo-delete" onclick="deleteTodo(${todo.id})">
                        <i class="ri-delete-bin-line text-xs"></i>
                    </div>
                </div>
            `).join('');
        
        // Update both desktop and mobile todo lists
        if (todoList) todoList.innerHTML = todoHTML;
        if (todoListMobile) todoListMobile.innerHTML = todoHTML;
    }
    
    function addTodoMobile() {
        if (!todoInputMobile || !todoInputMobile.value.trim()) return;
        
        const todo = {
            id: Date.now(),
            text: todoInputMobile.value.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        timerState.todos.push(todo);
        todoInputMobile.value = '';
        renderTodos();
        saveToLocalStorage();
    }

    // Make functions global for onclick handlers
    window.toggleTodo = toggleTodo;
    window.deleteTodo = deleteTodo;

    // Panel toggle function
    function togglePanel(panelType) {
        let content, button;
        
        if (panelType === 'stats') {
            content = statsContent;
            button = toggleStatsBtn;
        } else if (panelType === 'history') {
            content = historyContent;
            button = toggleHistoryBtn;
        } else if (panelType === 'todo') {
            content = todoContent;
            button = toggleTodoBtn;
        } else if (panelType === 'settings') {
            content = settingsContent;
            button = toggleSettingsBtn;
        } else if (panelType === 'stats-mobile') {
            content = statsContentMobile;
            button = toggleStatsMobileBtn;
        } else if (panelType === 'history-mobile') {
            content = historyContentMobile;
            button = toggleHistoryMobileBtn;
        } else if (panelType === 'todo-mobile') {
            content = todoContentMobile;
            button = toggleTodoMobileBtn;
        }
        
        if (content && button) {
            const isCollapsed = content.classList.contains('collapsed');
            content.classList.toggle('collapsed');
            
            const icon = button.querySelector('i');
            if (icon) {
                if (isCollapsed) {
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    icon.style.transform = 'rotate(-180deg)';
                }
            }
        }
    }

    // Save and load functions
    function saveToLocalStorage() {
        localStorage.setItem('pomodoroTimer', JSON.stringify(timerState));
    }

    function loadFromLocalStorage() {
        const saved = localStorage.getItem('pomodoroTimer');
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                Object.assign(timerState, savedState);
                
                // Reset timer if it was running
                if (timerState.isRunning) {
                    timerState.isRunning = false;
                    timerState.isPaused = false;
                    clearInterval(timerState.timerId);
                }
            } catch (e) {
                console.error('Error loading saved state:', e);
            }
        }
    }
});