import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.css';
import * as a11yRuntime from '../../../../src/runtime/a11yRuntime';

const PLANTUML_EXAMPLE = `@startuml
actor User
participant "Web App" as App
participant "API" as Api

User -> App: Open test tool
App -> Api: POST /render
Api --> App: SVG image
App --> User: Show diagram
@enduml`;

const MERMAID_EXAMPLE = `sequenceDiagram
  participant User
  participant App as Web App
  participant Api as API

  User->>App: Open test tool
  App->>Api: POST /render
  Api-->>App: SVG image
  App-->>User: Show diagram`;

const SERVER_PRESETS = {
  kroki: 'https://kroki.io',
  localhost: 'http://localhost:8000',
};

function normalizeBaseUrl(url) {
  return (url || 'https://kroki.io').trim().replace(/\/$/, '');
}

const {
  generateA11yFromSource,
  uiLabels = {},
  languageNames = {},
} = a11yRuntime || {};

export default function KrokiPlayground() {
  const [diagramType, setDiagramType] = useState('plantuml');
  const [serverPreset, setServerPreset] = useState('kroki');
  const [customBaseUrl, setCustomBaseUrl] = useState('https://kroki.io');
  const [source, setSource] = useState(PLANTUML_EXAMPLE);
  const [previewSrc, setPreviewSrc] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [activeTab, setActiveTab] = useState('source');
  const [hideSource, setHideSource] = useState(false);
  const [hidePlantUML, setHidePlantUML] = useState(false);
  const [hideA11y, setHideA11y] = useState(false);
  const locale = 'en';

  const normalizedBaseUrl = useMemo(
    () => normalizeBaseUrl(
      serverPreset === 'custom' ? customBaseUrl : SERVER_PRESETS[serverPreset]
    ),
    [serverPreset, customBaseUrl]
  );
  const endpoint = useMemo(
    () => `${normalizedBaseUrl}/${diagramType}/svg`,
    [normalizedBaseUrl, diagramType]
  );
  const healthEndpoint = useMemo(
    () => `${normalizedBaseUrl}/health`,
    [normalizedBaseUrl]
  );
  const ui = (uiLabels && uiLabels[locale]) || {
    tabSource: 'Source',
    tabA11y: 'In natural language',
    summaryText: '{type} source for "{title}"',
  };
  const a11yResult = useMemo(() => {
    if (typeof generateA11yFromSource !== 'function') {
      return {
        a11yDescription: '<p>Natural language description not yet available for this diagram type.</p>',
        a11yText: 'Natural language description not yet available for this diagram type.',
      };
    }
    return generateA11yFromSource({
      imgType: diagramType,
      content: source,
      locale,
    });
  }, [diagramType, source, locale]);
  const summaryText = useMemo(() => {
    const langName = languageNames[diagramType] || diagramType;
    return (ui.summaryText || '{type} source for "{title}"')
      .replace('{type}', langName)
      .replace('{title}', 'Playground preview');
  }, [diagramType, ui]);
  const effectiveHideSource = hideSource || (diagramType === 'plantuml' && hidePlantUML);
  const showSourceTab = !effectiveHideSource;
  const showA11yTab = !hideA11y;
  const showDetails = showSourceTab || showA11yTab;

  useEffect(() => {
    if (activeTab === 'source' && !showSourceTab && showA11yTab) {
      setActiveTab('a11y');
    } else if (activeTab === 'a11y' && !showA11yTab && showSourceTab) {
      setActiveTab('source');
    }
  }, [activeTab, showSourceTab, showA11yTab]);

  async function checkServerStatus() {
    setServerStatus('checking');
    setServerMessage('');

    try {
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      setServerStatus('online');
      setServerMessage(`Online (${healthEndpoint})`);
    } catch (err) {
      setServerStatus('offline');
      setServerMessage(err instanceof Error ? err.message : 'Server not reachable');
    }
  }

  useEffect(() => {
    checkServerStatus();
  }, [healthEndpoint]);

  async function renderDiagram() {
    setIsLoading(true);
    setError('');
    setPreviewSrc('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'image/svg+xml',
          'Content-Type': 'text/plain; charset=utf-8',
        },
        body: source,
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`${response.status} ${response.statusText}${details ? `: ${details}` : ''}`);
      }

      const svg = await response.text();
      setPreviewSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown render error');
    } finally {
      setIsLoading(false);
    }
  }

  function loadExample(nextType) {
    setDiagramType(nextType);
    setSource(nextType === 'mermaid' ? MERMAID_EXAMPLE : PLANTUML_EXAMPLE);
    setPreviewSrc('');
    setError('');
    setActiveTab('source');
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.controls}>
        <label>
          Diagram type
          <select
            value={diagramType}
            onChange={(event) => loadExample(event.target.value)}
          >
            <option value="plantuml">plantuml</option>
            <option value="mermaid">mermaid</option>
          </select>
        </label>

        <label>
          Kroki server
          <select
            value={serverPreset}
            onChange={(event) => setServerPreset(event.target.value)}
          >
            <option value="kroki">kroki.io (online)</option>
            <option value="localhost">localhost:8000 (docker local)</option>
            <option value="custom">Custom URL</option>
          </select>
        </label>

        <button type="button" onClick={renderDiagram} disabled={isLoading}>
          {isLoading ? 'Rendering...' : 'Render preview'}
        </button>
      </div>

      {serverPreset === 'custom' && (
        <label>
          Custom Kroki base URL
          <input
            type="text"
            value={customBaseUrl}
            onChange={(event) => setCustomBaseUrl(event.target.value)}
            placeholder="https://kroki.io"
          />
        </label>
      )}

      <div className={styles.statusRow}>
        <span className={styles.statusLabel}>Kroki status:</span>
        <span
          className={`${styles.statusBadge} ${
            serverStatus === 'online' ? styles.statusOnline
              : serverStatus === 'offline' ? styles.statusOffline
                : serverStatus === 'checking' ? styles.statusChecking
                  : styles.statusUnknown
          }`}
          aria-live="polite"
        >
          {serverStatus === 'online' && 'Online'}
          {serverStatus === 'offline' && 'Offline'}
          {serverStatus === 'checking' && 'Checking...'}
          {(serverStatus === 'idle' || serverStatus === '') && 'Unknown'}
        </span>
        <button
          type="button"
          className={styles.recheckButton}
          onClick={checkServerStatus}
          disabled={serverStatus === 'checking'}
        >
          Recheck
        </button>
      </div>

      {serverMessage && (
        <p className={styles.statusMessage}>
          {serverMessage}
        </p>
      )}

      <label>
        Source ({diagramType})
        <textarea
          value={source}
          onChange={(event) => setSource(event.target.value)}
          rows={14}
          spellCheck={false}
        />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          Render failed: {error}
        </p>
      )}

      <figure className={styles.preview}>
        {previewSrc ? (
          <img src={previewSrc} alt={`Rendered ${diagramType} diagram`} />
        ) : (
          <p className={styles.previewPlaceholder}>
            No diagram rendered yet. Click <strong>Render preview</strong>.
          </p>
        )}
        <figcaption>Kroki render preview</figcaption>
      </figure>

      <p className={styles.endpoint}>Endpoint: <code>{endpoint}</code></p>

      <fieldset className={styles.controls}>
        <legend>Plugin-like UI toggles</legend>
        <label>
          <input
            type="checkbox"
            checked={hideSource}
            onChange={(event) => setHideSource(event.target.checked)}
          />
          hideSource
        </label>
        <label>
          <input
            type="checkbox"
            checked={hidePlantUML}
            disabled={diagramType !== 'plantuml'}
            onChange={(event) => setHidePlantUML(event.target.checked)}
          />
          hidePlantUML (PlantUML only)
        </label>
        <label>
          <input
            type="checkbox"
            checked={hideA11y}
            onChange={(event) => setHideA11y(event.target.checked)}
          />
          hideA11y
        </label>
      </fieldset>

      {previewSrc && showDetails && (
        <>
          <details className="diagram-expandable-source">
            <summary>{summaryText}</summary>
            <section className={styles.tabsPanel}>
              <div className={styles.tabsList} role="tablist" aria-label="Diagram details">
                {showSourceTab && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'source'}
                    className={`${styles.tabButton} ${activeTab === 'source' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('source')}
                  >
                    {ui.tabSource || 'Source'}
                  </button>
                )}
                {showA11yTab && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'a11y'}
                    className={`${styles.tabButton} ${activeTab === 'a11y' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('a11y')}
                  >
                    {ui.tabA11y || 'In natural language'}
                  </button>
                )}
              </div>

              {activeTab === 'source' && showSourceTab && (
                <pre className={styles.tabContent}>
                  <code>{source}</code>
                </pre>
              )}

              {activeTab === 'a11y' && showA11yTab && (
                <div
                  className={styles.tabContent}
                  aria-label={a11yResult.a11yText}
                  dangerouslySetInnerHTML={{ __html: a11yResult.a11yDescription }}
                />
              )}
            </section>
          </details>
        </>
      )}
    </section>
  );
}
