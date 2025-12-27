'use server'
import { createMainApi, mainApi } from "@/lib/axios-instance";
import { ActionResponseEntity } from "@/types/action-response.entity";
import { Building } from "@/types/auth-types.entity";

export type BuildingDashboardMetrics = {
    apartmentsCount: number;
    schedulingsCount: number;
    range: { startDatetime: string; endDatetime: string };
};

function monthToUtcRange(month: string): { startDatetime: string; endDatetime: string } {
    // month: YYYY-MM
    const [y, m] = month.split("-").map((v) => Number(v));
    if (!y || !m || m < 1 || m > 12) {
        throw new Error("Invalid month format. Expected YYYY-MM");
    }

    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    return { startDatetime: start.toISOString(), endDatetime: end.toISOString() };
}

export async function getBuildingsByHoldingId(
    holdingId: string,
    externalToken?: string,
): Promise<ActionResponseEntity<Building[]>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        const response = await api.get<Building[]>(`/buildings`, {
            params: {
                filter:{
                    where: {
                        holdingId: holdingId
                    }
                }
            }
        });
        return {
            success: true,
            message: "Edificios obtenidos con éxito",
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: "No se pudieron obtener los edificios.",
        };
    }
    
}

export async function getApartmentsCountByBuildingId(
    buildingId: string | number,
    externalToken?: string,
): Promise<ActionResponseEntity<number>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        const response = await api.get<{ count: number }>(`/apartments/count`, {
            params: {
                where: {
                    buildingId: Number(buildingId),
                },
            },
        });

        return {
            success: true,
            message: "Conteo de apartamentos obtenido con éxito",
            data: response.data.count ?? 0,
        };
    } catch {
        return {
            success: false,
            message: "No se pudo obtener el conteo de apartamentos.",
            data: 0,
        };
    }
}

export async function getSchedulingsCountByBuildingIdAndRange(
    args: { buildingId: string | number; startDatetime: string; endDatetime: string },
    externalToken?: string,
): Promise<ActionResponseEntity<number>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        const response = await api.get<{ count: number }>(`/schedulings/count`, {
            params: {
                where: {
                    buildingId: Number(args.buildingId),
                    start: {
                        between: [args.startDatetime, args.endDatetime],
                    },
                },
            },
        });

        return {
            success: true,
            message: "Conteo de agendamientos obtenido con éxito",
            data: response.data.count ?? 0,
        };
    } catch {
        return {
            success: false,
            message: "No se pudo obtener el conteo de agendamientos.",
            data: 0,
        };
    }
}

export async function getBuildingDashboardMetricsByMonth(
    args: { buildingId: string | number; month: string },
    externalToken?: string,
): Promise<ActionResponseEntity<BuildingDashboardMetrics>> {
    try {
        const range = monthToUtcRange(args.month);

        const [apartmentsRes, schedulingsRes] = await Promise.all([
            getApartmentsCountByBuildingId(args.buildingId, externalToken),
            getSchedulingsCountByBuildingIdAndRange({
                buildingId: args.buildingId,
                startDatetime: range.startDatetime,
                endDatetime: range.endDatetime,
            }, externalToken),
        ]);

        return {
            success: true,
            message: "Métricas obtenidas con éxito",
            data: {
                apartmentsCount: apartmentsRes.data ?? 0,
                schedulingsCount: schedulingsRes.data ?? 0,
                range,
            },
        };
    } catch {
        return {
            success: false,
            message: "No se pudieron obtener las métricas del dashboard.",
        };
    }
}