"use client"

import { useMemo, useState } from "react"
import {
  Globe2,
  Shield,
  Sparkles,
  Ticket,
} from "lucide-react"
import { AgencyRebuildActionButton } from "@/components/agency-rebuild/actions/agency-rebuild-action-button"
import { BaseModalV3 } from "@/components/agency-rebuild/modals/base-modal-v3"
import { BaseCardV3 } from "@/components/agency-rebuild/shared/base-card-v3"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type BuilderTab =
  | "package"
  | "lodging"
  | "flights"
  | "cars"
  | "services"
  | "circuits"
  | "insurance"
  | "extras"
  | "ai"

type QuoteStatus = "Rascunho" | "Em montagem" | "Pronto para proposta" | "Compartilhado"

type PackageForm = {
  origin: string
  destination: string
  startDate: string
  endDate: string
  adults: string
  children: string
  childrenAges: string
  rooms: string
  category: string
  currency: string
  notes: string
}

type HotelOption = {
  id: string
  name: string
  location: string
  description: string
  amenities: string[]
  mealPlan: string
  stars: string
  rating: string
  price: number
  tag: string
}

type FlightOption = {
  id: string
  airline: string
  from: string
  to: string
  depart: string
  arrive: string
  duration: string
  stops: string
  baggage: string
  cabin: string
  price: number
}

type CarOption = {
  id: string
  category: string
  company: string
  transmission: string
  insurance: string
  baggage: string
  price: number
}

type ServiceOption = {
  id: string
  name: string
  category: string
  description: string
  price: number
}

type CircuitOption = {
  id: string
  name: string
  duration: string
  style: string
  price: number
}

type ProposalSection = {
  title: string
  body: string
}

const hotelSeed: HotelOption[] = [
  {
    id: "hotel-1",
    name: "Nordeste Palace Hotel",
    location: "Fortaleza • Beira-mar",
    description: "Hotel premium com leitura executiva, cafe da manha e deslocamento facil.",
    amenities: ["Cafe da manha", "Wi-Fi", "Piscina", "Transfer opcional"],
    mealPlan: "Cafe da manha",
    stars: "4 estrelas",
    rating: "9.1",
    price: 3765.18,
    tag: "Recomendado",
  },
  {
    id: "hotel-2",
    name: "Hotel Aeroporto Star",
    location: "Fortaleza • Hub urbano",
    description: "Base leve para combinacoes rapidas e embarque organizado.",
    amenities: ["Cafe", "Shuttle", "Late check-out"],
    mealPlan: "Cafe da manha",
    stars: "3 estrelas",
    rating: "8.6",
    price: 3800.18,
    tag: "Agil",
  },
  {
    id: "hotel-3",
    name: "Fortaleza Mar Hotel",
    location: "Fortaleza • Praia",
    description: "Leitura visual forte para proposta com familias e lazer.",
    amenities: ["Vista mar", "Piscina", "Wi-Fi", "Kids"],
    mealPlan: "Meia pensao",
    stars: "4 estrelas",
    rating: "8.9",
    price: 3962.68,
    tag: "Destaque",
  },
]

const flightSeed: FlightOption[] = [
  {
    id: "flight-1",
    airline: "Latam",
    from: "POA",
    to: "FOR",
    depart: "09/06 19:35",
    arrive: "10/06 01:40",
    duration: "06:05",
    stops: "1 parada",
    baggage: "1 bagagem",
    cabin: "Economica",
    price: 5427.46,
  },
  {
    id: "flight-2",
    airline: "Gol",
    from: "POA",
    to: "FOR",
    depart: "09/06 13:10",
    arrive: "09/06 20:55",
    duration: "07:45",
    stops: "Direto",
    baggage: "Sem bagagem",
    cabin: "Economica Flex",
    price: 5890.12,
  },
  {
    id: "flight-3",
    airline: "Azul",
    from: "POA",
    to: "FOR",
    depart: "09/06 06:45",
    arrive: "09/06 14:30",
    duration: "07:45",
    stops: "1 parada",
    baggage: "1 bagagem",
    cabin: "Premium",
    price: 6340.54,
  },
]

const returnFlightSeed: FlightOption[] = [
  {
    id: "return-1",
    airline: "Latam",
    from: "FOR",
    to: "POA",
    depart: "16/06 03:25",
    arrive: "16/06 10:30",
    duration: "07:05",
    stops: "1 parada",
    baggage: "1 bagagem",
    cabin: "Economica",
    price: 0,
  },
  {
    id: "return-2",
    airline: "Gol",
    from: "FOR",
    to: "POA",
    depart: "16/06 09:10",
    arrive: "16/06 16:55",
    duration: "07:45",
    stops: "Direto",
    baggage: "Sem bagagem",
    cabin: "Economica Flex",
    price: 0,
  },
]

const carSeed: CarOption[] = [
  { id: "car-1", category: "SUV Compacto", company: "Movida", transmission: "Automatico", insurance: "Protecao ampliada", baggage: "3 malas", price: 1180 },
  { id: "car-2", category: "Sedan Executivo", company: "Localiza", transmission: "Automatico", insurance: "Cobertura basica", baggage: "4 malas", price: 1420 },
  { id: "car-3", category: "Hatch Urbano", company: "Unidas", transmission: "Manual", insurance: "Cobertura basica", baggage: "2 malas", price: 890 },
]

const serviceSeed: ServiceOption[] = [
  { id: "service-1", name: "Transfer aeroporto", category: "Transfer", description: "Recepcao e deslocamento privativo.", price: 320 },
  { id: "service-2", name: "Passeio litoral premium", category: "Passeio", description: "Saida guiada com parada gastronomica.", price: 540 },
  { id: "service-3", name: "Chip internacional", category: "Chip", description: "Conectividade para toda a jornada.", price: 120 },
  { id: "service-4", name: "Sala VIP", category: "VIP", description: "Conforto em janelas de conexao.", price: 190 },
]

const circuitSeed: CircuitOption[] = [
  { id: "circuit-1", name: "Fortaleza Essencial 4D", duration: "4 dias", style: "Lazer", price: 860 },
  { id: "circuit-2", name: "Jericoacoara Curada", duration: "3 dias", style: "Premium", price: 1320 },
]

const insuranceSeed: ServiceOption[] = [
  { id: "insurance-1", name: "Seguro viagem Europa Base", category: "Seguro", description: "Cobertura medica e extravio.", price: 240 },
  { id: "insurance-2", name: "Seguro viagem Premium", category: "Seguro", description: "Cobertura ampliada para familias e premium.", price: 420 },
]

const extraSeed: ServiceOption[] = [
  { id: "extra-1", name: "Kit boas-vindas", category: "Extra", description: "Material impresso e onboarding premium.", price: 80 },
  { id: "extra-2", name: "Assistencia concierge", category: "Extra", description: "Suporte prioritario durante a viagem.", price: 210 },
]

const proposalSections: ProposalSection[] = [
  { title: "Capa", body: "TravelPro V3 com branding da agencia, capa premium e CTA WhatsApp." },
  { title: "Resumo da viagem", body: "Destino, periodo, passageiros, hotel, voos e servicos em leitura executiva." },
  { title: "Valores", body: "Total, margem, comissao, politicas e observacoes em bloco claro e premium." },
  { title: "Assinatura", body: "Consultor, identidade da agencia, assinatura e proximos passos." },
]

function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

function buildEmptyPackage(): PackageForm {
  return {
    origin: "Porto Alegre",
    destination: "Fortaleza",
    startDate: "2026-06-09",
    endDate: "2026-06-16",
    adults: "2",
    children: "0",
    childrenAges: "",
    rooms: "1 quarto • 2 adultos",
    category: "Premium",
    currency: "BRL",
    notes: "",
  }
}

export function AgencyRebuildTravelBuilderWorkspace({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<BuilderTab>("package")
  const [status, setStatus] = useState<QuoteStatus>("Em montagem")
  const [packageForm, setPackageForm] = useState<PackageForm>(buildEmptyPackage())
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(hotelSeed[0]?.id ?? null)
  const [selectedOutboundId, setSelectedOutboundId] = useState<string | null>(flightSeed[0]?.id ?? null)
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(returnFlightSeed[0]?.id ?? null)
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>(["service-1"])
  const [selectedCircuits, setSelectedCircuits] = useState<string[]>([])
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>(["insurance-1"])
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [margin, setMargin] = useState([12])
  const [discount, setDiscount] = useState([0])
  const [cartOpen, setCartOpen] = useState(false)
  const [proposalOpen, setProposalOpen] = useState(false)
  const [passengerOpen, setPassengerOpen] = useState(false)
  const [operatorStatus, setOperatorStatus] = useState("Em preparação")
  const [operatorName] = useState("Operadora principal futura")

  const selectedHotel = hotelSeed.find((item) => item.id === selectedHotelId) ?? null
  const selectedOutbound = flightSeed.find((item) => item.id === selectedOutboundId) ?? null
  const selectedReturn = returnFlightSeed.find((item) => item.id === selectedReturnId) ?? null
  const selectedCar = carSeed.find((item) => item.id === selectedCarId) ?? null

  const selectedServiceItems = useMemo(
    () => serviceSeed.filter((item) => selectedServices.includes(item.id)),
    [selectedServices],
  )
  const selectedCircuitItems = useMemo(
    () => circuitSeed.filter((item) => selectedCircuits.includes(item.id)),
    [selectedCircuits],
  )
  const selectedInsuranceItems = useMemo(
    () => insuranceSeed.filter((item) => selectedInsurance.includes(item.id)),
    [selectedInsurance],
  )
  const selectedExtraItems = useMemo(
    () => extraSeed.filter((item) => selectedExtras.includes(item.id)),
    [selectedExtras],
  )

  const passengerCount = Number(packageForm.adults || "0") + Number(packageForm.children || "0")
  const baseHotel = selectedHotel?.price ?? 0
  const outboundPrice = selectedOutbound?.price ?? 0
  const returnPrice = selectedOutbound ? selectedOutbound.price * 0.94 : 0
  const flightsTotal = outboundPrice + returnPrice
  const carTotal = selectedCar?.price ?? 0
  const servicesTotal = selectedServiceItems.reduce((sum, item) => sum + item.price, 0)
  const circuitsTotal = selectedCircuitItems.reduce((sum, item) => sum + item.price, 0)
  const insuranceTotal = selectedInsuranceItems.reduce((sum, item) => sum + item.price, 0)
  const extrasTotal = selectedExtraItems.reduce((sum, item) => sum + item.price, 0)
  const baseTotal = baseHotel + flightsTotal + carTotal + servicesTotal + circuitsTotal + insuranceTotal + extrasTotal
  const commissionBase = baseTotal * 0.12
  const marginAmount = baseTotal * (margin[0] / 100)
  const discountAmount = baseTotal * (discount[0] / 100)
  const finalTotal = baseTotal + marginAmount - discountAmount
  const estimatedProfit = commissionBase + marginAmount - discountAmount
  const modulesAdded = [
    selectedHotel,
    selectedOutbound,
    selectedReturn,
    selectedCar,
    ...selectedServiceItems,
    ...selectedCircuitItems,
    ...selectedInsuranceItems,
    ...selectedExtraItems,
  ].filter(Boolean).length

  const toggleCollectionItem = (
    current: string[],
    setter: (value: string[]) => void,
    id: string,
    label: string,
  ) => {
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    setter(next)
    toast({
      title: next.includes(id) ? `${label} adicionado` : `${label} removido`,
      description: "O resumo lateral foi atualizado localmente no preview da V3.",
    })
  }

  const resetBuilder = () => {
    setPackageForm(buildEmptyPackage())
    setSelectedHotelId(hotelSeed[0]?.id ?? null)
    setSelectedOutboundId(flightSeed[0]?.id ?? null)
    setSelectedReturnId(returnFlightSeed[0]?.id ?? null)
    setSelectedCarId(null)
    setSelectedServices(["service-1"])
    setSelectedCircuits([])
    setSelectedInsurance(["insurance-1"])
    setSelectedExtras([])
    setMargin([12])
    setDiscount([0])
    setStatus("Rascunho")
    toast({
      title: "Nova cotação preparada",
      description: "O Travel Builder foi reiniciado localmente para uma nova montagem.",
    })
  }

  const summaryItems = [
    selectedHotel ? { label: "Hotel", value: selectedHotel.name, amount: selectedHotel.price } : null,
    selectedOutbound ? { label: "Voo ida", value: `${selectedOutbound.airline} • ${selectedOutbound.from}-${selectedOutbound.to}`, amount: outboundPrice } : null,
    selectedReturn ? { label: "Voo volta", value: `${selectedReturn.airline} • ${selectedReturn.from}-${selectedReturn.to}`, amount: returnPrice } : null,
    selectedCar ? { label: "Carro", value: selectedCar.category, amount: selectedCar.price } : null,
    ...selectedServiceItems.map((item) => ({ label: item.category, value: item.name, amount: item.price })),
    ...selectedCircuitItems.map((item) => ({ label: "Circuito", value: item.name, amount: item.price })),
    ...selectedInsuranceItems.map((item) => ({ label: "Seguro", value: item.name, amount: item.price })),
    ...selectedExtraItems.map((item) => ({ label: "Extra", value: item.name, amount: item.price })),
  ].filter(Boolean) as Array<{ label: string; value: string; amount: number }>

  return (
    <>
      <BaseModalV3
        open={open}
        onOpenChange={onOpenChange}
        title="Travel Builder"
        description="Monte, personalize e compartilhe viagens completas em uma operação viva."
        contentClassName="sm:max-w-[1480px]"
        bodyClassName="pb-6"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="modal"
              label="Abrir carrinho"
              className="rounded-full"
              onAction={() => setCartOpen(true)}
            />
            <AgencyRebuildActionButton
              actionType="modal"
              label="Fechar"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={() => onOpenChange(false)}
            />
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                {[
                  { label: "Orçamento atual", value: "Orçamento 1" },
                  { label: "Passageiros", value: String(passengerCount) },
                  { label: "Módulos adicionados", value: String(modulesAdded) },
                  { label: "Valor total", value: formatCurrency(finalTotal, packageForm.currency) },
                  { label: "Margem", value: `${margin[0]}%` },
                  { label: "Status", value: status },
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-zinc-50">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 xl:max-w-[560px] xl:justify-end">
                <AgencyRebuildActionButton actionType="api" label="Nova cotação" className="rounded-full" onAction={resetBuilder} />
                <AgencyRebuildActionButton actionType="modal" label="Criar com IA" className="rounded-full" onAction={() => setTab("ai")} />
                <AgencyRebuildActionButton
                  actionType="api"
                  label="Duplicar"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  onAction={() => {
                    setStatus("Rascunho")
                    toast({ title: "Cotação duplicada", description: "Uma nova versão local foi preparada no Travel Builder." })
                  }}
                />
                <AgencyRebuildActionButton
                  actionType="future"
                  label="Compartilhar"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  futureMessage="O link compartilhável real será conectado quando a operadora principal entrar."
                />
                <AgencyRebuildActionButton actionType="modal" label="Gerar proposta" className="rounded-full" onAction={() => setProposalOpen(true)} />
                <AgencyRebuildActionButton
                  actionType="future"
                  label="Gerar vouchers"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/[0.03]"
                  futureMessage="A emissão operacional de vouchers continua mockada/local nesta etapa."
                />
                <AgencyRebuildActionButton actionType="modal" label="Abrir carrinho" className="rounded-full" onAction={() => setCartOpen(true)} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <Tabs value={tab} onValueChange={(value) => setTab(value as BuilderTab)} className="space-y-4">
                <TabsList className="flex h-auto flex-wrap gap-2 rounded-[24px] border border-white/8 bg-black/16 p-1">
                  <TabsTrigger value="package">Pacote completo</TabsTrigger>
                  <TabsTrigger value="lodging">Hospedagem</TabsTrigger>
                  <TabsTrigger value="flights">Passagens</TabsTrigger>
                  <TabsTrigger value="cars">Carros</TabsTrigger>
                  <TabsTrigger value="services">Serviços</TabsTrigger>
                  <TabsTrigger value="circuits">Circuitos</TabsTrigger>
                  <TabsTrigger value="insurance">Seguro</TabsTrigger>
                  <TabsTrigger value="extras">Extras</TabsTrigger>
                  <TabsTrigger value="ai">IA Assistida</TabsTrigger>
                </TabsList>

                <TabsContent value="package" className="space-y-4">
                  <BaseCardV3
                    eyebrow="Montagem do pacote"
                    title="Composição operacional da viagem"
                    description="Origem, destino, período, passageiros, quartos, categoria e moeda prontos para a próxima integração."
                    className="rounded-[28px]"
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <Input value={packageForm.origin} onChange={(event) => setPackageForm((current) => ({ ...current, origin: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Origem" />
                      <Input value={packageForm.destination} onChange={(event) => setPackageForm((current) => ({ ...current, destination: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Destino" />
                      <Input type="date" value={packageForm.startDate} onChange={(event) => setPackageForm((current) => ({ ...current, startDate: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
                      <Input type="date" value={packageForm.endDate} onChange={(event) => setPackageForm((current) => ({ ...current, endDate: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" />
                      <AgencyRebuildActionButton
                        actionType="modal"
                        label={`${packageForm.adults} adultos • ${packageForm.children} crianças`}
                        className="h-11 justify-start rounded-[18px] bg-white/[0.03] px-4 text-left text-sm text-foreground hover:bg-white/[0.05]"
                        onAction={() => setPassengerOpen(true)}
                      />
                      <Input value={packageForm.rooms} onChange={(event) => setPackageForm((current) => ({ ...current, rooms: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Quartos" />
                      <Select value={packageForm.category} onValueChange={(value) => setPackageForm((current) => ({ ...current, category: value }))}>
                        <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                        <SelectContent>
                          {["Economica", "Intermediaria", "Premium", "Luxury"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={packageForm.currency} onValueChange={(value) => setPackageForm((current) => ({ ...current, currency: value }))}>
                        <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Moeda" /></SelectTrigger>
                        <SelectContent>
                          {["BRL", "USD", "EUR"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                      <Textarea
                        value={packageForm.notes}
                        onChange={(event) => setPackageForm((current) => ({ ...current, notes: event.target.value }))}
                        className="min-h-[110px] rounded-[20px] border-white/10 bg-white/[0.03]"
                        placeholder="Observações operacionais, briefing comercial, preferências e contexto da montagem."
                      />
                      <div className="rounded-[22px] border border-white/8 bg-black/14 p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Estrutura futura de integração</p>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <div>Operadora conectada: {operatorName}</div>
                          <div>Status da integração: {operatorStatus}</div>
                          <div>Sincronização futura: disponibilidade, preço e emissão.</div>
                          <div>API/tokens: camada honesta, ainda não conectada.</div>
                        </div>
                      </div>
                    </div>
                  </BaseCardV3>
                </TabsContent>

                <TabsContent value="lodging" className="space-y-4">
                  <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                    <BaseCardV3 eyebrow="Filtros" title="Hospedagem" description="Faixa, estrelas, avaliação e regime alimentar." className="rounded-[28px]">
                      <div className="space-y-3">
                        <Input className="h-10 rounded-[16px] border-white/10 bg-white/[0.03]" placeholder="Nome do hotel" />
                        {["Preço", "Estrelas", "Avaliação", "Região", "Política de cancelamento", "Regime alimentar"].map((item) => (
                          <Select key={item} defaultValue="all">
                            <SelectTrigger className="h-10 rounded-[16px] border-white/10 bg-white/[0.03]"><SelectValue placeholder={item} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{item}</SelectItem>
                            </SelectContent>
                          </Select>
                        ))}
                      </div>
                    </BaseCardV3>

                    <div className="space-y-4">
                      {hotelSeed.map((hotel) => {
                        const active = selectedHotelId === hotel.id
                        return (
                          <BaseCardV3
                            key={hotel.id}
                            eyebrow={hotel.tag}
                            title={hotel.name}
                            description={`${hotel.location} • ${hotel.stars} • Avaliação ${hotel.rating}`}
                            className="rounded-[28px]"
                            actions={
                              <Badge className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px]" variant="outline">
                                {hotel.mealPlan}
                              </Badge>
                            }
                            footer={
                              <>
                                <AgencyRebuildActionButton
                                  actionType="api"
                                  label={active ? "Selecionado" : "Selecionar"}
                                  className="h-8 rounded-full px-3 text-xs"
                                  onAction={() => {
                                    setSelectedHotelId(hotel.id)
                                    toast({ title: "Hotel selecionado", description: `${hotel.name} entrou no pacote local.` })
                                  }}
                                />
                                <AgencyRebuildActionButton
                                  actionType="api"
                                  label="Adicionar"
                                  variant="outline"
                                  className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                                  onAction={() => {
                                    setSelectedHotelId(hotel.id)
                                    toast({ title: "Hospedagem adicionada", description: "O resumo lateral foi atualizado localmente." })
                                  }}
                                />
                              </>
                            }
                          >
                            <div className="grid gap-4 xl:grid-cols-[160px_minmax(0,1fr)_160px]">
                              <div className="h-32 rounded-[20px] bg-[linear-gradient(135deg,rgba(255,126,29,0.28),rgba(255,255,255,0.02))]" />
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">{hotel.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {hotel.amenities.map((item) => (
                                    <Badge key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px]" variant="outline">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="rounded-[20px] border border-white/8 bg-black/18 p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Por pessoa</p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(hotel.price)}</p>
                                <p className="mt-2 text-xs text-muted-foreground">Total com taxas visíveis na proposta web.</p>
                              </div>
                            </div>
                          </BaseCardV3>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="flights" className="space-y-4">
                  <BaseCardV3 eyebrow="Busca aérea" title="Ida, volta e leitura operacional do voo" description="Comparação de voos com bagagem, escalas, classe e combinação do pacote." className="rounded-[28px]">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                      <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Origem" value={packageForm.origin} onChange={(event) => setPackageForm((current) => ({ ...current, origin: event.target.value }))} />
                      <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Destino" value={packageForm.destination} onChange={(event) => setPackageForm((current) => ({ ...current, destination: event.target.value }))} />
                      <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" value={packageForm.startDate} onChange={(event) => setPackageForm((current) => ({ ...current, startDate: event.target.value }))} />
                      <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" value={packageForm.endDate} onChange={(event) => setPackageForm((current) => ({ ...current, endDate: event.target.value }))} />
                      <Select defaultValue="1 bagagem">
                        <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Bagagem" /></SelectTrigger>
                        <SelectContent>
                          {["Todos", "1 bagagem", "Sem bagagem"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select defaultValue="Economica">
                        <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Classe" /></SelectTrigger>
                        <SelectContent>
                          {["Economica", "Economica Flex", "Premium", "Executiva"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <AgencyRebuildActionButton
                        actionType="api"
                        label="Comparar"
                        className="h-11 rounded-[18px]"
                        onAction={() => toast({ title: "Comparação atualizada", description: "Os voos locais foram reorganizados para leitura no cockpit." })}
                      />
                    </div>
                  </BaseCardV3>

                  <div className="space-y-4">
                    {[{ title: "Voos de ida", items: flightSeed, setter: setSelectedOutboundId, selectedId: selectedOutboundId }, { title: "Voos de volta", items: returnFlightSeed, setter: setSelectedReturnId, selectedId: selectedReturnId }].map((group) => (
                      <BaseCardV3 key={group.title} eyebrow="Passagens" title={group.title} description="Leitura premium para seleção operacional do pacote." className="rounded-[28px]">
                        <div className="space-y-3">
                          {group.items.map((flight) => {
                            const active = group.selectedId === flight.id
                            return (
                              <div key={flight.id} className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.8fr_160px]">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{flight.airline} • {flight.from} {flight.depart}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{flight.to} {flight.arrive} • {flight.duration} • {flight.stops}</p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {flight.baggage} • {flight.cabin}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatCurrency(group.title === "Voos de ida" ? flight.price : selectedOutbound ? selectedOutbound.price * 0.94 : 0)}
                                  </div>
                                  <div className="flex gap-2 xl:justify-end">
                                    <AgencyRebuildActionButton
                                      actionType="api"
                                      label={active ? "Selecionado" : "Selecionar"}
                                      className="h-8 rounded-full px-3 text-xs"
                                      onAction={() => {
                                        group.setter(flight.id)
                                        toast({ title: "Voo escolhido", description: `${group.title} atualizado localmente no pacote.` })
                                      }}
                                    />
                                    <AgencyRebuildActionButton
                                      actionType="future"
                                      label="Trocar"
                                      variant="outline"
                                      className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                                      futureMessage="A troca em tempo real com operadora será ativada depois."
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </BaseCardV3>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="cars" className="space-y-4">
                  <BaseCardV3 eyebrow="Locação" title="Carros e mobilidade" description="Retirada, devolução, categoria, motorista, idade e proteção da reserva." className="rounded-[28px]">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                      <Input className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Local de retirada" value={packageForm.destination} onChange={(event) => setPackageForm((current) => ({ ...current, destination: event.target.value }))} />
                      <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" value={packageForm.startDate} onChange={(event) => setPackageForm((current) => ({ ...current, startDate: event.target.value }))} />
                      <Input type="date" className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" value={packageForm.endDate} onChange={(event) => setPackageForm((current) => ({ ...current, endDate: event.target.value }))} />
                      <Select defaultValue="SUV Compacto">
                        <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                        <SelectContent>
                          {["SUV Compacto", "Sedan Executivo", "Hatch Urbano"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select defaultValue="25+">
                        <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Idade" /></SelectTrigger>
                        <SelectContent>
                          {["18+", "21+", "25+"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <AgencyRebuildActionButton
                        actionType="api"
                        label="Pesquisar"
                        className="h-11 rounded-[18px]"
                        onAction={() => toast({ title: "Busca local preparada", description: "Os cards de carro já refletem a leitura operacional da V3." })}
                      />
                    </div>
                  </BaseCardV3>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {carSeed.map((car) => (
                      <BaseCardV3
                        key={car.id}
                        eyebrow={car.company}
                        title={car.category}
                        description={`${car.transmission} • ${car.insurance} • ${car.baggage}`}
                        className="rounded-[26px]"
                        footer={
                          <AgencyRebuildActionButton
                            actionType="api"
                            label={selectedCarId === car.id ? "Selecionado" : "Selecionar"}
                            className="h-8 rounded-full px-3 text-xs"
                            onAction={() => {
                              setSelectedCarId(car.id)
                              toast({ title: "Carro adicionado", description: "A locação foi incluída no pacote local." })
                            }}
                          />
                        }
                      >
                        <p className="text-2xl font-semibold text-foreground">{formatCurrency(car.price)}</p>
                      </BaseCardV3>
                    ))}
                  </div>
                </TabsContent>

                {[
                  { key: "services" as const, title: "Serviços", items: serviceSeed, icon: Ticket },
                  { key: "insurance" as const, title: "Seguro", items: insuranceSeed, icon: Shield },
                  { key: "extras" as const, title: "Extras", items: extraSeed, icon: Sparkles },
                ].map((group) => (
                  <TabsContent key={group.key} value={group.key} className="space-y-4">
                    <BaseCardV3 eyebrow={group.title} title={`${group.title} adicionáveis ao pacote`} description="Ingressos, transfers, passeios, seguro, chip, VIP e extras com leitura premium." className="rounded-[28px]">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {group.items.map((item) => {
                          const collection =
                            group.key === "services"
                              ? selectedServices
                              : group.key === "insurance"
                                ? selectedInsurance
                                : selectedExtras
                          const active = collection.includes(item.id)

                          return (
                            <BaseCardV3
                              key={item.id}
                              eyebrow={item.category}
                              title={item.name}
                              description={item.description}
                              className="rounded-[24px] p-4"
                              actions={<group.icon className="h-4 w-4 text-primary" />}
                              footer={
                                <AgencyRebuildActionButton
                                  actionType="api"
                                  label={active ? "Remover" : "Adicionar"}
                                  className="h-8 rounded-full px-3 text-xs"
                                  onAction={() =>
                                    toggleCollectionItem(
                                      collection,
                                      group.key === "services"
                                        ? setSelectedServices
                                        : group.key === "insurance"
                                          ? setSelectedInsurance
                                          : setSelectedExtras,
                                      item.id,
                                      item.name,
                                    )
                                  }
                                />
                              }
                            >
                              <p className="text-lg font-semibold text-foreground">{formatCurrency(item.price)}</p>
                            </BaseCardV3>
                          )
                        })}
                      </div>
                    </BaseCardV3>
                  </TabsContent>
                ))}

                <TabsContent value="circuits" className="space-y-4">
                  <BaseCardV3 eyebrow="Circuitos" title="Composição complementar da viagem" description="Circuitos curtos para enriquecer o pacote e abrir novas propostas." className="rounded-[28px]">
                    <div className="grid gap-4 md:grid-cols-2">
                      {circuitSeed.map((circuit) => {
                        const active = selectedCircuits.includes(circuit.id)
                        return (
                          <BaseCardV3
                            key={circuit.id}
                            eyebrow={circuit.style}
                            title={circuit.name}
                            description={`${circuit.duration} • Circuito pronto para combinar com hotel, voo e extras.`}
                            className="rounded-[24px] p-4"
                            actions={<Globe2 className="h-4 w-4 text-primary" />}
                            footer={
                              <AgencyRebuildActionButton
                                actionType="api"
                                label={active ? "Remover" : "Adicionar"}
                                className="h-8 rounded-full px-3 text-xs"
                                onAction={() => toggleCollectionItem(selectedCircuits, setSelectedCircuits, circuit.id, circuit.name)}
                              />
                            }
                          >
                            <p className="text-lg font-semibold text-foreground">{formatCurrency(circuit.price)}</p>
                          </BaseCardV3>
                        )
                      })}
                    </div>
                  </BaseCardV3>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <BaseCardV3 eyebrow="IA Assistida" title="Montagem guiada sem IA real ainda" description="Sugestões operacionais locais para hotel, voos, margem, roteiro e proposta." className="rounded-[28px]">
                    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                      <div className="space-y-3">
                        {[
                          "Montar pacote base para família com voo direto e hotel premium.",
                          "Sugerir hotel com melhor relação entre leitura comercial e margem.",
                          "Aplicar margem recomendada para cliente VIP e proposta web.",
                          "Criar roteiro inicial e proposta com branding da agência.",
                        ].map((item) => (
                          <div key={item} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="rounded-[22px] border border-white/8 bg-black/14 p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Modo guia</p>
                        <p className="mt-3 text-sm text-muted-foreground">
                          Atlas ainda não monta a viagem de verdade aqui. A aba já prepara a experiência assistida,
                          mas a integração inteligente será conectada depois.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <AgencyRebuildActionButton
                            actionType="api"
                            label="Sugerir hotéis"
                            className="h-8 rounded-full px-3 text-xs"
                            onAction={() => {
                              setSelectedHotelId("hotel-1")
                              toast({ title: "Sugestão aplicada", description: "Um hotel premium foi sugerido localmente no pacote." })
                            }}
                          />
                          <AgencyRebuildActionButton
                            actionType="api"
                            label="Sugerir margem"
                            className="h-8 rounded-full px-3 text-xs"
                            onAction={() => {
                              setMargin([15])
                              toast({ title: "Margem sugerida", description: "A IA assistida local recomendou 15% para este pacote." })
                            }}
                          />
                          <AgencyRebuildActionButton
                            actionType="modal"
                            label="Gerar proposta"
                            className="h-8 rounded-full px-3 text-xs"
                            onAction={() => setProposalOpen(true)}
                          />
                        </div>
                      </div>
                    </div>
                  </BaseCardV3>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4 xl:sticky xl:top-0 xl:self-start">
              <BaseCardV3 eyebrow="Resumo lateral" title="Pacote em montagem" description="Hotel, voos, extras, passageiros, margem, comissão e lucro em leitura viva." className="rounded-[28px]">
                <div className="space-y-3">
                  {summaryItems.length ? (
                    summaryItems.map((item) => (
                      <div key={`${item.label}-${item.value}`} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.value}</p>
                          </div>
                          <div className="text-sm font-medium text-foreground">{formatCurrency(item.amount, packageForm.currency)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-muted-foreground">
                      Nenhum módulo foi incluído ainda no pacote local.
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3 rounded-[22px] border border-white/8 bg-black/18 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total base</span>
                    <span className="font-medium text-foreground">{formatCurrency(baseTotal, packageForm.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Comissão base</span>
                    <span className="font-medium text-foreground">{formatCurrency(commissionBase, packageForm.currency)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Margem aplicada</span>
                      <span className="font-medium text-foreground">{margin[0]}%</span>
                    </div>
                    <Slider value={margin} min={0} max={35} step={1} onValueChange={setMargin} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Desconto visual</span>
                      <span className="font-medium text-foreground">{discount[0]}%</span>
                    </div>
                    <Slider value={discount} min={0} max={15} step={1} onValueChange={setDiscount} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lucro estimado</span>
                    <span className="font-medium text-foreground">{formatCurrency(estimatedProfit, packageForm.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/8 pt-3 text-sm">
                    <span className="text-muted-foreground">Valor final</span>
                    <span className="text-lg font-semibold text-foreground">{formatCurrency(finalTotal, packageForm.currency)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <AgencyRebuildActionButton actionType="modal" label="Visualizar proposta" className="h-8 rounded-full px-3 text-xs" onAction={() => setProposalOpen(true)} />
                  <AgencyRebuildActionButton
                    actionType="api"
                    label="Editar item"
                    variant="outline"
                    className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                    onAction={() => setTab("lodging")}
                  />
                  <AgencyRebuildActionButton
                    actionType="api"
                    label="Remover item"
                    variant="outline"
                    className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                    onAction={() => {
                      setSelectedCarId(null)
                      toast({ title: "Item ajustado", description: "A edição rápida removeu a locação local do resumo." })
                    }}
                  />
                </div>
              </BaseCardV3>

              <BaseCardV3 eyebrow="Integração futura" title="Operadora principal" description="Estrutura pronta para uma operadora única cuidar de disponibilidade, reserva e pagamento." className="rounded-[28px]">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Conectada: {operatorName}</div>
                  <div>Status: {operatorStatus}</div>
                  <div>Disponibilidade futura: preparada</div>
                  <div>Sincronização: futura</div>
                  <div>Tokens/API: camada honesta, ainda local</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AgencyRebuildActionButton
                    actionType="api"
                    label="Atualizar status"
                    className="h-8 rounded-full px-3 text-xs"
                    onAction={() => {
                      setOperatorStatus("Disponibilidade futura preparada")
                      toast({ title: "Status ajustado", description: "O bloco de integração foi atualizado localmente." })
                    }}
                  />
                  <AgencyRebuildActionButton
                    actionType="future"
                    label="Conectar operadora"
                    variant="outline"
                    className="h-8 rounded-full border-white/10 bg-white/[0.03] px-3 text-xs"
                    futureMessage="A conexão real com a operadora principal será feita numa etapa posterior."
                  />
                </div>
              </BaseCardV3>
            </div>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={cartOpen}
        onOpenChange={setCartOpen}
        title="Carrinho / Orçamento"
        description="Itens adicionados, passageiros, datas, taxas, comissão, margem e ações de proposta."
        contentClassName="sm:max-w-6xl"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="future"
              label="Gerar PDF"
              className="rounded-full"
              futureMessage="A geração real de PDF será conectada quando a camada de proposta estiver pronta."
            />
            <AgencyRebuildActionButton actionType="modal" label="Gerar proposta web" className="rounded-full" onAction={() => {
              setCartOpen(false)
              setProposalOpen(true)
            }} />
            <AgencyRebuildActionButton
              actionType="future"
              label="Compartilhar link"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              futureMessage="O compartilhamento real do orçamento web será ativado depois."
            />
            <AgencyRebuildActionButton
              actionType="future"
              label="Gerar vouchers"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              futureMessage="A emissão consolidada de vouchers continua mockada/local nesta fase."
            />
            <AgencyRebuildActionButton
              actionType="api"
              label="Salvar orçamento"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              onAction={() => {
                setStatus("Pronto para proposta")
                toast({ title: "Orçamento salvo", description: "O orçamento foi preservado localmente no Travel Builder." })
              }}
            />
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {summaryItems.map((item) => (
              <div key={`cart-${item.label}-${item.value}`} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                <div className="grid gap-3 xl:grid-cols-[1.3fr_0.7fr_0.5fr_0.5fr_60px]">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{packageForm.startDate} até {packageForm.endDate}</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(item.amount * 0.045, packageForm.currency)}</div>
                  <div className="text-sm font-medium text-foreground">{formatCurrency(item.amount, packageForm.currency)}</div>
                  <AgencyRebuildActionButton
                    actionType="api"
                    label="×"
                    className="h-9 w-9 rounded-full px-0"
                    onAction={() => {
                      if (item.label === "Hotel") setSelectedHotelId(null)
                      if (item.label === "Voo ida") setSelectedOutboundId(null)
                      if (item.label === "Voo volta") setSelectedReturnId(null)
                      if (item.label === "Carro") setSelectedCarId(null)
                      toast({ title: "Item removido", description: "O carrinho foi atualizado localmente." })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="rounded-[24px] border border-white/8 bg-black/16 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Margem e comissão</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Valor original</span>
                  <span className="font-medium text-foreground">{formatCurrency(baseTotal, packageForm.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Comissão base</span>
                  <span className="font-medium text-foreground">{formatCurrency(commissionBase, packageForm.currency)}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Margem aplicada</span>
                    <span className="font-medium text-foreground">{margin[0]}%</span>
                  </div>
                  <Slider value={margin} min={0} max={35} step={1} onValueChange={setMargin} />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-black/16 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/72">Dados do cliente</p>
              <div className="mt-4 grid gap-3">
                <Input className="h-10 rounded-[16px] border-white/10 bg-white/[0.03]" placeholder="Atendente" />
                <Input className="h-10 rounded-[16px] border-white/10 bg-white/[0.03]" placeholder="Nome" />
                <Input className="h-10 rounded-[16px] border-white/10 bg-white/[0.03]" placeholder="Email" />
                <Input className="h-10 rounded-[16px] border-white/10 bg-white/[0.03]" placeholder="Telefone / WhatsApp" />
              </div>
            </div>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={proposalOpen}
        onOpenChange={setProposalOpen}
        title="Preview da proposta personalizada"
        description="Identidade da agência, capa, resumo da viagem, hotel, voos, valores, políticas e CTA WhatsApp."
        contentClassName="sm:max-w-6xl"
        footer={
          <>
            <AgencyRebuildActionButton
              actionType="future"
              label="Compartilhar proposta"
              className="rounded-full"
              futureMessage="O envio real da proposta web será conectado depois."
            />
            <AgencyRebuildActionButton
              actionType="future"
              label="Gerar vouchers"
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03]"
              futureMessage="Os vouchers seguem mockados/localmente nesta etapa do builder."
            />
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,126,29,0.22),rgba(255,255,255,0.02))] p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">TravelPro V3 • Proposta personalizada</p>
            <h3 className="mt-3 text-3xl font-semibold text-foreground">{packageForm.destination} com assinatura da agência</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Proposta premium com branding da agência, capa moderna, resumo executivo da viagem e leitura comercial pronta para WhatsApp e web.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            {proposalSections.map((section) => (
              <BaseCardV3 key={section.title} eyebrow="Proposta" title={section.title} description={section.body} className="rounded-[26px]" />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <BaseCardV3 eyebrow="Resumo da viagem" title={`${packageForm.origin} → ${packageForm.destination}`} description={`${packageForm.startDate} até ${packageForm.endDate} • ${passengerCount} passageiros`} className="rounded-[28px]">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>Hotel: {selectedHotel?.name ?? "Sem hotel selecionado"}</div>
                <div>Voos: {selectedOutbound?.airline ?? "Sem voo"} • ida e volta</div>
                <div>Extras: {selectedServiceItems.length + selectedCircuitItems.length + selectedInsuranceItems.length + selectedExtraItems.length} módulos adicionais</div>
              </div>
            </BaseCardV3>
            <BaseCardV3 eyebrow="Valores e política" title={formatCurrency(finalTotal, packageForm.currency)} description="Valor final com margem, comissão e observações comerciais." className="rounded-[28px]">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>Comissão base: {formatCurrency(commissionBase, packageForm.currency)}</div>
                <div>Margem aplicada: {margin[0]}%</div>
                <div>CTA consultor: fale pelo WhatsApp da agência</div>
              </div>
            </BaseCardV3>
          </div>
        </div>
      </BaseModalV3>

      <BaseModalV3
        open={passengerOpen}
        onOpenChange={setPassengerOpen}
        title="Passageiros e quartos"
        description="Expansão premium para adultos, crianças, idades e distribuição de quartos."
        contentClassName="sm:max-w-3xl"
        footer={
          <AgencyRebuildActionButton
            actionType="modal"
            label="Aplicar"
            className="rounded-full"
            onAction={() => setPassengerOpen(false)}
          />
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select value={packageForm.adults} onValueChange={(value) => setPackageForm((current) => ({ ...current, adults: value }))}>
            <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Adultos" /></SelectTrigger>
            <SelectContent>
              {["1", "2", "3", "4", "5", "6"].map((item) => <SelectItem key={item} value={item}>{item} adultos</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={packageForm.children} onValueChange={(value) => setPackageForm((current) => ({ ...current, children: value }))}>
            <SelectTrigger className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]"><SelectValue placeholder="Crianças" /></SelectTrigger>
            <SelectContent>
              {["0", "1", "2", "3", "4"].map((item) => <SelectItem key={item} value={item}>{item} crianças</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={packageForm.childrenAges} onChange={(event) => setPackageForm((current) => ({ ...current, childrenAges: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Idades das crianças" />
          <Input value={packageForm.rooms} onChange={(event) => setPackageForm((current) => ({ ...current, rooms: event.target.value }))} className="h-11 rounded-[18px] border-white/10 bg-white/[0.03]" placeholder="Quartos" />
        </div>
      </BaseModalV3>
    </>
  )
}
