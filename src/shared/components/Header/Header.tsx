import { getIntl, SUPPORTED_LANGUAGES } from '../../intl';
import { AppLanguage, Settings } from '../../types';
import { LanguageIcon, MoonIcon, SunIcon } from '../Icons';
import styles from './Header.module.css';

interface HeaderProps {
	language: AppLanguage;
	theme: Settings['theme'];
	isWorking: boolean;
	onLanguageChange: (language: AppLanguage) => void;
	onThemeToggle: () => void;
}

export function Header({
	isWorking,
	language,
	onLanguageChange,
	onThemeToggle,
	theme,
}: HeaderProps) {
	const intl = getIntl(language);

	return (
		<header className={styles.header}>
			<div className={styles.logo}>
				<span className={styles.logoIcon}>🍅</span>
				<span className={styles.logoText}>PomoBlock</span>
				{isWorking && (
					<span className={styles.activePill}>{intl.header.focusPill}</span>
				)}
			</div>
			<div className={styles.headerActions}>
				<label
					className={styles.languagePicker}
					title={intl.header.languageSelectTitle}
				>
					<span className={styles.languageIcon}>
						<LanguageIcon />
					</span>
					<select
						className={styles.languageSelect}
						value={language}
						aria-label={intl.header.languageSelectTitle}
						onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
					>
						{SUPPORTED_LANGUAGES.map((code) => (
							<option key={code} value={code}>
								{intl.languageName(code)}
							</option>
						))}
					</select>
				</label>
				<button
					className={styles.themeBtn}
					onClick={onThemeToggle}
					title={intl.header.themeToggleTitle}
				>
					{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
				</button>
			</div>
		</header>
	);
}
