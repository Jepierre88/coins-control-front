"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, LogIn} from "lucide-react";

import CoinsBadge from "@/components/coins/coins-badge.component";
import CoinsButton from "@/components/coins/coins-button.component";
import CoinsCard, {
  CoinsCardContent,
  CoinsCardFooter,
  CoinsCardHeader,
} from "@/components/coins/coins-card.component";
import CoinsBarChart from "@/components/coins/coins-bar-chart.component";
import CoinsForm, {
  CoinsFormField,
} from "@/components/coins/coins-form.component";
import { UseDialogContext } from "@/context/dialog.context";
import { CoinsModal, CoinsModalBody, CoinsModalContent, CoinsModalFooter, CoinsModalHeader, CoinsModalTitle } from "@/components/coins/coins-modal.component";
import { CoinsSheet, CoinsSheetBody, CoinsSheetContent, CoinsSheetFooter, CoinsSheetHeader, CoinsSheetTitle } from "@/components/coins/coins-sheet.component";
import SchedulingQrDialog from "@/components/coins/agendamientos/scheduling-qr-dialog.component";

import { useForm } from "react-hook-form";
import Image from "next/image";
import CoinsCircle from "@/public/img/coins-circle.png";

type LeadFormValues = {
  name: string;
  email: string;
};

const enter = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { type: "spring", stiffness: 320, damping: 30 },
} as const;

function formatNumber(n: number) {
  return new Intl.NumberFormat("es-CO").format(n);
}

export default function Home() {
  const { openDialog, showYesNoDialog } = UseDialogContext();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const leadForm = useForm<LeadFormValues>({
    defaultValues: { name: "", email: "" },
    mode: "onChange",
  });

  const kpis = React.useMemo(
    () => ({
      buildings: 12,
      apartments: 148,
      reservationsThisMonth: 326,
      avgOccupancy: 82,
      checkinsToday: 14,
    }),
    [],
  );

  const schedulingImprovement = React.useMemo(
    () => [
      { label: "Jul", value: 58, colorVar: "--chart-3" as const },
      { label: "Ago", value: 64, colorVar: "--chart-3" as const },
      { label: "Sep", value: 70, colorVar: "--chart-2" as const },
      { label: "Oct", value: 78, colorVar: "--chart-2" as const },
      { label: "Nov", value: 85, colorVar: "--primary" as const },
      { label: "Dic", value: 91, colorVar: "--primary" as const },
    ],
    [],
  );

  return (
    <main className="relative min-h-screen">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center gap-3">
            <Image src={CoinsCircle} alt="Coins Circle" width={40}/>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <div className="font-semibold">Coins Control</div>
                <CoinsBadge intent="primary">Rentas cortas</CoinsBadge>
              </div>
              <div className="text-xs text-muted-fg">Accesos · Agendamientos · Operación</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Link href="/auth/login">
              <CoinsButton variant="primary" startIcon={LogIn}>Iniciar sesión</CoinsButton>
            </Link>
          </div>
        </header>

        {/* Mobile CTA: botón fijo abajo a la derecha */}
        <div className="sm:hidden fixed bottom-4 right-4 z-50">
          <Link href="/auth/login" aria-label="Iniciar sesión">
            <CoinsButton variant="primary" startIcon={LogIn}>
              Iniciar sesión
            </CoinsButton>
          </Link>
        </div>

        {/* Hero */}
        <section className="grid grid-cols-1 gap-6 pb-10 pt-2 lg:grid-cols-2 lg:items-stretch">
          <motion.div {...enter} className="flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <CoinsBadge intent="info">Dashboard</CoinsBadge>
                <CoinsBadge intent="success">Accesos</CoinsBadge>
                <CoinsBadge intent="warning">Reservas</CoinsBadge>
              </div>

              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Administra tus unidades con datos claros y accesos listos.
              </h1>
              <p className="max-w-xl text-pretty text-base text-muted-fg sm:text-lg">
                Una vista única para edificios, apartamentos y agendamientos. Métricas, trazabilidad y
                control operativo para rentas cortas.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/admin">
                  <CoinsButton variant="primary" startIcon={Check}>
                    Ver el panel
                  </CoinsButton>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="text-xs text-muted-fg">Edificios</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{formatNumber(kpis.buildings)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="text-xs text-muted-fg">Unidades</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{formatNumber(kpis.apartments)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="text-xs text-muted-fg">Reservas (mes)</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{formatNumber(kpis.reservationsThisMonth)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="text-xs text-muted-fg">Ocupación</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{kpis.avgOccupancy}%</div>
              </div>
            </div>
          </motion.div>

          <motion.div {...enter} className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-primary/10 blur-2xl" />
            <CoinsCard className="relative bg-overlay/60 ring-1 ring-primary/10 transition-shadow hover:shadow-md">
              <CoinsCardHeader
                title="Mejora en agendamientos"
                description="Agendamientos a tiempo (%), últimos 6 meses"
              />
              <CoinsCardContent className="px-0">
                <CoinsBarChart items={schedulingImprovement} className="w-full" containerHeight={320} />
              </CoinsCardContent>
              <CoinsCardFooter className="justify-between">
                <div className="text-xs text-muted-fg">Impacto directo en la operación</div>
                <CoinsBadge intent="success">+33 pts</CoinsBadge>
              </CoinsCardFooter>
            </CoinsCard>
          </motion.div>
        </section>

        {/* Analítica */}
        <section id="analytics" className="pb-12 pt-2">
          <motion.div {...enter} className="mb-6 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Analítica para decisiones rápidas</h2>
              <p className="mt-1 text-sm text-muted-fg">
                Gráficos responsivos para ingresos, demanda y tendencia.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2" />
          </motion.div>
        </section>

        {/* CTA + Interacciones */}
        <section id="cta" className="pb-16">
          <motion.div {...enter} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CoinsCard className="bg-overlay/50 transition-shadow hover:shadow-md lg:col-span-3">
              <CoinsCardHeader title="Pide una demo" description="Déjanos tus datos y te contactamos" />
              <CoinsCardContent>
                <CoinsForm
                  form={leadForm}
                  onSubmit={(values) => {
                    openDialog({
                      title: "Solicitud recibida",
                      description: "Gracias. Un asesor se pondrá en contacto contigo.",
                      content: (
                        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                          <div className="font-medium">Te contactaremos pronto</div>
                          <div className="mt-1 text-muted-fg">
                            {values.name} · {values.email}
                          </div>
                        </div>
                      ),
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CoinsFormField
                      form={leadForm}
                      name="name"
                      label="Nombre"
                      inputProps={{ placeholder: "Tu nombre", required: true }}
                      rules={{ required: "Requerido" }}
                    />
                    <CoinsFormField
                      form={leadForm}
                      name="email"
                      label="Correo"
                      inputProps={{ placeholder: "correo@dominio.com", inputMode: "email", required: true }}
                      rules={{ required: "Requerido" }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">

                    <CoinsButton type="submit" variant="primary">
                      Solicitar demo
                    </CoinsButton>
                  </div>
                </CoinsForm>
              </CoinsCardContent>
            </CoinsCard>
          </motion.div>
        </section>

        {/* Modal/Sheet (pantallas de detalle) */}
        <section className="pb-16">
          <motion.div {...enter} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CoinsCard className="bg-overlay/50 transition-shadow hover:shadow-md lg:col-span-3">
              <CoinsCardHeader
                title="Integración con chapas inteligentes"
                description="Flujo: generar y compartir un acceso sin fricción"
              />
              <CoinsCardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="text-sm font-semibold">1) Reserva confirmada</div>
                  <div className="mt-1 text-sm text-muted-fg">
                    Se programa el acceso para el rango de fechas.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CoinsBadge intent="success">Auto</CoinsBadge>
                    <CoinsBadge intent="info">Trazabilidad</CoinsBadge>
                    <CoinsBadge intent="muted">Sin llaves</CoinsBadge>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="text-sm font-semibold">2) Código + QR</div>
                  <div className="mt-1 text-sm text-muted-fg">
                    Envíalo al huésped por WhatsApp/mail.
                  </div>
                  <div className="mt-3">
                    <CoinsButton
                      variant="primary"
                      onClick={() => {
                        openDialog({
                          title: "Acceso generado",
                          description: "QR y código listos para compartir con el huésped.",
                          content: (
                            <SchedulingQrDialog
                              qrValue="coins:access:lock:987"
                              code="489216"
                              onShare={() => {
                                navigator.clipboard
                                  .writeText("QR: coins:access:lock:987\nCódigo: 489216")
                                  .catch(() => null);
                              }}
                            />
                          ),
                        });
                      }}
                    >
                      Generar acceso
                    </CoinsButton>
                  </div>
                </div>
              </CoinsCardContent>
              <CoinsCardFooter className="justify-between">
                <div className="text-xs text-muted-fg">Todo en la misma plataforma.</div>
                <CoinsBadge intent="primary">Accesos automatizados</CoinsBadge>
              </CoinsCardFooter>
            </CoinsCard>
          </motion.div>

          <CoinsModal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
            <CoinsModalContent size="md" isBlurred>
              <CoinsModalHeader>
                <CoinsModalTitle>Detalle de unidad</CoinsModalTitle>
              </CoinsModalHeader>
              <CoinsModalBody>
                <div className="space-y-2">
                  <div className="text-sm text-muted-fg">
                    Ficha con ocupación, estado y acciones.
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                    Ocupación: <span className="font-mono tabular-nums">82%</span>
                  </div>
                </div>
              </CoinsModalBody>
              <CoinsModalFooter>
                <CoinsButton variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cerrar
                </CoinsButton>
              </CoinsModalFooter>
            </CoinsModalContent>
          </CoinsModal>

          <CoinsSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <CoinsSheetContent onOpenChange={setIsSheetOpen}>
              <CoinsSheetHeader>
                <CoinsSheetTitle>Panel rápido</CoinsSheetTitle>
              </CoinsSheetHeader>
              <CoinsSheetBody>
                <div className="space-y-3">
                  <div className="text-sm text-muted-fg">Acciones frecuentes.</div>
                  <div className="flex flex-wrap gap-2">
                    <CoinsButton
                      variant="primary"
                      onClick={() => {
                        setIsSheetOpen(false);
                        showYesNoDialog({
                          title: "Confirmación",
                          description: "Confirmación antes de una acción sensible.",
                          handleYes: async () => {},
                          handleNo: async () => {},
                        });
                      }}
                    >
                      Confirmar
                    </CoinsButton>
                    <CoinsButton variant="outline" onClick={() => setIsSheetOpen(false)}>
                      Cancelar
                    </CoinsButton>
                  </div>
                </div>
              </CoinsSheetBody>
              <CoinsSheetFooter>
                <CoinsBadge intent="muted">Desliza hacia abajo para cerrar</CoinsBadge>
              </CoinsSheetFooter>
            </CoinsSheetContent>
          </CoinsSheet>
        </section>

        <footer className="pb-10 text-center text-xs text-muted-fg">
          © {new Date().getFullYear()} Coins Control.
        </footer>
      </div>
    </main>
  );
}
