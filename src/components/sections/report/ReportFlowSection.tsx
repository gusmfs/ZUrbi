import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { LocationMap } from '@/components/ui/LocationMap'
import { reportData } from '@/data/report'

type Category = (typeof reportData.categories)[number]
type Urgency = (typeof reportData.urgencyLevels)[number]['id']

const panelMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.24 },
}

type LocationStatus = 'idle' | 'loading' | 'success' | 'error'

async function reverseGeocode(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    'accept-language': 'pt-BR',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`)

  if (!response.ok) {
    throw new Error('reverse-geocode-failed')
  }

  const data = (await response.json()) as { display_name?: string }
  return data.display_name ?? null
}

function CameraIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 8h3l1.5-2h7L17 8h3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M12 21c-3.6-3.5-7-7-7-11a7 7 0 1 1 14 0c0 4-3.4 7.5-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-2.6 8.3-7 10-4.4-1.7-7-5.5-7-10V6l7-3Z" />
      <path d="m9.5 12 1.5 1.5 3.5-3.5" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  )
}

interface StepBadgeProps {
  index: number
  label: string
  active: boolean
  completed: boolean
}

function StepBadge({ index, label, active, completed }: StepBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
          active
            ? 'border-institutional bg-institutional text-white'
            : completed
              ? 'border-accent-cyan bg-accent-cyan text-white'
              : 'border-cold-gray-lightest bg-white text-cold-gray-lighter'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        <p className={`text-sm font-medium ${active ? 'text-institutional' : 'text-cold-gray-lighter'}`}>{label}</p>
      </div>
    </div>
  )
}

export function ReportFlowSection() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [categoryId, setCategoryId] = useState<Category['id']>('urbano')
  const [subcategory, setSubcategory] = useState('Buraco na via')
  const [details, setDetails] = useState(
    'Buraco profundo na faixa da direita, próximo ao cruzamento. Pode causar dano aos veículos e acidentes com motociclistas.',
  )
  const [reference, setReference] = useState('Em frente ao ponto de ônibus da praça')
  const [urgency, setUrgency] = useState<Urgency>('alta')
  const [accidentRisk, setAccidentRisk] = useState(true)
  const [recurring, setRecurring] = useState(true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [deviceLocation, setDeviceLocation] = useState<{
    latitude: number
    longitude: number
    accuracy: number | null
  } | null>(null)
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null)

  const categories = reportData.categories
  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === categoryId) ?? categories[0],
    [categories, categoryId],
  )
  const selectedUrgency = reportData.urgencyLevels.find((item) => item.id === urgency) ?? reportData.urgencyLevels[0]
  const selectedSubcategories: string[] = useMemo(() => [...selectedCategory.subcategories], [selectedCategory])

  useEffect(() => {
    if (!selectedSubcategories.includes(subcategory)) {
      setSubcategory(selectedSubcategories[0])
    }
  }, [selectedSubcategories, subcategory])

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(photoFile)
    setPhotoPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [photoFile])

  const requestDeviceLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      setLocationError('Seu navegador não oferece suporte à geolocalização.')
      return
    }

    setLocationStatus('loading')
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
        }

        setDeviceLocation(nextLocation)
        setLocationStatus('success')

        void reverseGeocode(nextLocation.latitude, nextLocation.longitude)
          .then((address) => {
            if (address) {
              setDetectedAddress(address)
            } else {
              setDetectedAddress(null)
            }
          })
          .catch(() => {
            setDetectedAddress(null)
          })
      },
      (error) => {
        setLocationStatus('error')

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Permissão negada. Autorize a localização do navegador para ver o mapa real.')
          return
        }

        if (error.code === error.TIMEOUT) {
          setLocationError('A localização demorou demais para responder. Tente novamente.')
          return
        }

        setLocationError('Não foi possível obter a localização do dispositivo neste momento.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [])

  useEffect(() => {
    if (currentStep === 1 && locationStatus === 'idle') {
      requestDeviceLocation()
    }
  }, [currentStep, locationStatus, requestDeviceLocation])

  const canGoBack = currentStep > 0
  const isLastStep = currentStep === reportData.steps.length - 1
  const displayAddress = detectedAddress ?? reportData.location.detectedAddress
  const displayCoordinates = deviceLocation
    ? `${deviceLocation.latitude.toFixed(5)}, ${deviceLocation.longitude.toFixed(5)}`
    : reportData.location.coordinates

  const nextStep = () => {
    setCurrentStep((previous) => Math.min(previous + 1, reportData.steps.length - 1))
  }

  const previousStep = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 0))
  }

  const resetFlow = () => {
    setIsSubmitted(false)
    setCurrentStep(0)
  }

  const submitReport = () => {
    setIsSubmitted(true)
  }

  const summaryTags = [
    ...reportData.summary.smartTags,
    accidentRisk ? 'risco-confirmado' : null,
    recurring ? 'reincidente' : null,
  ].filter(Boolean) as string[]

  const renderStep = () => {
    if (isSubmitted) {
      return (
        <motion.div key="sucesso" {...panelMotion} className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-institutional text-white shadow-elevated">
            <ShieldIcon />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">Envio concluído</p>
            <h2 className="mt-2 text-2xl font-bold text-institutional">Ocorrência enviada com sucesso</h2>
            <p className="mt-3 text-sm leading-relaxed text-cold-gray sm:text-base">
              Seu registro foi recebido pelo zUrbi e encaminhado para a triagem inicial. O acompanhamento seguirá pelo
              protocolo <span className="font-semibold text-institutional">{reportData.summary.protocol}</span>.
            </p>
          </div>

          <Card className="border-institutional/10 bg-institutional/5 p-5 sm:p-6 text-left">
            <p className="text-sm font-semibold text-institutional">Próximos passos simulados</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">1. Triagem</p>
                <p className="mt-2 text-sm text-cold-gray">O sistema valida localização, urgência e tags inteligentes.</p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">2. Encaminhamento</p>
                <p className="mt-2 text-sm text-cold-gray">A ocorrência segue para {reportData.summary.responsibleAgency}.</p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">3. Atualização</p>
                <p className="mt-2 text-sm text-cold-gray">{reportData.summary.predictedSla}.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )
    }

    if (currentStep === 0) {
      return (
        <motion.div key="problema" {...panelMotion} className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">Etapa 1</p>
            <h2 className="mt-2 text-2xl font-bold text-institutional">O que aconteceu?</h2>
            <p className="mt-2 text-sm leading-relaxed text-cold-gray">
              Identifique o tipo de ocorrência e descreva o problema com contexto suficiente para a triagem.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-institutional">Categoria</label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    category.id === categoryId
                      ? 'border-institutional bg-institutional/5 shadow-card'
                      : 'border-cold-gray-lightest bg-white hover:border-institutional/30'
                  }`}
                >
                  <p className="font-semibold text-institutional">{category.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-cold-gray">{category.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-institutional">Subcategoria</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSubcategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSubcategory(item)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    item === subcategory
                      ? 'border-institutional bg-institutional text-white'
                      : 'border-cold-gray-lightest text-cold-gray hover:border-institutional/30'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <label htmlFor="details" className="text-sm font-semibold text-institutional">
                Descrição do problema
              </label>
              <textarea
                id="details"
                rows={5}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                className="mt-3 w-full rounded-xl border border-cold-gray-lightest px-4 py-3 text-sm text-cold-gray outline-none transition-colors focus:border-institutional"
              />
              <p className="mt-2 text-xs text-cold-gray-lighter">
                Ex.: buraco profundo na faixa da direita, próximo ao cruzamento e com risco para motociclistas.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-institutional">Foto da ocorrência</label>
              <label className="mt-3 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cold-gray-lightest bg-cold-gray-lightest/20 px-5 py-6 text-center transition-colors hover:border-institutional/40 hover:bg-institutional/5">
                {photoPreviewUrl ? (
                  <img src={photoPreviewUrl} alt="Pré-visualização da ocorrência" className="h-full max-h-[220px] w-full rounded-lg object-cover" />
                ) : (
                  <>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-institutional shadow-card">
                      <CameraIcon />
                    </span>
                    <p className="mt-4 text-sm font-medium text-institutional">Adicionar foto</p>
                    <p className="mt-1 text-xs text-cold-gray-lighter">
                      PNG ou JPG para contextualizar a ocorrência.
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="sr-only"
                  onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
        </motion.div>
      )
    }

    if (currentStep === 1) {
      return (
        <motion.div key="local" {...panelMotion} className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">Etapa 2</p>
            <h2 className="mt-2 text-2xl font-bold text-institutional">Onde está o problema?</h2>
            <p className="mt-2 text-sm leading-relaxed text-cold-gray">
              O zUrbi utiliza a geolocalização do dispositivo para centralizar o mapa, contextualizar a ocorrência e
              apoiar o encaminhamento ao órgão correto.
            </p>
          </div>

          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-institutional/10 text-institutional">
                  <LocationIcon />
                </span>
                <div>
                  <p className="text-sm font-semibold text-institutional">Localização detectada</p>
                  <p className="mt-1 text-sm text-cold-gray">{displayAddress}</p>
                  <p className="mt-2 text-xs text-cold-gray-lighter">
                    {locationStatus === 'success' ? 'GPS capturado' : 'Modo de demonstração'} · {displayCoordinates} ·{' '}
                    {reportData.location.district}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={requestDeviceLocation}
                className="px-3 py-2 text-xs"
                disabled={locationStatus === 'loading'}
              >
                {locationStatus === 'loading' ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-institutional">Endereço aproximado</label>
              <input
                value={displayAddress}
                readOnly
                className="mt-3 w-full rounded-xl border border-cold-gray-lightest bg-white px-4 py-3 text-sm text-cold-gray outline-none"
              />
            </div>
            <div>
              <label htmlFor="reference" className="text-sm font-semibold text-institutional">
                Ponto de referência
              </label>
              <input
                id="reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                className="mt-3 w-full rounded-xl border border-cold-gray-lightest px-4 py-3 text-sm text-cold-gray outline-none transition-colors focus:border-institutional"
              />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-institutional">Mapa em tempo real</p>
              <span className="text-xs text-cold-gray-lighter">Base pública sem chave</span>
            </div>
            <LocationMap
              latitude={deviceLocation?.latitude ?? null}
              longitude={deviceLocation?.longitude ?? null}
              accuracy={deviceLocation?.accuracy ?? null}
              isLoading={locationStatus === 'loading'}
              errorMessage={locationError}
              onLocateClick={requestDeviceLocation}
            />
          </div>
        </motion.div>
      )
    }

    if (currentStep === 2) {
      return (
        <motion.div key="urgencia" {...panelMotion} className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">Etapa 3</p>
            <h2 className="mt-2 text-2xl font-bold text-institutional">Qual o nível de urgência?</h2>
            <p className="mt-2 text-sm leading-relaxed text-cold-gray">
              O zUrbi usa sua sinalização para priorizar o encaminhamento e sugerir a criticidade do chamado.
            </p>
          </div>

          <div className="grid gap-3">
            {reportData.urgencyLevels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setUrgency(level.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  level.id === urgency
                    ? 'border-institutional bg-institutional text-white shadow-card'
                    : 'border-cold-gray-lightest bg-white hover:border-institutional/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`font-semibold ${level.id === urgency ? 'text-white' : 'text-institutional'}`}>
                      {level.title}
                    </p>
                    <p className={`mt-1 text-sm leading-relaxed ${level.id === urgency ? 'text-white/90' : 'text-cold-gray'}`}>
                      {level.description}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    level.id === urgency ? 'bg-white text-institutional' : 'bg-institutional/10 text-institutional'
                  }`}>
                    {level.response}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAccidentRisk((value) => !value)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                accidentRisk ? 'border-institutional bg-institutional/5' : 'border-cold-gray-lightest bg-white'
              }`}
            >
              <p className="font-semibold text-institutional">Há risco de acidente?</p>
              <p className="mt-1 text-sm text-cold-gray">
                {accidentRisk ? 'Sim. O sistema deve elevar a prioridade.' : 'Não. Sem risco imediato informado.'}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setRecurring((value) => !value)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                recurring ? 'border-institutional bg-institutional/5' : 'border-cold-gray-lightest bg-white'
              }`}
            >
              <p className="font-semibold text-institutional">É um problema recorrente?</p>
              <p className="mt-1 text-sm text-cold-gray">
                {recurring ? 'Sim. Ajuda a criar tags inteligentes e histórico.' : 'Não. Primeiro registro desse ponto.'}
              </p>
            </button>
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div key="revisao" {...panelMotion} className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">Etapa 4</p>
          <h2 className="mt-2 text-2xl font-bold text-institutional">Revisar e enviar</h2>
          <p className="mt-2 text-sm leading-relaxed text-cold-gray">
            Confira como a ocorrência será lida pelo órgão responsável e pelo painel de monitoramento.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="grid gap-0 border-cold-gray-lightest sm:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-cold-gray-lightest p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="text-sm font-semibold text-institutional">Resumo do envio</p>
              <div className="mt-4 space-y-4 text-sm text-cold-gray">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">Categoria</p>
                  <p className="mt-1 font-medium text-institutional">{selectedCategory.title} · {subcategory}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">Descrição</p>
                  <p className="mt-1 leading-relaxed">{details}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">Local</p>
                  <p className="mt-1 leading-relaxed">{displayAddress}</p>
                  <p className="mt-1 text-xs text-cold-gray-lighter">{reference}</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-institutional">Encaminhamento previsto</p>
              <div className="mt-4 space-y-4 text-sm text-cold-gray">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-institutional/10 text-institutional">
                    <ShieldIcon />
                  </span>
                  <div>
                    <p className="font-medium text-institutional">{reportData.summary.responsibleAgency}</p>
                    <p className="mt-1 text-cold-gray">{reportData.summary.predictedSla}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-institutional/10 text-institutional">
                    <FileIcon />
                  </span>
                  <div>
                    <p className="font-medium text-institutional">Protocolo simulado</p>
                    <p className="mt-1 text-cold-gray">{reportData.summary.protocol}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">Tags inteligentes</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summaryTags.map((tag) => (
                      <span key={tag} className="rounded-full bg-cold-gray-lightest px-3 py-1 text-xs font-medium text-institutional">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <Section className="bg-cold-gray-lightest/20" aria-labelledby="report-title">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-cyan">{reportData.intro.eyebrow}</p>
          <h1 id="report-title" className="mt-3 text-3xl font-bold text-institutional sm:text-4xl">
            {reportData.intro.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-cold-gray sm:text-lg">
            {reportData.intro.subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px] xl:items-start">
          <Card className="overflow-hidden">
            <div className="border-b border-cold-gray-lightest px-5 py-5 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {reportData.steps.map((step, index) => (
                  <StepBadge
                    key={step.id}
                    index={index}
                    label={step.label}
                    active={index === currentStep}
                    completed={index < currentStep}
                  />
                ))}
              </div>
            </div>

            <div className="px-5 py-6 sm:px-6 sm:py-8">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </div>

            <div className="sticky bottom-0 border-t border-cold-gray-lightest bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                {isSubmitted ? (
                  <div />
                ) : (
                  <Button variant="ghost" onClick={previousStep} className={!canGoBack ? 'invisible' : ''}>
                    Voltar
                  </Button>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  {isSubmitted ? (
                    <>
                      <Button variant="outline" onClick={resetFlow}>
                        Registrar nova ocorrência
                      </Button>
                      <Button href="/monitoramento" variant="primary">
                        Abrir monitoramento
                      </Button>
                    </>
                  ) : isLastStep ? (
                    <>
                      <Button variant="outline" onClick={() => setCurrentStep(0)}>
                        Editar informações
                      </Button>
                      <Button variant="primary" onClick={submitReport}>
                        Enviar ocorrência
                      </Button>
                    </>
                  ) : (
                    <Button variant="primary" onClick={nextStep}>
                      Continuar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6 xl:sticky xl:top-24">
            <Card className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-institutional">Leitura do órgão responsável</p>
              <div className="mt-4 space-y-4 text-sm text-cold-gray">
                <div className="rounded-xl bg-cold-gray-lightest/35 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">Prioridade sugerida</p>
                  <p className="mt-1 font-medium text-institutional">
                    {isSubmitted
                      ? 'Ocorrência enviada para triagem'
                      : `Ocorrência priorizada como ${selectedUrgency.title.toLowerCase()}`}
                  </p>
                  <p className="mt-2 leading-relaxed">
                    {isSubmitted
                      ? 'O protocolo foi gerado e a secretaria responsável já pode visualizar o chamado no painel.'
                      : selectedUrgency.description}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">Órgão sugerido</p>
                  <p className="mt-1 font-medium text-institutional">{reportData.summary.responsibleAgency}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cold-gray-lighter">Status do fluxo</p>
                  <p className="mt-1 leading-relaxed">
                    Captura do problema → Triagem inteligente → Encaminhamento → Acompanhamento.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-institutional">Resumo rápido</p>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-cold-gray-lighter">Categoria atual</dt>
                  <dd className="mt-1 font-medium text-institutional">{selectedCategory.title}</dd>
                </div>
                <div>
                  <dt className="text-cold-gray-lighter">Subcategoria</dt>
                  <dd className="mt-1 font-medium text-institutional">{subcategory}</dd>
                </div>
                <div>
                  <dt className="text-cold-gray-lighter">Nível de urgência</dt>
                  <dd className="mt-1 font-medium text-institutional">{selectedUrgency.title}</dd>
                </div>
                <div>
                  <dt className="text-cold-gray-lighter">Localização</dt>
                  <dd className="mt-1 font-medium text-institutional">{displayAddress}</dd>
                </div>
              </dl>
            </Card>

            <p className="px-1 text-xs leading-relaxed text-cold-gray-lighter">{reportData.prototypeNote}</p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
