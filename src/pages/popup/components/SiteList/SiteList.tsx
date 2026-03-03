import React, { useRef, useState } from 'react';
import {
	CloseIcon,
	PlusIcon,
	SearchIcon,
} from '../../../../shared/components/Icons';
import { getIntl } from '../../../../shared/intl';
import { classNames } from '../../../../shared/utils';
import {
	isValidDomain,
	normalizeDomain,
} from '../../../../shared/utils/domain';
import styles from './SiteList.module.css';
import { SiteListProps } from './types';

export function SiteList({
	sites,
	language,
	isBlocking,
	onChange,
}: SiteListProps) {
	const [inputValue, setInputValue] = useState('');
	const [error, setError] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const intl = getIntl(language);

	const handleAdd = () => {
		const domain = normalizeDomain(inputValue);
		if (!domain) return;

		if (!isValidDomain(domain)) {
			setError(intl.siteList.errorInvalidDomain);
			return;
		}

		if (sites.includes(domain)) {
			setError(intl.siteList.errorDuplicateDomain);
			return;
		}

		onChange([...sites, domain]);
		setInputValue('');
		setError('');
		inputRef.current?.focus();
	};

	const handleRemove = (domain: string) => {
		onChange(sites.filter((s) => s !== domain));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') handleAdd();
		if (e.key === 'Escape') {
			setInputValue('');
			setError('');
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		if (error) setError('');
	};

	return (
		<div className={styles.container}>
			{/* Status banner when blocking is active */}
			{isBlocking && (
				<div className={styles.activeBanner}>
					<span className={styles.activeDot} />
					{intl.siteList.activeBanner}
				</div>
			)}

			{/* Add input */}
			<div className={styles.addSection}>
				<div
					className={classNames(styles.inputWrapper, {
						[styles.inputError]: Boolean(error),
					})}
				>
					<SearchIcon className={styles.inputIcon} />
					<input
						ref={inputRef}
						className={styles.input}
						type="text"
						placeholder={intl.siteList.placeholder}
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						autoFocus
					/>
					{inputValue && (
						<button
							className={styles.clearBtn}
							onClick={() => {
								setInputValue('');
								setError('');
								inputRef.current?.focus();
							}}
						>
							<CloseIcon />
						</button>
					)}
				</div>
				<button
					className={styles.addBtn}
					onClick={handleAdd}
					disabled={!inputValue.trim()}
				>
					<PlusIcon />
					{intl.siteList.add}
				</button>
			</div>

			{error && <p className={styles.errorMsg}>{error}</p>}

			{/* Site list */}
			<div className={styles.listSection}>
				{sites.length === 0 ? (
					<div className={styles.empty}>
						<div className={styles.emptyIcon}>🛡️</div>
						<p className={styles.emptyTitle}>
							{intl.siteList.emptyTitle}
						</p>
						<p className={styles.emptySubtitle}>
							{intl.siteList.emptySubtitle}
						</p>
					</div>
				) : (
					<>
						<div className={styles.listHeader}>
							<span className={styles.listCount}>
								{intl.siteCount(sites.length)}
							</span>
							{sites.length > 1 && (
								<button
									className={styles.clearAllBtn}
									onClick={() => onChange([])}
								>
									{intl.siteList.clearAll}
								</button>
							)}
						</div>
						<ul className={styles.list}>
							{sites.map((site) => (
								<li
									key={site}
									className={classNames(styles.siteItem, {
										[styles.siteItemActive]: isBlocking,
									})}
								>
									<div className={styles.siteFavicon}>
										<img
											src={`https://www.google.com/s2/favicons?sz=32&domain_url=${site}`}
											alt=""
											width={16}
											height={16}
											onError={(e) => {
												(
													e.target as HTMLImageElement
												).style.display = 'none';
											}}
										/>
									</div>
									<span className={styles.siteName}>
										{site}
									</span>
									{isBlocking && (
										<span className={styles.blockedBadge}>
											{intl.siteList.blockedBadge}
										</span>
									)}
									<button
										className={styles.removeBtn}
										onClick={() => handleRemove(site)}
										title={intl.removeSiteTitle(site)}
									>
										<CloseIcon />
									</button>
								</li>
							))}
						</ul>
					</>
				)}
			</div>
		</div>
	);
}
