import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { OperationsMap } from '@/components/ui/OperationsMap'
import { Section } from '@/components/ui/Section'
import { operationsData, type OperationIncidentSeverity, type OperationIncidentStatus, type OperationIncidentType } from '@/data/operations'

type FilterKey = 'todas' | OperationIncidentType

const typeLabels: Record<OperationIncidentType, string> = {
  viario: 'Viário',
  iluminacao: 'Iluminação',
  saneamento: 'Saneamento',
  transito: 'Trânsito',
  limpeza: 'Limpeza',
}

const severityStyles: Record<OperationIncidentSeverity, string> = {
  baixa: 'bg-institutional/8 text-institutional',
  media: 'bg-accent-cyan/12 text-institutional',
  alta: 'bg-[#d64545]/8 text-[#b12f2f]',
}

const severityLabels: Record<OperationIncidentSeverity, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}

const statusLabels: Record<OperationIncidentStatus, string> = {
  novo: 'Novo',
  'em-analise': 'Em análise',
  encaminhado: 'Encaminhado',
  'em-atendimento': 'Em atendimento',
}

function FilterIcon({ type }: { type: FilterKey }) {
  if (type === 'todas') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    )
  }

  const iconProps = {
    className: 'h-4 w-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.7',
    'aria-hidden': true,
  } as const

  switch (type) {
    case 'viario':
      return (
        <svg {...iconProps}>
          <path d="M8 3h3l1 18H9L8 3Z" />
          <path d="M12 3h3l1 18h-3L12 3Z" />
        </svg>
      )
    case 'iluminacao':
      return (
        <svg {...iconProps}>
          <path d="M12 3a5 5 0 0 0-3 9v2h6v-2a5 5 0 0 0-3-9Z" />
          <path d="M10 17h4" />
          <path d="M11 20h2" />
        </svg>
      )
    case 'saneamento':
      return (
        <svg {...iconProps}>
          <path d="M12 3c2 3 5 6 5 10a5 5 0 0 1-10 0c0-4 3-7 5-10Z" />
        </svg>
      )
    case 'transito':
      return (
        <svg {...iconProps}>
          <rect x="9" y="3.5" width="6" height="13" rx="3" />
          <circle cx="12" cy="7" r="0.9" />
          <circle cx="12" cy="10" r="0.9" />
          <circle cx="12" cy="13" r="0.9" />
          <path d="M12 16.5V20" />
        </svg>
      )
    case 'limpeza':
      return (
        <svg {...iconProps}>
          <path d="M9 6h6" />
          <path d="M10 6V4h4v2" />
          <path d="M8 8l1 11h6l1-11" />
        </svg>
      )
  }
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="text-sm text-cold-gray-lighter">{label}</p>
      <p className="mt-3 text-3xl font-bold text-institutional">{value}</p>
      <p className="mt-2 text-xs text-cold-gray">{detail}</p>
    </Card>
  )
}

export function OperationsMapSection() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('todas')
  const [selectedIncidentId, setSelectedIncidentId] = useState(operationsData.incidents[0].id)

  const filteredIncidents = useMemo(() => {
    if (activeFilter === 'todas') {
      return operationsData.incidents
    }

    return operationsData.incidents.filter((incident) => incident.type === activeFilter)
  }, [activeFilter])

  const selectedIncident = useMemo(() => {
    return filteredIncidents.find((incident) => incident.id === selectedIncidentId) ?? filteredIncidents[0]
  }, [filteredIncidents, selectedIncidentId])

  const totalsByType = useMemo(() => {
    return operationsData.incidents.reduce<Record<OperationIncidentType, number>>(
      (accumulator, incident) => {
        accumulator[incident.type] += 1
        return accumulator
      },
      {
        viario: 0,
        iluminacao: 0,
        saneamento: 0,
        transito: 0,
        limpeza: 0,
      },
    )
  }, [])

  return (
    <Section className="bg-cold-gray-lightest/20" aria-labelledby="operations-title">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-cyan">
            {operationsData.intro.eyebrow}
          </p>
          <h1 id="operations-title" className="mt-3 text-3xl font-bold text-institutional sm:text-4xl">
            {operationsData.intro.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cold-gray sm:text-lg">
            {operationsData.intro.subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {operationsData.summary.map((item) => (
            <StatCard key={item.id} label={item.label} value={item.value} detail={item.detail} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('todas')}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
              activeFilter === 'todas'
                ? 'border-institutional bg-institutional text-white'
                : 'border-cold-gray-lightest bg-white text-cold-gray hover:border-institutional/20 hover:text-institutional'
            }`}
          >
            <FilterIcon type="todas" />
            <span>Todas</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                activeFilter === 'todas' ? 'bg-white/15 text-white' : 'bg-cold-gray-lightest text-institutional'
              }`}
            >
              {operationsData.incidents.length}
            </span>
          </button>
          {(Object.keys(typeLabels) as OperationIncidentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveFilter(type)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                activeFilter === type
                  ? 'border-institutional bg-institutional text-white'
                  : 'border-cold-gray-lightest bg-white text-cold-gray hover:border-institutional/20 hover:text-institutional'
              }`}
            >
              <FilterIcon type={type} />
              <span>{typeLabels[type]}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  activeFilter === type ? 'bg-white/15 text-white' : 'bg-cold-gray-lightest text-institutional'
                }`}
              >
                {totalsByType[type]}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px] xl:items-start">
          <div className="space-y-6">
            <OperationsMap
              incidents={filteredIncidents}
              selectedIncidentId={selectedIncident.id}
              onSelectIncident={setSelectedIncidentId}
            />

            <div className="grid gap-4 lg:grid-cols-3">
              {operationsData.insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                >
                  <Card className="h-full p-5">
                    <p className="text-sm font-semibold text-institutional">{insight.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-cold-gray">{insight.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-institutional">Ocorrência em foco</p>
                  <p className="mt-1 text-xs text-cold-gray-lighter">{selectedIncident.updatedAt}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[selectedIncident.severity]}`}>
                  {selectedIncident.severity === 'alta'
                    ? 'Alta urgência'
                    : selectedIncident.severity === 'media'
                      ? 'Média urgência'
                      : 'Baixa urgência'}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-bold text-institutional">{selectedIncident.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-cold-gray">{selectedIncident.description}</p>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-cold-gray-lighter">Tipo</dt>
                  <dd className="mt-1 font-medium text-institutional">{typeLabels[selectedIncident.type]}</dd>
                </div>
                <div>
                  <dt className="text-cold-gray-lighter">Bairro</dt>
                  <dd className="mt-1 font-medium text-institutional">{selectedIncident.district}</dd>
                </div>
                <div>
                  <dt className="text-cold-gray-lighter">Órgão responsável</dt>
                  <dd className="mt-1 font-medium text-institutional">{selectedIncident.agency}</dd>
                </div>
                <div>
                  <dt className="text-cold-gray-lighter">Status</dt>
                  <dd className="mt-1 font-medium text-institutional">{statusLabels[selectedIncident.status]}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-institutional">Fila de ocorrências</p>
              <div className="scrollbar-minimal mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1 sm:max-h-[520px]">
                {filteredIncidents.map((incident) => (
                  <button
                    key={incident.id}
                    type="button"
                    onClick={() => setSelectedIncidentId(incident.id)}
                    className={`relative w-full overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all ${
                      selectedIncident.id === incident.id
                        ? 'border-institutional/20 bg-institutional/[0.03] shadow-card'
                        : 'border-cold-gray-lightest/90 bg-white hover:border-institutional/20 hover:bg-cold-gray-lightest/20'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${
                        incident.severity === 'alta'
                          ? 'bg-[#d64545]'
                          : incident.severity === 'media'
                            ? 'bg-accent-cyan'
                            : 'bg-institutional'
                      }`}
                    />
                    <div className="pl-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug text-institutional">{incident.title}</p>
                          <p className="mt-1 text-xs text-cold-gray">
                            {incident.district} · {typeLabels[incident.type]}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${severityStyles[incident.severity]}`}
                        >
                          {severityLabels[incident.severity]}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-cold-gray-lighter">
                        <span>{statusLabels[incident.status]}</span>
                        <span>{incident.updatedAt}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-institutional">Bairros com mais pressão</p>
              <div className="mt-4 space-y-3">
                {operationsData.hotspots.map((hotspot) => (
                  <div key={hotspot.id} className="flex items-center justify-between rounded-xl bg-cold-gray-lightest/35 px-4 py-3">
                    <span className="text-sm font-medium text-institutional">{hotspot.name}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-institutional shadow-card">
                      {hotspot.count} ocorrências
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  )
}
