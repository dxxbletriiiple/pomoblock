import { ReactNode } from 'react';

export interface TabProps {
	badge: ReactNode;
	children: ReactNode;
	className?: string;
	isActive: boolean;
	onClick: () => void;
}
