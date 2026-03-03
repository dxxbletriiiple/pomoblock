import type { AppLanguage, TimerPhase } from '../types';

export const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'ru', 'es'];

type IntlDisplayNamesCtor = new (
	locales?: string | string[],
	options?: { type: 'language' },
) => {
	of(code: string): string | undefined;
};

export interface IntlDictionary {
	header: {
		focusPill: string;
		themeToggleTitle: string;
		languageSelectTitle: string;
	};
	tabs: {
		timer: string;
		sites: string;
		settings: string;
	};
	timer: {
		phases: Record<TimerPhase, string>;
		paused: string;
		startFocus: string;
		pause: string;
		resume: string;
		skip: string;
		reset: string;
		skipTitle: string;
		resetTitle: string;
	};
	siteList: {
		activeBanner: string;
		placeholder: string;
		add: string;
		errorInvalidDomain: string;
		errorDuplicateDomain: string;
		emptyTitle: string;
		emptySubtitle: string;
		clearAll: string;
		blockedBadge: string;
	};
	blocked: {
		title: string;
		subtitle: string;
		timerLabel: string;
		messageLine1: string;
		messageLine2: string;
		backButton: string;
	};
	settings: {
		lockedBanner: string;
		focusGroup: string;
		breaksGroup: string;
		cyclesGroup: string;
		workDurationLabel: string;
		workDurationDesc: string;
		shortBreakLabel: string;
		shortBreakDesc: string;
		longBreakLabel: string;
		longBreakDesc: string;
		sessionsPerSetLabel: string;
		sessionsPerSetDesc: string;
		unitMin: string;
		unitSessions: string;
		previewWork: string;
		previewShort: string;
		previewLong: string;
		summaryLongBreak: string;
		summaryTotal: string;
		reportBug: string;
	};
	common: {
		hourShort: string;
		minuteShort: string;
	};
}

export interface IntlApi extends IntlDictionary {
	languageName: (code: AppLanguage) => string;
	siteCount: (count: number) => string;
	sessionsProgress: (done: number, total: number) => string;
	settingsFocusCount: (count: number) => string;
	settingsShortCount: (count: number) => string;
	removeSiteTitle: (site: string) => string;
}

const DICTIONARIES: Record<AppLanguage, IntlDictionary> = {
	en: {
		header: {
			focusPill: 'FOCUS',
			themeToggleTitle: 'Toggle theme',
			languageSelectTitle: 'Choose language',
		},
		tabs: {
			timer: 'Timer',
			sites: 'Sites',
			settings: 'Settings',
		},
		timer: {
			phases: {
				work: 'Focus Session',
				shortBreak: 'Short Break',
				longBreak: 'Long Break',
			},
			paused: 'paused',
			startFocus: 'Start Focus',
			pause: 'Pause',
			resume: 'Resume',
			skip: 'Skip',
			reset: 'Reset',
			skipTitle: 'Skip to next phase',
			resetTitle: 'Reset timer',
		},
		siteList: {
			activeBanner: 'Blocking active — sites are currently blocked',
			placeholder: 'youtube.com, twitter.com…',
			add: 'Add',
			errorInvalidDomain: 'Enter a valid domain like youtube.com',
			errorDuplicateDomain: 'Already in your block list',
			emptyTitle: 'No sites blocked yet',
			emptySubtitle:
				'Add websites you want to avoid during focus sessions',
			clearAll: 'Clear all',
			blockedBadge: 'blocked',
		},
		blocked: {
			title: 'Stay Focused!',
			subtitle: 'This site is blocked during your Pomodoro session.',
			timerLabel: 'Time Remaining',
			messageLine1: 'Stay on track and finish your session strong.',
			messageLine2: 'You can access this site during your break.',
			backButton: '← Go Back',
		},
		settings: {
			lockedBanner:
				'Settings are locked while timer is running. Reset to make changes.',
			focusGroup: 'Focus Time',
			breaksGroup: 'Breaks',
			cyclesGroup: 'Cycles',
			workDurationLabel: 'Work Duration',
			workDurationDesc: 'Length of each focus session',
			shortBreakLabel: 'Short Break',
			shortBreakDesc: 'Rest after each focus session',
			longBreakLabel: 'Long Break',
			longBreakDesc: 'Rest after completing all cycles',
			sessionsPerSetLabel: 'Sessions per Set',
			sessionsPerSetDesc: 'Focus sessions before a long break',
			unitMin: 'min',
			unitSessions: 'sessions',
			previewWork: 'Work',
			previewShort: 'Short',
			previewLong: 'Long',
			summaryLongBreak: 'long break',
			summaryTotal: 'total',
			reportBug: 'Report a bug',
		},
		common: {
			hourShort: 'h',
			minuteShort: 'm',
		},
	},
	ru: {
		header: {
			focusPill: 'ФОКУС',
			themeToggleTitle: 'Сменить тему',
			languageSelectTitle: 'Выбрать язык',
		},
		tabs: {
			timer: 'Таймер',
			sites: 'Сайты',
			settings: 'Настройки',
		},
		timer: {
			phases: {
				work: 'Фокус-сессия',
				shortBreak: 'Короткий перерыв',
				longBreak: 'Длинный перерыв',
			},
			paused: 'пауза',
			startFocus: 'Начать фокус',
			pause: 'Пауза',
			resume: 'Продолжить',
			skip: 'Пропустить',
			reset: 'Сброс',
			skipTitle: 'Перейти к следующей фазе',
			resetTitle: 'Сбросить таймер',
		},
		siteList: {
			activeBanner: 'Блокировка активна — сайты сейчас заблокированы',
			placeholder: 'youtube.com, twitter.com…',
			add: 'Добавить',
			errorInvalidDomain:
				'Введите корректный домен, например youtube.com',
			errorDuplicateDomain: 'Сайт уже в списке блокировки',
			emptyTitle: 'Пока нет заблокированных сайтов',
			emptySubtitle:
				'Добавьте сайты, которых хотите избегать во время фокуса',
			clearAll: 'Очистить все',
			blockedBadge: 'блок',
		},
		blocked: {
			title: 'Сфокусируйтесь!',
			subtitle: 'Этот сайт заблокирован во время вашей помодоро-сессии.',
			timerLabel: 'Оставшееся время',
			messageLine1: 'Держите фокус и завершите сессию уверенно.',
			messageLine2: 'Вы сможете открыть этот сайт во время перерыва.',
			backButton: '← Назад',
		},
		settings: {
			lockedBanner:
				'Настройки заблокированы во время работы таймера. Сбросьте таймер, чтобы изменить их.',
			focusGroup: 'Фокус',
			breaksGroup: 'Перерывы',
			cyclesGroup: 'Циклы',
			workDurationLabel: 'Длительность работы',
			workDurationDesc: 'Длина одной фокус-сессии',
			shortBreakLabel: 'Короткий перерыв',
			shortBreakDesc: 'Отдых после каждой фокус-сессии',
			longBreakLabel: 'Длинный перерыв',
			longBreakDesc: 'Отдых после завершения всех циклов',
			sessionsPerSetLabel: 'Сессий в цикле',
			sessionsPerSetDesc: 'Фокус-сессий до длинного перерыва',
			unitMin: 'мин',
			unitSessions: 'сесс.',
			previewWork: 'Работа',
			previewShort: 'Коротк.',
			previewLong: 'Длинн.',
			summaryLongBreak: 'длинный перерыв',
			summaryTotal: 'итого',
			reportBug: 'Сообщить об ошибке',
		},
		common: {
			hourShort: 'ч',
			minuteShort: 'м',
		},
	},
	es: {
		header: {
			focusPill: 'FOCO',
			themeToggleTitle: 'Cambiar tema',
			languageSelectTitle: 'Elegir idioma',
		},
		tabs: {
			timer: 'Temporizador',
			sites: 'Sitios',
			settings: 'Ajustes',
		},
		timer: {
			phases: {
				work: 'Sesión de enfoque',
				shortBreak: 'Descanso corto',
				longBreak: 'Descanso largo',
			},
			paused: 'pausado',
			startFocus: 'Iniciar enfoque',
			pause: 'Pausar',
			resume: 'Reanudar',
			skip: 'Saltar',
			reset: 'Reiniciar',
			skipTitle: 'Saltar a la siguiente fase',
			resetTitle: 'Reiniciar temporizador',
		},
		siteList: {
			activeBanner:
				'Bloqueo activo — los sitios están bloqueados ahora mismo',
			placeholder: 'youtube.com, twitter.com…',
			add: 'Agregar',
			errorInvalidDomain:
				'Ingresa un dominio válido como youtube.com',
			errorDuplicateDomain: 'Ya está en tu lista de bloqueo',
			emptyTitle: 'Todavía no hay sitios bloqueados',
			emptySubtitle:
				'Agrega sitios web que quieras evitar durante el enfoque',
			clearAll: 'Borrar todo',
			blockedBadge: 'bloq.',
		},
		blocked: {
			title: '¡Mantén el foco!',
			subtitle: 'Este sitio está bloqueado durante tu sesión Pomodoro.',
			timerLabel: 'Tiempo restante',
			messageLine1: 'Mantente en camino y termina tu sesión con fuerza.',
			messageLine2: 'Podrás acceder a este sitio durante tu descanso.',
			backButton: '← Volver',
		},
		settings: {
			lockedBanner:
				'Los ajustes están bloqueados mientras el temporizador está activo. Reinicia para cambiarlos.',
			focusGroup: 'Enfoque',
			breaksGroup: 'Descansos',
			cyclesGroup: 'Ciclos',
			workDurationLabel: 'Duración de trabajo',
			workDurationDesc: 'Duración de cada sesión de enfoque',
			shortBreakLabel: 'Descanso corto',
			shortBreakDesc: 'Descanso después de cada sesión',
			longBreakLabel: 'Descanso largo',
			longBreakDesc: 'Descanso tras completar todos los ciclos',
			sessionsPerSetLabel: 'Sesiones por ciclo',
			sessionsPerSetDesc: 'Sesiones antes de un descanso largo',
			unitMin: 'min',
			unitSessions: 'ses.',
			previewWork: 'Trabajo',
			previewShort: 'Corto',
			previewLong: 'Largo',
			summaryLongBreak: 'descanso largo',
			summaryTotal: 'total',
			reportBug: 'Reportar un error',
		},
		common: {
			hourShort: 'h',
			minuteShort: 'm',
		},
	},
};

function getLanguageDisplayNamesCtor(): IntlDisplayNamesCtor | null {
	const maybeIntl = Intl as typeof Intl & {
		DisplayNames?: IntlDisplayNamesCtor;
	};
	return maybeIntl.DisplayNames ?? null;
}

function fallbackLanguageName(code: AppLanguage): string {
	switch (code) {
		case 'ru':
			return 'Русский';
		case 'es':
			return 'Español';
		default:
			return 'English';
	}
}

function formatLanguageName(code: AppLanguage, uiLanguage: AppLanguage): string {
	const DisplayNames = getLanguageDisplayNamesCtor();
	if (!DisplayNames) return fallbackLanguageName(code);

	try {
		const label = new DisplayNames([uiLanguage], { type: 'language' }).of(
			code,
		);
		if (!label) return fallbackLanguageName(code);
		return label.charAt(0).toUpperCase() + label.slice(1);
	} catch {
		return fallbackLanguageName(code);
	}
}

function pluralizeEn(count: number, singular: string, plural: string): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

function pluralizeRu(
	count: number,
	one: string,
	few: string,
	many: string,
): string {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) return `${count} ${one}`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
		return `${count} ${few}`;
	}
	return `${count} ${many}`;
}

type MessageSubstitutions = string | string[];

function hasChromeI18n(): boolean {
	return (
		typeof chrome !== 'undefined' &&
		typeof chrome.i18n?.getMessage === 'function'
	);
}

function getLocalizedMessage(
	baseKey: string,
	language: AppLanguage,
	fallback: string,
	substitutions?: MessageSubstitutions,
): string {
	if (!hasChromeI18n()) return fallback;

	const value = chrome.i18n.getMessage(
		`${baseKey}_${language}`,
		substitutions,
	);
	if (value) return value;

	const enValue = chrome.i18n.getMessage(`${baseKey}_en`, substitutions);
	if (enValue) return enValue;

	return fallback;
}

function localizeDictionary<T extends object>(
	source: T,
	language: AppLanguage,
	prefix = '',
): T {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
		const path = prefix ? `${prefix}_${key}` : key;
		if (typeof value === 'string') {
			result[key] = getLocalizedMessage(path, language, value);
			continue;
		}

		if (value && typeof value === 'object' && !Array.isArray(value)) {
			result[key] = localizeDictionary(
				value as Record<string, unknown>,
				language,
				path,
			);
			continue;
		}

		result[key] = value;
	}

	return result as T;
}

function getRuPluralForm(count: number): 'one' | 'few' | 'many' {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) return 'one';
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
		return 'few';
	}
	return 'many';
}

export function getIntl(language: AppLanguage) {
	const t = localizeDictionary<IntlDictionary>(
		DICTIONARIES[language] ?? DICTIONARIES.en,
		language,
	);

	return {
		...t,
		languageName: (code: AppLanguage) => formatLanguageName(code, language),
		siteCount: (count: number) => {
			if (language === 'ru') {
				return getLocalizedMessage(
					`siteCount_${getRuPluralForm(count)}`,
					language,
					pluralizeRu(count, 'сайт', 'сайта', 'сайтов'),
					String(count),
				);
			}
			const fallback =
				language === 'es'
					? pluralizeEn(count, 'sitio', 'sitios')
					: pluralizeEn(count, 'site', 'sites');
			return getLocalizedMessage(
				count === 1 ? 'siteCount_one' : 'siteCount_other',
				language,
				fallback,
				String(count),
			);
		},
		sessionsProgress: (done: number, total: number) => {
			const fallback =
				language === 'ru'
					? `${done}/${total} сессий`
					: language === 'es'
						? `${done}/${total} sesiones`
						: `${done}/${total} sessions`;
			return getLocalizedMessage(
				'sessionsProgress',
				language,
				fallback,
				[String(done), String(total)],
			);
		},
		settingsFocusCount: (count: number) => {
			const fallback =
				language === 'ru'
					? `× ${count} фокус`
					: language === 'es'
						? `× ${count} enfoque`
						: `× ${count} focus`;
			return getLocalizedMessage(
				'settingsFocusCount',
				language,
				fallback,
				String(count),
			);
		},
		settingsShortCount: (count: number) => {
			const fallback =
				language === 'ru'
					? `× ${count} коротк.`
					: language === 'es'
						? `× ${count} corto`
						: `× ${count} short`;
			return getLocalizedMessage(
				'settingsShortCount',
				language,
				fallback,
				String(count),
			);
		},
		removeSiteTitle: (site: string) => {
			const fallback =
				language === 'ru'
					? `Удалить ${site}`
					: language === 'es'
						? `Quitar ${site}`
						: `Remove ${site}`;
			return getLocalizedMessage('removeSiteTitle', language, fallback, site);
		},
	};
}
