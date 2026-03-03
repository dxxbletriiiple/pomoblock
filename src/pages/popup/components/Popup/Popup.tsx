import {
	Header,
	classNames,
	TabComponent,
	TABS,
} from '../../../../shared';
import { PopupProvider, usePopupContext } from '../../context';
import { SettingsPanel } from '../SettingsPanel/SettingsPanel';
import { SiteList } from '../SiteList';
import { Timer } from '../Timer';
import styles from './Popup.module.css';

const PopupContent = () => {
	const {
		activeTab,
		getTabBadge,
		intl,
		isWorking,
		language,
		loading,
		setActiveTab,
		setLanguage,
		theme,
		toggleTheme,
	} = usePopupContext();

	return (
		<div className={classNames(styles.root, styles[theme])}>
			<Header
				language={language}
				theme={theme}
				isWorking={isWorking}
				onLanguageChange={setLanguage}
				onThemeToggle={toggleTheme}
			/>

			<nav className={styles.tabs}>
				{TABS.map((tab) => (
					<TabComponent
						key={tab}
						onClick={() => setActiveTab(tab)}
						isActive={activeTab === tab}
						badge={getTabBadge(tab)}
					>
						{intl.tabs[tab]}
					</TabComponent>
				))}
			</nav>

			<main className={styles.content}>
				{loading ? (
					<div className={styles.loader}>
						<div className={styles.spinner} />
					</div>
				) : (
					<>
						{activeTab === 'timer' && <Timer />}
						{activeTab === 'sites' && <SiteList />}
						{activeTab === 'settings' && <SettingsPanel />}
					</>
				)}
			</main>
		</div>
	);
};

export const Popup = () => {
	return (
		<PopupProvider>
			<PopupContent />
		</PopupProvider>
	);
};
