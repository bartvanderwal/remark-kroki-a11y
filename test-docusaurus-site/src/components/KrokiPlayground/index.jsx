import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.css';
import * as a11yRuntime from '../../../../src/runtime/a11yRuntime';
import classDiagramSimplifier from '../../../../src/parsers/classDiagramSimplifier.js';

const PLANTUML_EXAMPLE = `@startuml
skinparam classAttributeIconSize 0

class Order {
  +id : OrderId
  +status : OrderStatus
  +customerId : CustomerId
  +totalAmount : Money
  +place() : void
}

class OrderLine {
  +id : OrderLineId
  +productId : ProductId
  +quantity : int
  +unitPrice : Money
}

class Customer {
  +id : CustomerId
  +email : EmailAddress
  +name : Name
}

interface PaymentPort {
  +authorize(amount : Money) : PaymentResult
}

Order *-- OrderLine : contains
Order --> Customer : for
Order ..> PaymentPort : uses
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

const LS_LAST_ATTEMPTED_PLANTUML = 'krokiPlayground.lastAttemptedPlantuml';
const LS_LAST_SUCCESSFUL_PLANTUML = 'krokiPlayground.lastSuccessfulPlantuml';

function normalizeBaseUrl(url) {
  return (url || 'https://kroki.io').trim().replace(/\/$/, '');
}

const {
  generateA11yFromSource,
  detectPlantUMLDiagramType,
  uiLabels = {},
  languageNames = {},
} = a11yRuntime || {};

const {
  generateDevModePlantUMLClassDiagram,
  simplifyPlantUMLClassDiagram,
} = classDiagramSimplifier || {};

export default function KrokiPlayground() {
  const [diagramType, setDiagramType] = useState('plantuml');
  const [serverPreset, setServerPreset] = useState('kroki');
  const [customBaseUrl, setCustomBaseUrl] = useState('https://kroki.io');
  const [source, setSource] = useState(PLANTUML_EXAMPLE);
  const [previewSrc, setPreviewSrc] = useState('');
  const [previewSrcDev, setPreviewSrcDev] = useState('');
  const [previewSrcSimpler, setPreviewSrcSimpler] = useState('');
  const [diagramMode, setDiagramMode] = useState('dev');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [activeTab, setActiveTab] = useState('source');
  const [hideSource, setHideSource] = useState(false);
  const [hideA11y, setHideA11y] = useState(false);
  const [showDiagramModeToggle, setShowDiagramModeToggle] = useState(true);
  const [showDiagramLegend, setShowDiagramLegend] = useState(true);
  const [lastAttemptedPlantuml, setLastAttemptedPlantuml] = useState('');
  const [lastSuccessfulPlantuml, setLastSuccessfulPlantuml] = useState('');
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
  const isPlantUmlClassDiagram = useMemo(() => {
    if (diagramType !== 'plantuml' || typeof detectPlantUMLDiagramType !== 'function') return false;
    return detectPlantUMLDiagramType(source) === 'classDiagram';
  }, [diagramType, source]);
  const canShowDiagramModeToggle = Boolean(showDiagramModeToggle && isPlantUmlClassDiagram);
  const previewImageSrc = useMemo(() => {
    if (!canShowDiagramModeToggle) return previewSrc;
    return diagramMode === 'simpler' ? previewSrcSimpler : previewSrcDev;
  }, [canShowDiagramModeToggle, diagramMode, previewSrc, previewSrcDev, previewSrcSimpler]);
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
  const sourceTabLabel = useMemo(() => {
    const langName = languageNames[diagramType] || diagramType;
    if (locale === 'nl') {
      return `${langName} broncode`;
    }
    return `${langName} source`;
  }, [diagramType, locale]);
  const showSourceTab = !hideSource;
  const showA11yTab = !hideA11y;
  const showDetails = showSourceTab || showA11yTab;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedAttempted = window.localStorage.getItem(LS_LAST_ATTEMPTED_PLANTUML) || '';
    const storedSuccessful = window.localStorage.getItem(LS_LAST_SUCCESSFUL_PLANTUML) || '';
    setLastAttemptedPlantuml(storedAttempted);
    setLastSuccessfulPlantuml(storedSuccessful);
    if (storedAttempted) {
      setSource(storedAttempted);
    }
  }, []);

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

  async function renderSvg(sourceCode) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'image/svg+xml',
        'Content-Type': 'text/plain; charset=utf-8',
      },
      body: sourceCode,
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`${response.status} ${response.statusText}${details ? `: ${details}` : ''}`);
    }

    const svg = await response.text();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  async function renderDiagram() {
    setIsLoading(true);
    setError('');
    setPreviewSrc('');
    setPreviewSrcDev('');
    setPreviewSrcSimpler('');

    try {
      if (diagramType === 'plantuml') {
        setLastAttemptedPlantuml(source);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(LS_LAST_ATTEMPTED_PLANTUML, source);
        }
      }

      if (canShowDiagramModeToggle) {
        if (typeof generateDevModePlantUMLClassDiagram !== 'function' || typeof simplifyPlantUMLClassDiagram !== 'function') {
          throw new Error('Class diagram mode toggle is unavailable in this build.');
        }

        const devModeSource = generateDevModePlantUMLClassDiagram(source, {
          showLegend: showDiagramLegend,
          locale,
        });
        const simplerModeSource = simplifyPlantUMLClassDiagram(source, {
          showLegend: false,
          locale,
        });

        if (!devModeSource || !simplerModeSource) {
          throw new Error('Could not generate class diagram variants. Check PlantUML class syntax.');
        }

        const [devSvg, simplerSvg] = await Promise.all([
          renderSvg(devModeSource),
          renderSvg(simplerModeSource),
        ]);

        setPreviewSrcDev(devSvg);
        setPreviewSrcSimpler(simplerSvg);
      } else {
        const svg = await renderSvg(source);
        setPreviewSrc(svg);
      }

      if (diagramType === 'plantuml') {
        setLastSuccessfulPlantuml(source);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(LS_LAST_SUCCESSFUL_PLANTUML, source);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown render error');
    } finally {
      setIsLoading(false);
    }
  }

  function loadExample(nextType) {
    setDiagramType(nextType);
    if (nextType === 'mermaid') {
      setSource(MERMAID_EXAMPLE);
    } else {
      setSource(lastAttemptedPlantuml || PLANTUML_EXAMPLE);
    }
    setPreviewSrc('');
    setPreviewSrcDev('');
    setPreviewSrcSimpler('');
    setError('');
    setActiveTab('source');
    setDiagramMode('dev');
  }

  function clearPlantumlStorage() {
    setLastAttemptedPlantuml('');
    setLastSuccessfulPlantuml('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LS_LAST_ATTEMPTED_PLANTUML);
      window.localStorage.removeItem(LS_LAST_SUCCESSFUL_PLANTUML);
    }
    if (diagramType === 'plantuml') {
      setSource(PLANTUML_EXAMPLE);
      setError('');
      setPreviewSrc('');
      setPreviewSrcDev('');
      setPreviewSrcSimpler('');
      setDiagramMode('dev');
    }
  }

  function restoreLastWorkingPlantuml() {
    if (!lastSuccessfulPlantuml) return;
    setSource(lastSuccessfulPlantuml);
    setError('');
  }

  const canRestoreLastWorkingPlantuml = diagramType === 'plantuml' &&
    Boolean(error) &&
    Boolean(lastSuccessfulPlantuml) &&
    lastSuccessfulPlantuml !== source;

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

      {diagramType === 'plantuml' && (
        <div className={styles.storageActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={clearPlantumlStorage}
          >
            Clear plantuml from localStorage
          </button>
          {canRestoreLastWorkingPlantuml && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={restoreLastWorkingPlantuml}
            >
              Restore to last working plantuml
            </button>
          )}
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          Render failed: {error}
        </p>
      )}

      <figure className={styles.preview}>
        {previewImageSrc ? (
          <img
            src={previewImageSrc}
            alt={canShowDiagramModeToggle ? `Rendered ${diagramType} class diagram (${diagramMode})` : `Rendered ${diagramType} diagram`}
          />
        ) : (
          <p className={styles.previewPlaceholder}>
            No diagram rendered yet. Click <strong>Render preview</strong>.
          </p>
        )}
        <figcaption>
          Kroki render preview
          {canShowDiagramModeToggle ? ` (${diagramMode === 'simpler' ? 'Simpler' : 'For devs'})` : ''}
        </figcaption>
      </figure>

      {canShowDiagramModeToggle && (
        <div className={styles.modeToggle} data-diagram-group="playground-class-mode" aria-label="Class diagram visual mode">
          <button
            type="button"
            className={`${styles.modeToggleBtn} ${diagramMode === 'dev' ? styles.modeToggleBtnActive : ''}`}
            aria-pressed={diagramMode === 'dev'}
            onClick={() => setDiagramMode('dev')}
          >
            For devs
          </button>
          <button
            type="button"
            className={`${styles.modeToggleBtn} ${diagramMode === 'simpler' ? styles.modeToggleBtnActive : ''}`}
            aria-pressed={diagramMode === 'simpler'}
            onClick={() => setDiagramMode('simpler')}
          >
            Simpler
          </button>
        </div>
      )}

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
            checked={hideA11y}
            onChange={(event) => setHideA11y(event.target.checked)}
          />
          hideA11y
        </label>
        <label>
          <input
            type="checkbox"
            checked={showDiagramModeToggle}
            onChange={(event) => setShowDiagramModeToggle(event.target.checked)}
          />
          showDiagramModeToggle (PlantUML class diagrams)
        </label>
        <label>
          <input
            type="checkbox"
            checked={showDiagramLegend}
            onChange={(event) => setShowDiagramLegend(event.target.checked)}
            disabled={!showDiagramModeToggle}
          />
          showDiagramLegend (For devs only)
        </label>
      </fieldset>

      {showDetails && (
        <>
          <details className={`diagram-expandable-source ${styles.playgroundDetails}`} open>
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
                    {sourceTabLabel}
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
