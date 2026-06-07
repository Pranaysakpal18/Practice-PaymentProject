import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ShieldCheck, Globe, ChevronDown } from 'lucide-react';
import { useCheckoutStore } from '../store/stepStore';
import { LANGUAGES } from '../utils/translations';
import { useTranslation } from '../hooks/useTranslation';

export default function CheckoutHeader({ showBack = false, onBack }) {
  const sessionData = useCheckoutStore((state) => state.sessionData);
  const setLanguage = useCheckoutStore((state) => state.setLanguage);
  const { t, language } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const merchantName = sessionData?.merchant?.name || 'Secure Merchant';
  const logoUrl = sessionData?.merchant?.logoUrl;
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '1.25rem',
      marginBottom: '1.75rem',
      borderBottom: '1px solid var(--border-color)',
      minHeight: '44px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {showBack && onBack ? (
          <button 
            onClick={onBack}
            aria-label="Go back"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronLeft size={20} />
          </button>
        ) : null}

        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={merchantName} 
            className="checkout-header-logo"
            style={{
              height: '24px',
              maxWidth: '120px',
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
        ) : (
          <span style={{ fontSize: '1rem', fontWeight: 650, color: 'var(--text-heading)' }}>
            {merchantName}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Custom Language Selector Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              backgroundColor: 'var(--bg-app)',
              border: dropdownOpen ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              padding: '0.35rem 0.65rem',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: dropdownOpen ? '0 0 0 3px var(--primary-light-bg)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!dropdownOpen) {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = 'var(--primary-light-bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!dropdownOpen) {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-app)';
              }
            }}
          >
            <Globe size={13} style={{ color: 'var(--text-muted)' }} />
            <span>{currentLang.flag} {currentLang.name}</span>
            <ChevronDown size={12} style={{ 
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', 
              transition: 'transform 0.2s ease',
              color: 'var(--text-muted)'
            }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.35rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.35rem',
              zIndex: 1000,
              minWidth: '145px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              animation: 'slideUpFade 0.2s ease'
            }}>
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      border: 'none',
                      background: isSelected ? 'var(--primary-light-bg)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 650 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--primary-light-bg)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-main)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Secure Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          color: '#10b981',
          fontWeight: 600,
          backgroundColor: '#ecfdf5',
          padding: '0.25rem 0.5rem',
          borderRadius: '20px'
        }}>
          <ShieldCheck size={14} />
          <span>{t('secure')}</span>
        </div>
      </div>
    </header>
  );
}

