import { ReactNode } from 'react';

export interface TabProps {
	badge: number | string | boolean;
	children: ReactNode;
	className?: string;
	isActive: boolean;
	onClick: () => void;
}
