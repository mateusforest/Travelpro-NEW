"use client"

import { CreditCard, HelpCircle } from "lucide-react"
import { FeatureExplanationCard } from "@/components/system/feature-explanation-card"
import { OperationalWorkspaceLayout } from "@/components/system/operational-workspace-layout"
import { PageShell } from "@/components/system/page-shell"
import { PlanComparison } from "@/components/system/plan-comparison"
import { PrimaryButton } from "@/components/system/primary-button"
import { SecondaryButton } from "@/components/system/secondary-button"
import { SectionHeader } from "@/components/system/section-header"
import { SetupStatusCard } from "@/components/system/setup-status-card"
import { SmartActionButton } from "@/components/system/smart-action-button"
import { WorkspaceSidebarInfo } from "@/components/system/workspace-sidebar-info"

export default function AgencyPlansWorkspacePage() {
  return (
    <PageShell>
      <SectionHeader
        title="Planos, pacotes e expansões"
        description="Uma visão mais clara de plano atual, limites, extras, créditos e add-ons do ecossistema TravelPro."
        actions={
          <>
            <SmartActionButton label="Configurar com IA" description="A IA poderá sugerir plano, add-ons e créditos com base no uso da agência." />
            <SecondaryButton>
              <HelpCircle className="h-4 w-4" />
              Ver perguntas frequentes
            </SecondaryButton>
            <PrimaryButton>
              <CreditCard className="h-4 w-4" />
              Comprar créditos
            </PrimaryButton>
          </>
        }
      />

      <OperationalWorkspaceLayout
        sidebar={
          <>
            <WorkspaceSidebarInfo
              title="Plano atual"
              description="Leitura simples do momento atual da agência."
              items={[
                { label: "Plano", value: "Pro" },
                { label: "Uso atual", value: "68% da capacidade", hint: "Boa margem para campanhas e operações da semana." },
                { label: "Créditos", value: "2.140 disponíveis", hint: "Consumo mais alto em Agent e TravelPro Go." },
                { label: "Próxima renovação", value: "28 mai 2026" },
              ]}
            />
            <SetupStatusCard
              title="Add-ons em foco"
              description="Leitura rápida dos módulos premium e oportunidades de expansão."
              badges={[
                "TravelPro Match ativo",
                "Agent em uso",
                "Marketing IA disponível",
                "Automações em expansão",
              ]}
            />
          </>
        }
      >
        <PlanComparison
          plans={[
            { name: "Start", price: "R$ 497", features: ["3 usuários", "1.500 créditos", "Go básico", "Match de entrada"] },
            { name: "Pro", price: "R$ 997", highlight: true, features: ["6 usuários", "3.500 créditos", "Agent assistido", "Marketing IA ativo"] },
            { name: "Scale", price: "R$ 1.490", features: ["8 usuários", "6.000 créditos", "Agent completo", "Automações premium"] },
          ]}
        />

        <FeatureExplanationCard
          title="Pacotes extras"
          description="Add-ons pensados para ativar crescimento, distribuição e inteligência operacional."
          items={[
            { title: "Créditos IA", body: "Mais capacidade para roteiros, documentos, campanhas e análises." },
            { title: "Usuários extras", body: "Escala de equipe com acesso controlado e módulos dedicados." },
            { title: "TravelPro Match e Agent", body: "Mais distribuição, qualificação de leads e jornada comercial assistida." },
            { title: "WhatsApp / Go e templates premium", body: "Expansão operacional e de materiais sem depender de workarounds." },
          ]}
        />

        <FeatureExplanationCard
          title="Benefícios por plano"
          description="Uma leitura mais educativa e comercial, sem depender de modais curtos."
          items={[
            { title: "Start", body: "Ideal para operações menores que precisam organizar catálogo, documentos e viagens." },
            { title: "Pro", body: "Equilíbrio entre equipe, IA, distribuição e recursos premium do ecossistema." },
            { title: "Scale", body: "Pensado para agências com maior volume, automações e operação inteligente." },
          ]}
        />
      </OperationalWorkspaceLayout>
    </PageShell>
  )
}
