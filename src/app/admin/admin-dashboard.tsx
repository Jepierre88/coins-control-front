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
  getSchedulingsMonthlyCounts,
  type BuildingDashboardMetrics,
} from "@/datasource/coins-control.datasource";
import type { Building } from "@/types/auth-types.entity";
import CoinsMonthPicker from "@/components/coins/coins-month-picker.component";
import CoinsBarSeriesChart from "@/components/coins/coins-bar-series-chart.component";
import CoinsLineChart from "@/components/coins/coins-line-chart.component";
import CoinsSelect from "@/components/coins/coins-select.component";
import {
  CoinsTab,
  CoinsTabs,
  CoinsTabsList,
} from "@/components/coins/coins-tabs.component";

function currentMonthValue(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
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

type FilterMode = "month" | "range" | "year";

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

  const [month, setMonth] = React.useState<string>(() => currentMonthValue());
  const [filterMode, setFilterMode] = React.useState<FilterMode>("month");
  const [rangeStartMonth, setRangeStartMonth] = React.useState<string>(() =>
    currentMonthValue()
  );
  const [rangeEndMonth, setRangeEndMonth] = React.useState<string>(() =>
    currentMonthValue()
  );
  const [year, setYear] = React.useState<number>(() =>
    new Date().getFullYear()
  );

  const [metrics, setMetrics] = React.useState<BuildingDashboardMetrics | null>(
    null
  );
  const [seriesPoints, setSeriesPoints] = React.useState<
    Array<{ label: string; value: number }>
  >([]);
  const [metricsLoading, setMetricsLoading] = React.useState(false);
  const [metricsError, setMetricsError] = React.useState<string | null>(null);

  const yearOptions = React.useMemo(() => {
    const current = new Date().getFullYear();
    return [0, 1, 2, 3, 4].map((offset) => {
      const y = String(current - offset);
      return { value: y, label: y };
    });
  }, []);

  const shouldUseLineChart = !metricsLoading && seriesPoints.length >= 7;

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
        setMetrics(null);
        setSeriesPoints([]);
        setMetricsError(null);
        return;
      }

      setMetricsLoading(true);
      setMetricsError(null);

      try {
        if (filterMode === "range" && rangeStartMonth > rangeEndMonth) {
          setMetrics(null);
          setSeriesPoints([]);
          setMetricsError("El mes de inicio debe ser menor o igual al mes fin");
          return;
        }

        const [apartmentsRes, monthlyRes] = await Promise.all([
          getApartmentsCountByBuildingId(selectedBuilding.id),
          getSchedulingsMonthlyCounts(
            filterMode === "year"
              ? { buildingId: selectedBuilding.id, year }
              : filterMode === "range"
              ? {
                  buildingId: selectedBuilding.id,
                  startMonth: rangeStartMonth,
                  endMonth: rangeEndMonth,
                }
              : {
                  buildingId: selectedBuilding.id,
                  startMonth: month,
                  endMonth: month,
                }
          ),
        ]);

        if (cancelled) return;

        if (!apartmentsRes.success) {
          setMetrics(null);
          setSeriesPoints([]);
          setMetricsError(
            apartmentsRes.message || "No se pudieron cargar las métricas"
          );
          return;
        }

        if (!monthlyRes.success || !monthlyRes.data) {
          setMetrics(null);
          setSeriesPoints([]);
          setMetricsError(
            monthlyRes.message || "No se pudieron cargar las métricas"
          );
          return;
        }

        const points = monthlyRes.data.items.map((it) => ({
          label: it.month,
          value: it.count,
        }));
        const total = monthlyRes.data.items.reduce(
          (acc, it) => acc + (it.count ?? 0),
          0
        );

        setSeriesPoints(points);
        setMetrics({
          apartmentsCount: apartmentsRes.data ?? 0,
          schedulingsCount: total,
          range: monthlyRes.data.range,
        });
      } catch {
        if (cancelled) return;
        setMetrics(null);
        setSeriesPoints([]);
        setMetricsError("No se pudieron cargar las métricas");
      } finally {
        if (cancelled) return;
        setMetricsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [
    selectedBuilding?.id,
    month,
    filterMode,
    rangeStartMonth,
    rangeEndMonth,
    year,
  ]);

  return (
    <Container className="py-8" constrained>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading level={1}>Admin</Heading>
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
          <CoinsCard>
            <CoinsCardHeader title="Métricas" className="flex justify-between">
              <CoinsTabs
                selectedKey={filterMode}
                onSelectionChange={(key) =>
                  setFilterMode(String(key) as FilterMode)
                }
                className="w-min"
              >
                <CoinsTabsList
                  aria-label="Filtro"
                  items={[
                    { id: "month", label: "Mes" },
                    { id: "range", label: "Rango" },
                    { id: "year", label: "Año" },
                  ]}
                >
                  {(item) => <CoinsTab id={item.id}>{item.label}</CoinsTab>}
                </CoinsTabsList>
              </CoinsTabs>
            </CoinsCardHeader>
            <CoinsCardContent className="space-y-4">
              <div className="flex items-end gap-4 overflow-x-auto">
                <div className="w-min">
                  {filterMode === "month" ? (
                    <CoinsMonthPicker className="w-min" value={month} onChange={setMonth} />
                  ) : filterMode === "range" ? (
                    <div className="inline-flex items-end gap-3">
                      <CoinsMonthPicker
                        className="w-min"
                        label="Desde"
                        value={rangeStartMonth}
                        onChange={setRangeStartMonth}
                      />
                      <CoinsMonthPicker
                        className="w-min"
                        label="Hasta"
                        value={rangeEndMonth}
                        onChange={setRangeEndMonth}
                      />
                    </div>
                  ) : (
                    <div className="w-min">
                      <div className="text-muted-fg text-sm/6">Año</div>
                      <div className="mt-1">
                        <CoinsSelect
                          className="w-fit"
                          value={String(year)}
                          onChange={(e) => setYear(Number(e.target.value))}
                          options={yearOptions}
                          placeholder="Año"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-60 flex-1">
                  {metricsError ? (
                    <div className="text-sm/6 text-danger-subtle-fg">
                      {metricsError}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <CoinsCard>
                  <CoinsCardHeader
                    title="Apartamentos"
                    description="Cantidad total en el edificio"
                  />
                  <CoinsCardContent>
                    <div className="text-3xl font-semibold">
                      {metricsLoading ? "—" : metrics?.apartmentsCount ?? 0}
                    </div>
                  </CoinsCardContent>
                </CoinsCard>

                <CoinsCard>
                  <CoinsCardHeader
                    title="Agendamientos"
                    description="Total en el filtro seleccionado"
                  />
                  <CoinsCardContent>
                    <div className="text-3xl font-semibold">
                      {metricsLoading ? "—" : metrics?.schedulingsCount ?? 0}
                    </div>
                  </CoinsCardContent>
                </CoinsCard>
              </div>

              <CoinsCard>
                <CoinsCardHeader
                  title="Agendamientos por mes"
                  description="Serie mensual"
                />
                <CoinsCardContent>
                  {shouldUseLineChart ? (
                    <CoinsLineChart
                      points={metricsLoading ? [] : seriesPoints}
                      seriesLabel="Agendamientos"
                      colorVar="--chart-1"
                    />
                  ) : (
                    <CoinsBarSeriesChart
                      points={metricsLoading ? [] : seriesPoints}
                      seriesLabel="Agendamientos"
                      colorVar="--chart-1"
                    />
                  )}
                </CoinsCardContent>
              </CoinsCard>
            </CoinsCardContent>
          </CoinsCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <CoinsCard className="lg:col-span-2">
              <CoinsCardHeader
                title="Detalles"
                description="Información general del building"
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
              <CoinsCardFooter>
                <div className="text-muted-fg text-xs/5">
                  Tip: si cambias el building arriba, se actualiza la sesión.
                </div>
              </CoinsCardFooter>
            </CoinsCard>

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
