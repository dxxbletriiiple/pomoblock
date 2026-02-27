import { AppLanguage } from '../../../../main';

export interface SiteListProps {
	sites: string[];
	language: AppLanguage;
	isBlocking: boolean;
	onChange: (sites: string[]) => void;
}
