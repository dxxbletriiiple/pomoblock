export interface SelectFieldProps {
	label: string;
	description: string;
	icon: React.ReactNode;
	value: number;
	options: number[];
	unit: string;
	disabled: boolean;
	color?: string;
	onChange: (v: number) => void;
}
