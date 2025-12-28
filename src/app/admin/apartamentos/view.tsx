"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import CoinsBadge from "@/components/coins/coins-badge.component";
import CoinsCard, {
  CoinsCardContent,
  CoinsCardHeader,
} from "@/components/coins/coins-card.component";
import { CoinsTable, CoinsTableActions, type CoinsTableColumn } from "@/components/coins/coins-table.component";
import { authClient } from "@/lib/auth-client";
import { useLoading } from "@/context/loading.context";
import {
  getApartmentsByBuildingId,
  type ApartmentListItem,
} from "@/datasource/coins-control.datasource";
import type { Building } from "@/types/auth-types.entity";
import { Activity, DoorOpenIcon, X } from "lucide-react";
import { UseDialogContext } from "@/context/dialog.context";
import { toast } from "sonner";
import CoinsRadialHoldButton from "@/components/coins/coins-radial-hold-button.component";
import CoinsButton from "@/components/coins/coins-button.component";

// Función temporal que simula abrir la puerta
async function openDoorTemp(apartmentId: number | string): Promise<boolean> {
  // Por ahora solo retorna true sin hacer nada
  console.log(`[TEMP] Abriendo puerta del apartamento ${apartmentId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay
  return true;
}

export default function ApartamentosView() {
  const { useSession } = authClient;
  const sessionQuery = useSession();
  const { setLoading, isLoading: isLoadingContext } = useLoading();
  const { showYesNoDialog, openDialog } = UseDialogContext();

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
  const [apartments, setApartments] = React.useState<ApartmentListItem[]>([]);
  const [apartmentsError, setApartmentsError] = React.useState<string | null>(null);

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
        setApartments([]);
        setApartmentsError(null);
        return;
      }

      setLoading("apartments", true);
      setApartmentsError(null);

      try {
        const apartmentsRes = await getApartmentsByBuildingId(selectedBuilding.id);

        if (cancelled) return;

        if (!apartmentsRes.success) {
          setApartmentsError(
            apartmentsRes.message || "No se pudieron cargar los apartamentos"
          );
          return;
        }

        setApartments(apartmentsRes.data ?? []);
      } catch {
        if (cancelled) return;
        setApartmentsError("No se pudieron cargar los apartamentos");
      } finally {
        if (cancelled) return;
        setLoading("apartments", false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [selectedBuilding?.id]);

  const { closeDialog } = UseDialogContext();
  const handleOpenDoor = async (apartmentId: number) => {
    try {
      setLoading(`door-${apartmentId}`, true);
      const result = await openDoorTemp(apartmentId);
      if (result) {
        toast.success("¡Puerta abierta exitosamente!");
        closeDialog();
      }
    } catch (error) {
      console.error("Error al abrir la puerta:", error);
      toast.error("Error al abrir la puerta");
    } finally {
      setLoading(`door-${apartmentId}`, false);
    }
  };

  function OpenDoorHoldButton({ onConfirm, loadingKey }: { onConfirm: () => void, loadingKey?: string }) {
    return (
      <CoinsRadialHoldButton
        duration={2000}
        onComplete={onConfirm}
        className="w-full"
        anchorStrength="strong"
        color="#22c55e"
        bgColor="#e5e7eb"
        loadingKey={loadingKey}
      />
    );
  }

  const columns: CoinsTableColumn<ApartmentListItem>[] = [
    {
      id: "address",
      header: "Nombre",
      cell: (row: ApartmentListItem) => row.address || "—",
      isRowHeader: true,
    },
    {
      id: "isActive",
      header: "¿Activo?",
      cell: (row: ApartmentListItem) => (
        <CoinsBadge intent={row.isActive ? "success" : "danger"}>
          {row.isActive ? "Sí" : "No"}
        </CoinsBadge>
      ),
    },
    {
      id: "useDigitCode",
      header: "Requiere código numérico",
      cell: (row: ApartmentListItem) => (
        <CoinsBadge intent={row.useDigitCode ? "success" : "danger"}>
          {row.useDigitCode ? "Sí" : "No"}
        </CoinsBadge>
      ),
    },
    {
      id: "useQRCode",
      header: "QR",
      cell: (row: ApartmentListItem) => (
        <CoinsBadge intent={row.useQRCode ? "success" : "danger"}>
          {row.useQRCode ? "Sí" : "No"}
        </CoinsBadge>
      ),
    },
  ];

  const actions: CoinsTableActions<ApartmentListItem> = {
    items: [
      {
        label: "Abrir",
        icon: DoorOpenIcon,
        id: "open-door",
        variantMobile: "primary",
        onClick: (row: ApartmentListItem) => openDialog({
            title: `Abrir puerta de ${row.name}`,
            content: (
              <OpenDoorHoldButton
                loadingKey={`door-${row.id}`}
                onConfirm={() => handleOpenDoor(row.id)}
              />
            ),
            footer: <CoinsButton onClick={() => closeDialog()} className={"w-full"} startIcon={X} variant="secondary">Cerrar</CoinsButton>,
          })
      },
      {
        label: "Inactivar",
        id: "deactivate",
        variantMobile: "secondary",
        isHidden: (row) => !row.isActive,
        icon: X,
        onClick: (row: ApartmentListItem) => showYesNoDialog({
          title: `¿Inactivar apartamento ${row.name}?`,
            description: "Esta acción lo dejará inactivo.",
            handleYes: async () => {/* TODO: lógica real */},
            handleNo: () => {},
        }),
      },
        {
        label: "Activar",
        id: "activate",
        variantMobile: "outline",
        isHidden: (row) => row.isActive,
        icon: Activity,
        onClick: (row: ApartmentListItem) => showYesNoDialog({
          title: `¿Activar apartamento ${row.name}?`,
            description: "Esta acción lo dejará activo.",
            handleYes: async () => {/* TODO: lógica real */},
            handleNo: () => {},
        }),
      },
    ],
  };

  return (
    <Container className="py-8" constrained>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading level={1}>Apartamentos</Heading>
          <div className="text-muted-fg text-sm/6">
            {isLoading
              ? "Cargando sesión…"
              : selectedBuilding
              ? "Gestiona los apartamentos del edificio seleccionado"
              : "Selecciona un edificio para ver sus apartamentos"}
          </div>
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
            title="Sin edificio seleccionado"
            description="Elige uno para ver sus apartamentos."
          />
          <CoinsCardContent className="space-y-4">
            <div className="text-sm/6">
              Edificios disponibles:{" "}
              <span className="font-medium">{buildings.length}</span>
            </div>
          </CoinsCardContent>
        </CoinsCard>
      ) : null}

      {!error && selectedBuilding ? (
        <div className="space-y-6">
          {apartmentsError ? (
            <div className="text-sm/6 text-danger-subtle-fg rounded-md bg-danger/10 p-4">
              {apartmentsError}
            </div>
          ) : null}

          <CoinsCard>
            <CoinsCardHeader
              title={`Apartamentos de ${selectedBuilding.name}`}
              description={`Total: ${apartments.length} apartamento${apartments.length !== 1 ? 's' : ''}`}
            />
            <CoinsCardContent>
              <CoinsTable
                ariaLabel="Lista de apartamentos"
                columns={columns}
                actions={actions}
                items={apartments}
                emptyState="No hay apartamentos registrados"
                loadingKey="apartments"
              />
            </CoinsCardContent>
          </CoinsCard>
        </div>
      ) : null}
    </Container>
  );
}
