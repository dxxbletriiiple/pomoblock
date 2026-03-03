import { classNames as cn } from '../../utils';
import styles from './Tab.module.css';
import { TabProps } from './types';

export const TabComponent = ({
	badge,
	children,
	className,
	isActive,
	onClick,
}: TabProps) => {
	return (
		<button
			className={cn(styles.tab, className, { [styles.active]: isActive })}
			onClick={onClick}
		>
			{children}
			{badge && <span className={styles.badge}>{badge}</span>}
		</button>
	);
};
