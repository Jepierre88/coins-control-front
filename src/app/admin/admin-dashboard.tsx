"use client";

import * as React from "react";

import CoinsBuildingTabs from "@/components/coins/coins-building-tabs.component";
import CoinsBadge from "@/components/coins/coins-badge.component";
import CoinsButton from "@/components/coins/coins-button.component";
import CoinsCard, {
  CoinsCardContent,
  CoinsCardDescription,
  CoinsCardFooter,
  CoinsCardHeader,
  CoinsCardTitle,
} from "@/components/coins/coins-card.component";
import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import {
  getApartmentsCountByBuildingId,
  getSchedulingsByApartmentForMonth,
  type ApartmentSchedulingCount,
  getSchedulingsCountByBuildingIdAndRange,
} from "@/datasource/coins-control.datasource";
import type { Building } from "@/types/auth-types.entity";
import CoinsMonthPicker from "@/components/coins/coins-month-picker.component";
import CoinsBarChart from "@/components/coins/coins-bar-chart.component";
import CoinsPieChart from "@/components/coins/coins-pie-chart.component";
import CoinsLineChart from "@/components/coins/coins-line-chart.component";
import { useLoading } from "@/context/loading.context";

function currentMonthValue(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthToUtcRange(month: string): {
  startDatetime: string;
  endDatetime: string;
} {
  const [y, m] = month.split("-").map((v) => Number(v));
  if (!y || !m || m < 1 || m > 12) {
    throw new Error("Invalid month format. Expected YYYY-MM");
  }

  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

  return { startDatetime: start.toISOString(), endDatetime: end.toISOString() };
}

function getInitials(name?: string | null) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/g).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

function mask(value?: string | null) {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `${value.slice(0, 2)}••••${value.slice(-2)}`;
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1">
      <div className="text-muted-fg text-sm/6">{label}</div>
      <div className="text-sm/6">
        {value ?? <span className="text-muted-fg">—</span>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { useSession } = authClient;
  const sessionQuery = useSession();
  const { setLoading, isLoading: isLoadingContext } = useLoading();

  const data = (sessionQuery as any)?.data;
  const session = (data?.session ?? data) as any;
  const isLoading = Boolean(
    (sessionQuery as any)?.isPending ?? (sessionQuery as any)?.isLoading
  );
  const error = (sessionQuery as any)?.error;

  const buildings: Building[] = session?.buildings ?? [];
  const sessionSelectedBuilding: Building | null =
    session?.selectedBuilding ?? null;

  const [activeBuildingId, setActiveBuildingId] = React.useState<string>("");

  // Solo un selector de mes compartido
  const [month, setMonth] = React.useState<string>(() => currentMonthValue());

  const [apartmentsCount, setApartmentsCount] = React.useState<number>(0);
  const [totalSchedulings, setTotalSchedulings] = React.useState<number>(0);
  const [apartmentSchedulings, setApartmentSchedulings] = React.useState<
    ApartmentSchedulingCount[]
  >([]);

  const [metricsError, setMetricsError] = React.useState<string | null>(null);

  const activeBuildingFromList = React.useMemo(() => {
    if (!activeBuildingId) return null;
    return buildings.find((b) => String(b.id) === activeBuildingId) ?? null;
  }, [activeBuildingId, buildings]);

  const selectedBuilding =
    sessionSelectedBuilding &&
    (!activeBuildingId ||
      String(sessionSelectedBuilding.id) === activeBuildingId)
      ? sessionSelectedBuilding
      : activeBuildingFromList;

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!selectedBuilding?.id) {
        setApartmentsCount(0);
        setTotalSchedulings(0);
        setApartmentSchedulings([]);
        setMetricsError(null);
        return;
      }

      setLoading("metrics", true);
      setMetricsError(null);

      try {
        const range = monthToUtcRange(month);

        const [apartmentsRes, schedulingsCountRes, apartmentSchedulingsRes] =
          await Promise.all([
            getApartmentsCountByBuildingId(selectedBuilding.id),
            getSchedulingsCountByBuildingIdAndRange({
              buildingId: selectedBuilding.id,
              startDatetime: range.startDatetime,
              endDatetime: range.endDatetime,
            }),
            getSchedulingsByApartmentForMonth({
              buildingId: selectedBuilding.id,
              month: month,
            }),
          ]);

        if (cancelled) return;

        if (!apartmentsRes.success) {
          setMetricsError(
            apartmentsRes.message || "No se pudieron cargar las métricas"
          );
          return;
        }

        if (!schedulingsCountRes.success) {
          setMetricsError(
            schedulingsCountRes.message ||
              "No se pudieron cargar los agendamientos"
          );
          return;
        }

        setApartmentsCount(apartmentsRes.data ?? 0);
        setTotalSchedulings(schedulingsCountRes.data ?? 0);
        setApartmentSchedulings(apartmentSchedulingsRes.data ?? []);
      } catch {
        if (cancelled) return;
        setMetricsError("No se pudieron cargar las métricas");
      } finally {
        if (cancelled) return;
        setLoading("metrics", false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [selectedBuilding?.id, month]);

  return (
    <Container className="py-8" constrained>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading level={1}>Métricas</Heading>
          <div className="text-muted-fg text-sm/6">
            {isLoading
              ? "Cargando sesión…"
              : selectedBuilding
              ? "Dashboard del edificio seleccionado"
              : "Selecciona un edificio para ver su dashboard"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CoinsBuildingTabs onSelectedIdChange={setActiveBuildingId} />
        </div>
      </div>

      <Separator className="my-6" />

      {error ? (
        <CoinsCard>
          <CoinsCardHeader
            title="No se pudo cargar la sesión"
            description="Revisa tu conexión o vuelve a iniciar sesión."
          />
          <CoinsCardContent>
            <pre className="overflow-auto rounded-md bg-muted/40 p-4 text-xs">
              {JSON.stringify(error, null, 2)}
            </pre>
          </CoinsCardContent>
        </CoinsCard>
      ) : null}

      {!error && !isLoading && !selectedBuilding ? (
        <CoinsCard>
          <CoinsCardHeader
            title="Sin building seleccionado"
            description="Elige uno para ver información y estado."
          />
          <CoinsCardContent className="space-y-4">
            <div className="text-sm/6">
              Buildings disponibles:{" "}
              <span className="font-medium">{buildings.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {buildings.map((b) => (
                <div key={b.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="lg"
                      src={b.urlImage ?? null}
                      alt={b.name}
                      initials={getInitials(b.name)}
                      isSquare
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-sm/6">
                        {b.name}
                      </div>
                      <div className="truncate text-muted-fg text-xs/5">
                        {b.address ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CoinsCardContent>
        </CoinsCard>
      ) : null}

      {!error && selectedBuilding ? (
        <div className="space-y-6">
          {/* Selector de mes */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Métricas del Edificio</h2>
              <p className="text-sm text-muted-fg">
                Visualiza los agendamientos y estadísticas del mes seleccionado
              </p>
            </div>
            <CoinsMonthPicker
              className="w-min"
              value={month}
              onChange={setMonth}
            />
          </div>

          {metricsError ? (
            <div className="text-sm/6 text-danger-subtle-fg rounded-md bg-danger/10 p-4">
              {metricsError}
            </div>
          ) : null}

          {/* Grid tipo Masonry */}
          <div className="grid gap-4 auto-rows-auto sm:grid-cols-2 lg:grid-cols-3">

            <CoinsCard className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
              <CoinsCardHeader
                title="Distribución"
                description="Cantidad de agendamientos"
              />
              <CoinsCardContent className="flex flex-col justify-center">
                <CoinsPieChart
                  items={apartmentSchedulings.slice(0, 10).map((item, idx) => ({
                    name: item.apartmentName,
                    value: item.count,
                  }))}
                  containerHeight={280}
                  middleLabel="Agendamientos"
                  loadingKey="metrics"
                />
              </CoinsCardContent>
            </CoinsCard>

            {/* Agendamientos por Apartamento (Barras) */}
            <CoinsCard className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
              <CoinsCardHeader
                title="Por Apartamento"
                description="Cantidad de reservas"
              />
              <CoinsCardContent className="h-full flex flex-col justify-center">
                <CoinsBarChart
                  items={apartmentSchedulings.map((item, idx) => ({
                    label: item.apartmentName,
                    value: item.count,
                    colorVar: `--chart-${(idx % 5) + 1}` as any,
                  }))}
                  maxValue={Math.max(
                      ...apartmentSchedulings.map((a) => a.count)
                    )}
                    loadingKey="metrics"
                  />
              </CoinsCardContent>
            </CoinsCard>

            {/* Detalles del Building */}
            <CoinsCard className="sm:col-span-2 h-min">
              <CoinsCardHeader
                title="Detalles"
                description="Información general"
              />
              <CoinsCardContent className="space-y-3">
                <InfoRow
                  label="Estado"
                  value={
                    <CoinsBadge
                      intent={selectedBuilding.state ? "success" : "danger"}
                    >
                      {selectedBuilding.state ? "Activo" : "Inactivo"}
                    </CoinsBadge>
                  }
                />
                <InfoRow
                  label="Dirección"
                  value={selectedBuilding.address || "—"}
                />
                <InfoRow
                  label="Descripción"
                  value={selectedBuilding.description || "—"}
                />
                <InfoRow
                  label="Holding"
                  value={selectedBuilding.holdingId || "—"}
                />
                <InfoRow
                  label="Stays"
                  value={selectedBuilding.staysId || "—"}
                />
              </CoinsCardContent>
            </CoinsCard>

            {/* Conexión */}
            <CoinsCard>
              <CoinsCardHeader
                title="Conexión"
                description="Datos no sensibles"
              />
              <CoinsCardContent className="space-y-3">
                <InfoRow
                  label="Client ID"
                  value={selectedBuilding.clientId || "—"}
                />
                <InfoRow
                  label="Usuario"
                  value={
                    selectedBuilding.username
                      ? mask(selectedBuilding.username)
                      : "—"
                  }
                />
                <InfoRow
                  label="Client Secret"
                  value={
                    selectedBuilding.clientSecret
                      ? mask(selectedBuilding.clientSecret)
                      : "—"
                  }
                />
              </CoinsCardContent>
              <CoinsCardFooter>
                <CoinsButton
                  variant="outline"
                  type="button"
                  onClick={() => (window.location.href = "/")}
                >
                  Ir al inicio
                </CoinsButton>
              </CoinsCardFooter>
            </CoinsCard>
          </div>
        </div>
      ) : null}
    </Container>
  );
}
