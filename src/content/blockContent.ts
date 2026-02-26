export function showBlockedOverlay(message = 'Blocked by PomoBlock'): void {
	const existing = document.getElementById('pomoblock-overlay');
	if (existing) return;

	const overlay = document.createElement('div');
	overlay.id = 'pomoblock-overlay';
	overlay.style.cssText = [
		'position:fixed',
		'inset:0',
		'z-index:2147483647',
		'display:flex',
		'align-items:center',
		'justify-content:center',
		'background:rgba(16,18,22,0.92)',
		'color:#fff',
		'font:600 24px system-ui,sans-serif',
		'text-align:center',
		'padding:24px',
	].join(';');
	overlay.textContent = message;
	document.body.appendChild(overlay);
}
