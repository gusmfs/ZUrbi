import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  badgeClassStatus,
  labelCategoria,
  labelStatus,
} from '../utils/centralIa';
import './RecentReportsCarousel.css';

const CATEGORIA_ACCENT = {
  VIARIO: 'var(--zurbi-blue)',
  ILUMINACAO: 'var(--zurbi-yellow)',
  SANEAMENTO: 'var(--zurbi-blue-dark)',
  TRANSITO: 'var(--zurbi-blue)',
  LIMPEZA: 'var(--zurbi-green)',
};

function ChevronIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        d={direction === 'left' ? 'M14 6l-6 6 6 6' : 'M10 6l6 6-6 6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RecentReportsCarousel({ items = [], loading }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const slide = track.querySelector('.carousel-slide');
    const slideWidth = slide ? slide.offsetWidth + 20 : 360;
    const index = Math.round(track.scrollLeft / slideWidth);
    setActiveIndex(Math.min(Math.max(index, 0), items.length - 1));
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
  }, [items.length]);

  useEffect(() => {
    syncScroll();
    const track = trackRef.current;
    if (!track) return undefined;

    track.addEventListener('scroll', syncScroll, { passive: true });
    window.addEventListener('resize', syncScroll);
    return () => {
      track.removeEventListener('scroll', syncScroll);
      window.removeEventListener('resize', syncScroll);
    };
  }, [items, syncScroll]);

  const scrollToIndex = (index) => {
    const track = trackRef.current;
    const slide = track?.children[index];
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  const goPrev = () => scrollToIndex(Math.max(activeIndex - 1, 0));
  const goNext = () => scrollToIndex(Math.min(activeIndex + 1, items.length - 1));

  if (loading) {
    return (
      <div className="reports-carousel reports-carousel--loading">
        <div className="reports-carousel-skeleton" />
        <div className="reports-carousel-skeleton" />
        <div className="reports-carousel-skeleton" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="reports-carousel-empty">
        <p>Nenhum relato ainda. Seja o primeiro a reportar um problema em Porto Seguro.</p>
        <Link to="/registrar" className="btn btn-primary">
          Abrir chamado
        </Link>
      </div>
    );
  }

  return (
    <div className="reports-carousel">
      <div className="reports-carousel-controls">
        <button
          type="button"
          className="reports-carousel-nav"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Relato anterior"
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          className="reports-carousel-nav"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Próximo relato"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className="reports-carousel-viewport">
        <div className="reports-carousel-track" ref={trackRef}>
          {items.map((o) => {
            const accent = CATEGORIA_ACCENT[o.categoria] || 'var(--zurbi-blue)';
            return (
              <article
                key={o.id}
                className="carousel-slide"
                style={{ '--slide-accent': accent }}
              >
                <div className="carousel-slide-top">
                  <span className="carousel-protocol">{o.protocolo}</span>
                  <span className={`carousel-status badge badge-${badgeClassStatus(o.status)}`}>
                    {labelStatus(o.status)}
                  </span>
                </div>
                <span className="carousel-category">{labelCategoria(o.categoria)}</span>
                <h3 className="carousel-title">{o.subcategoria}</h3>
                <p className="carousel-desc">{o.descricao}</p>
                <footer className="carousel-footer">
                  <span>{o.bairro || 'Porto Seguro'}</span>
                  <span className="carousel-footer-sep" aria-hidden>
                    ·
                  </span>
                  <time dateTime={o.criadoEm}>
                    {o.criadoEm
                      ? new Date(o.criadoEm).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </time>
                </footer>
              </article>
            );
          })}
        </div>
      </div>

      <div className="reports-carousel-dots" role="tablist" aria-label="Relatos recentes">
        {items.map((o, i) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Ir para relato ${i + 1}`}
            className={`reports-carousel-dot${i === activeIndex ? ' is-active' : ''}`}
            onClick={() => scrollToIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
