import { useEffect } from 'react';
import '../styles/vlibras.css';

const VLIBRAS_SCRIPT_URL = 'https://vlibras.gov.br/app/vlibras-plugin.js';
const VLIBRAS_ROOT_PATH = 'https://vlibras.gov.br/app';

/**
 * Widget oficial VLibras (Governo Federal).
 * Montado uma única vez na raiz da SPA — não re-inicializa em mudanças de rota.
 */
export default function VLibrasWidget() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.__zurbiVlibrasReady) {
      return undefined;
    }

    const initWidget = () => {
      if (window.__zurbiVlibrasReady || !window.VLibras?.Widget) return;
      window.__zurbiVlibrasReady = true;
      new window.VLibras.Widget({
        rootPath: VLIBRAS_ROOT_PATH,
        position: 'L',
        opacity: 1,
        avatar: 'random',
      });
    };

    const existingScript = document.querySelector(
      `script[src="${VLIBRAS_SCRIPT_URL}"]`
    );

    if (existingScript) {
      if (window.VLibras?.Widget) {
        initWidget();
      } else {
        existingScript.addEventListener('load', initWidget, { once: true });
      }
      return undefined;
    }

    const script = document.createElement('script');
    script.src = VLIBRAS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', initWidget, { once: true });
    document.body.appendChild(script);

    return undefined;
  }, []);

  return (
    <div className="enabled zurbi-vlibras-root" {...{ vw: '' }}>
      <div className="active" {...{ 'vw-access-button': '' }} />
      <div {...{ 'vw-plugin-wrapper': '' }}>
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
}
