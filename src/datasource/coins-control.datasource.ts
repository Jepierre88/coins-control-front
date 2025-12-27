"use server"
import { createMainApi, mainApi } from "@/lib/axios-instance";
import { ActionResponseEntity } from "@/types/action-response.entity";
import { Building } from "@/types/auth-types.entity";

export type BuildingDashboardMetrics = {
    apartmentsCount: number;
    schedulingsCount: number;
    range: { startDatetime: string; endDatetime: string };
};

export type MonthlyCountItem = { month: string; count: number };

export type MonthlyCountsResponse = {
    items: MonthlyCountItem[];
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

function monthKey(year: number, month: number) {
    return `${year}-${String(month).padStart(2, "0")}`;
}

function parseMonthString(month: string): { year: number; month: number } {
    const [y, m] = (month ?? "").split("-").map((v) => Number(v));
    if (!y || !m || m < 1 || m > 12) {
        throw new Error("Invalid month format. Expected YYYY-MM");
    }
    return { year: y, month: m };
}

function expandMonthRange(startMonth: string, endMonth: string): string[] {
    const start = parseMonthString(startMonth);
    const end = parseMonthString(endMonth);

    const startIndex = start.year * 12 + (start.month - 1);
    const endIndex = end.year * 12 + (end.month - 1);
    if (endIndex < startIndex) {
        throw new Error("endMonth must be >= startMonth");
    }

    const months: string[] = [];
    for (let idx = startIndex; idx <= endIndex; idx++) {
        const y = Math.floor(idx / 12);
        const m = (idx % 12) + 1;
        months.push(monthKey(y, m));
    }

    return months;
}

export async function getSchedulingsMonthlyCounts(args: {
    buildingId: string | number;
    year?: number;
    startMonth?: string;
    endMonth?: string;
    maxMonths?: number;
}, externalToken?: string): Promise<ActionResponseEntity<MonthlyCountsResponse>> {
    try {
        const maxMonths = args.maxMonths ?? 24;

        const startMonth =
            typeof args.year === "number" ? monthKey(args.year, 1) : args.startMonth;
        const endMonth =
            typeof args.year === "number" ? monthKey(args.year, 12) : args.endMonth;

        if (!startMonth || !endMonth) {
            return {
                success: false,
                message: "Debes enviar year o startMonth y endMonth",
            };
        }

        const months = expandMonthRange(startMonth, endMonth);
        if (months.length > maxMonths) {
            return {
                success: false,
                message: `El rango es muy grande (${months.length} meses). Reduce el rango o aumenta maxMonths.`,
            };
        }

        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        const items = await Promise.all(
            months.map(async (month) => {
                const range = monthToUtcRange(month);
                const response = await api.get<{ count: number }>(`/schedulings/count`, {
                    params: {
                        where: {
                            buildingId: Number(args.buildingId),
                            start: {
                                between: [range.startDatetime, range.endDatetime],
                            },
                        },
                    },
                });
                return { month, count: response.data.count ?? 0 } satisfies MonthlyCountItem;
            }),
        );

        const startRange = monthToUtcRange(months[0]);
        const endRange = monthToUtcRange(months[months.length - 1]);

        return {
            success: true,
            message: "Conteos mensuales obtenidos con éxito",
            data: {
                items,
                range: { startDatetime: startRange.startDatetime, endDatetime: endRange.endDatetime },
            },
        };
    } catch {
        return {
            success: false,
            message: "No se pudieron obtener los conteos mensuales.",
        };
    }
}