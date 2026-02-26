import React, { useState, useRef } from 'react';
import styles from './SiteList.module.css';
import { CloseIcon, PlusIcon, SearchIcon } from '../Icons';

interface Props {
  sites: string[];
  isBlocking: boolean;
  onChange: (sites: string[]) => void;
}

function normalizeDomain(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split('?')[0]
    .replace(/^www\./, '');
}

function isValidDomain(domain: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain);
}

export function SiteList({ sites, isBlocking, onChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const domain = normalizeDomain(inputValue);
    if (!domain) return;

    if (!isValidDomain(domain)) {
      setError('Enter a valid domain like youtube.com');
      return;
    }

    if (sites.includes(domain)) {
      setError('Already in your block list');
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
          Blocking active — sites are currently blocked
        </div>
      )}

      {/* Add input */}
      <div className={styles.addSection}>
        <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''}`}>
          <SearchIcon className={styles.inputIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="youtube.com, twitter.com…"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {inputValue && (
            <button
              className={styles.clearBtn}
              onClick={() => { setInputValue(''); setError(''); inputRef.current?.focus(); }}
            >
              <CloseIcon />
            </button>
          )}
        </div>
        <button className={styles.addBtn} onClick={handleAdd} disabled={!inputValue.trim()}>
          <PlusIcon />
          Add
        </button>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {/* Site list */}
      <div className={styles.listSection}>
        {sites.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛡️</div>
            <p className={styles.emptyTitle}>No sites blocked yet</p>
            <p className={styles.emptySubtitle}>Add websites you want to avoid during focus sessions</p>
          </div>
        ) : (
          <>
            <div className={styles.listHeader}>
              <span className={styles.listCount}>{sites.length} site{sites.length !== 1 ? 's' : ''}</span>
              {sites.length > 1 && (
                <button
                  className={styles.clearAllBtn}
                  onClick={() => onChange([])}
                >
                  Clear all
                </button>
              )}
            </div>
            <ul className={styles.list}>
              {sites.map((site) => (
                <li key={site} className={`${styles.siteItem} ${isBlocking ? styles.siteItemActive : ''}`}>
                  <div className={styles.siteFavicon}>
                    <img
                      src={`https://www.google.com/s2/favicons?sz=32&domain_url=${site}`}
                      alt=""
                      width={16}
                      height={16}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <span className={styles.siteName}>{site}</span>
                  {isBlocking && <span className={styles.blockedBadge}>blocked</span>}
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(site)}
                    title={`Remove ${site}`}
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
