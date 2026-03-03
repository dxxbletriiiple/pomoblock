import styles from './Button.module.css';
import { ButtonProps } from './types';

export const Button = ({ children, className, onClick }: ButtonProps) => {
	return (
		<>
			<button
				className={`${styles.btn}` + className ? className : ''}
				onClick={onClick}
			>
				{children}
			</button>
		</>
	);
};
