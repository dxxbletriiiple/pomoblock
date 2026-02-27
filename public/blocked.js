function formatTime(ms) {
	const totalSec = Math.max(0, Math.ceil(ms / 1000));
	const minutes = Math.floor(totalSec / 60);
	const seconds = totalSec % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimer() {
	chrome.storage.local.get('appState', (data) => {
		const state = data.appState;
		if (!state || !state.timer) return;

		const { timer } = state;
		const timerEl = document.getElementById('timer');
		const phaseEl = document.getElementById('phase');
		if (!timerEl || !phaseEl) return;

		if (timer.status === 'running' && timer.endTime) {
			const remaining = Math.max(0, timer.endTime - Date.now());
			timerEl.textContent = formatTime(remaining);
		} else if (timer.status === 'paused' && timer.remainingMs != null) {
			timerEl.textContent = formatTime(timer.remainingMs);
		}

		const labels = {
			work: 'Focus Session',
			shortBreak: 'Short Break',
			longBreak: 'Long Break',
		};
		phaseEl.textContent = labels[timer.phase] || 'Focus Session';
	});
}

const backButton = document.getElementById('back-btn');
if (backButton) {
	backButton.addEventListener('click', () => history.back());
}

updateTimer();
setInterval(updateTimer, 500);
