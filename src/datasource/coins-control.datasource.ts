"use server"

import { createMainApi, mainApi } from "@/lib/axios-instance";
import { ActionResponseEntity } from "@/types/action-response.entity";
import { Building } from "@/types/auth-types.entity";
import { addCustomPassCode } from "@/datasource/sciener.datasource";
import { generateKeyboardPwd } from "@/lib/sciener/sciener-utils";

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

export type ApartmentSchedulingCount = {
    apartmentId: number;
    apartmentName: string;
    count: number;
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

export async function getSchedulingAccessDataById(
    schedulingId: number,
    externalToken?: string
): Promise<ActionResponseEntity<{ code?: string; qr?: string }>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        // Include the related QR in the response
        const response = await api.get<any>(`/schedulings/${schedulingId}`, {
            params: {
                filter: { include: ["qr"] },
            },
        });
        const scheduling = response.data;
        return {
            success: true,
            message: "Datos de acceso obtenidos con éxito",
            data: {
                code: scheduling.keyboardPwd,
                qr: scheduling.qr?.code,
            },
        };
    } catch {
        return {
            success: false,
            message: "No se pudieron obtener los datos de acceso.",
        };
    }
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

export async function getSchedulingsByApartmentForMonth(args: {
    buildingId: string | number;
    month: string;
}, externalToken?: string): Promise<ActionResponseEntity<ApartmentSchedulingCount[]>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        const range = monthToUtcRange(args.month);

        // Obtener todos los apartamentos del edificio
        const apartmentsRes = await getApartmentsByBuildingId(args.buildingId, externalToken);
        if (!apartmentsRes.success || !apartmentsRes.data) {
            return {
                success: false,
                message: "No se pudieron obtener los apartamentos.",
                data: [],
            };
        }

        // Obtener el conteo de agendamientos para cada apartamento
        const counts = await Promise.all(
            apartmentsRes.data.map(async (apartment) => {
                const response = await api.get<{ count: number }>(`/schedulings/count`, {
                    params: {
                        where: {
                            buildingId: Number(args.buildingId),
                            apartmentId: apartment.id,
                            start: {
                                between: [range.startDatetime, range.endDatetime],
                            },
                        },
                    },
                });

                return {
                    apartmentId: apartment.id ?? 0,
                    apartmentName: apartment.name ?? `Apto ${apartment.id}`,
                    count: response.data.count ?? 0,
                } satisfies ApartmentSchedulingCount;
            })
        );

        // Filtrar apartamentos sin agendamientos y ordenar por cantidad
        const filtered = counts.filter(c => c.count > 0).sort((a, b) => b.count - a.count);

        return {
            success: true,
            message: "Agendamientos por apartamento obtenidos con éxito",
            data: filtered,
        };
    } catch {
        return {
            success: false,
            message: "No se pudieron obtener los agendamientos por apartamento.",
            data: [],
        };
    }
}

export type ApartmentListItem = {
    id: number;
    name: string;
    address?: string | null;
    description?: string | null;
    state: boolean;
    isActive: boolean;
    buildingId: number;
    staysId?: string | null;
    useDigitCode: boolean;
    useQRCode: boolean;
};

export async function getApartmentsByBuildingId(
    buildingId: string | number,
    externalToken?: string,
): Promise<ActionResponseEntity<ApartmentListItem[]>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        const response = await api.get<ApartmentListItem[]>(`/apartments`, {
            params: {
                filter: {
                    where: { buildingId: Number(buildingId) },
                    order: ["name ASC"],
                },
            },
        });

        return {
            success: true,
            message: "Apartamentos obtenidos con éxito",
            data: response.data,
        };
    } catch {
        return {
            success: false,
            message: "No se pudieron obtener los apartamentos.",
            data: [],
        };
    }
}

export type SchedulingListItem = {
    id?: number;
    start?: string;
    end?: string;
    state?: string;
    name?: string;
    lastName?: string;
    apartmentId?: number;
    buildingId?: number;
    apartment?: { id?: number; name?: string };
};

export type SchedulingRequirements = {
    buildingId: number;
    apartmentId: number;
    accessTokenSmartLocker?: string;
    clientId?: string | number;
    lockId?: string | number;
};

export async function getSchedulingRequirements(
    args: { buildingId: string | number; apartmentId: string | number },
    externalToken?: string,
): Promise<ActionResponseEntity<SchedulingRequirements>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        const response = await api.post<SchedulingRequirements>(`/scheduling-requirements`, {
            buildingId: Number(args.buildingId),
            apartmentId: Number(args.apartmentId),
        });

        return {
            success: true,
            message: "Requisitos de agendamiento obtenidos con éxito",
            data: response.data,
        };
    } catch {
        return {
            success: false,
            message: "No se pudieron obtener los requisitos de la chapa.",
        };
    }
}

export type CreateSchedulingArgs = {
    buildingId: string | number;
    apartmentId: string | number;
    startDatetime: string; // ISO
    endDatetime: string; // ISO

    name: string;
    lastName: string;
    identificationNumber: string;
    email: string;
    cellPhoneNumber?: string;

    createdBy?: string;

    keyboardPwd?: string;
    keyboardPwdId?: string | number;
};

export async function createScheduling(
    args: CreateSchedulingArgs,
    externalToken?: string,
): Promise<ActionResponseEntity<SchedulingListItem>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;
        const payload: any = {
            datetime: new Date().toISOString(),
            start: args.startDatetime,
            end: args.endDatetime,
            title: "Agendamiento apartamento",
            state: "Created",
            type: "Agendamiento",
            name: args.name.toLocaleUpperCase(),
            lastName: args.lastName.toLocaleUpperCase(),
            cellPhoneNumber: args.cellPhoneNumber ?? "",
            typeIdentificationDocument: "CC",
            identificationNumber: args.identificationNumber,
            keyboardPwd: args.keyboardPwd ? String(args.keyboardPwd) : "",
            keyboardPwdId: args.keyboardPwdId ? String(args.keyboardPwdId) : "",
            email: args.email,
            createdBy: args.createdBy ?? "",
            apartmentId: Number(args.apartmentId),
            buildingId: Number(args.buildingId),
        };

        const response = await api.post<SchedulingListItem>(`/schedulings`, payload);
        return {
            success: true,
            message: "Agendamiento creado con éxito",
            data: response.data,
        };
    } catch {
        return {
            success: false,
            message: "No se pudo crear el agendamiento.",
        };
    }
}

export type GenerateApartmentSchedulingArgs = Omit<CreateSchedulingArgs, "keyboardPwd" | "keyboardPwdId">;

export async function generateApartmentScheduling(
    args: GenerateApartmentSchedulingArgs,
    externalToken?: string,
): Promise<ActionResponseEntity<{ schedulingId: number; keyboardPwd?: string }>> {
    try {
        const reqRes = await getSchedulingRequirements(
            { buildingId: args.buildingId, apartmentId: args.apartmentId },
            externalToken,
        );

        if (!reqRes.success || !reqRes.data) {
            return {
                success: false,
                message: reqRes.message || "No se pudieron obtener los requisitos de la chapa.",
            };
        }

        const lockId = reqRes.data.lockId;
        const clientId = reqRes.data.clientId;
        const accessTokenSmartLocker = reqRes.data.accessTokenSmartLocker;

        let keyboardPwdId: string | number | undefined;
        let keyboardPwd: string | undefined;

        // If there is an associated lock, generate and register a passcode in Sciener.
        if (lockId && String(lockId).trim() !== "") {
            if (!clientId || !accessTokenSmartLocker) {
                return {
                    success: false,
                    message: "La configuración de la chapa está incompleta.",
                };
            }

            keyboardPwd = generateKeyboardPwd(6);

            const passcodeRes = await addCustomPassCode({
                clientId,
                accessToken: accessTokenSmartLocker,
                lockId,
                keyboardPwd: keyboardPwd,
                keyboardPwdName: args.identificationNumber,
                startDate: args.startDatetime,
                endDate: args.endDatetime,
            });

            if ((passcodeRes as any)?.errcode) {
                return {
                    success: false,
                    message: "Ups, la chapa presenta dificultades. Comunícate con soporte.",
                };
            }

            keyboardPwdId = passcodeRes.keyboardPwdId;
        }

        const createRes = await createScheduling(
            {
                ...args,
                keyboardPwd,
                keyboardPwdId,
            },
            externalToken,
        );

        if (!createRes.success || !createRes.data?.id) {
            return {
                success: false,
                message: createRes.message || "No se pudo crear el agendamiento.",
            };
        }

        return {
            success: true,
            message: "Agendamiento creado con éxito",
            data: {
                schedulingId: Number(createRes.data.id),
                keyboardPwd,
            },
        };
    } catch {
        return {
            success: false,
            message: "No se pudo generar el agendamiento.",
        };
    }
}

export type GetSchedulingsPageArgs = {
    buildingId: string | number;
    page: number;
    pageSize: number;
    apartmentId?: string | number;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    state?: string;
    guestName?: string;
};

export type PaginatedResponse<T> = {
    items: T[];
    total: number;
};

function dateOnlyToUtcStart(dateOnly: string) {
    return new Date(`${dateOnly}T00:00:00.000Z`).toISOString();
}

function dateOnlyToUtcEnd(dateOnly: string) {
    return new Date(`${dateOnly}T23:59:59.999Z`).toISOString();
}

export async function getSchedulingsPage(
    args: GetSchedulingsPageArgs,
    externalToken?: string,
): Promise<ActionResponseEntity<PaginatedResponse<SchedulingListItem>>> {
    try {
        const api = externalToken ? createMainApi({ externalToken }) : mainApi;

        const pageSize = Math.max(1, Math.floor(args.pageSize || 20));
        const page = Math.max(1, Math.floor(args.page || 1));
        const skip = (page - 1) * pageSize;

        const where: any = {
            buildingId: Number(args.buildingId),
        };

        if (args.apartmentId) {
            where.apartmentId = Number(args.apartmentId);
        }
        if (args.state) {
            const raw = String(args.state);
            const lower = raw.toLowerCase();

            // Scheduling.state is a free-form string in the backend model.
            // Match common variants/casings so the UI select works reliably.
            const variants = new Set<string>([raw, lower]);
            variants.add(lower.charAt(0).toUpperCase() + lower.slice(1));

            if (lower === "pendingtoactivate") {
                variants.add("pendingToActivate");
                variants.add("PendingToActivate");
            }
            if (lower === "canceled" || lower === "cancelled") {
                variants.add("canceled");
                variants.add("CANCELED");
                variants.add("Canceled");
                variants.add("cancelled");
                variants.add("CANCELLED");
                variants.add("Cancelled");
            }

            where.state = { inq: Array.from(variants) };
        }
        if (args.startDate && args.endDate) {
            where.start = {
                between: [dateOnlyToUtcStart(args.startDate), dateOnlyToUtcEnd(args.endDate)],
            };
        } else if (args.startDate) {
            where.start = {
                gte: dateOnlyToUtcStart(args.startDate),
            };
        } else if (args.endDate) {
            where.start = {
                lte: dateOnlyToUtcEnd(args.endDate),
            };
        }
        if (args.guestName && args.guestName.trim()) {
            // Case-insensitive partial match on name or lastName
            const like = { like: `%${args.guestName.trim()}%`, options: 'i' };
            where.or = [
                { name: like },
                { lastName: like },
            ];
        }

        const [countRes, listRes] = await Promise.all([
            api.get<{ count: number }>(`/schedulings/count`, { params: { where } }),
            api.get<SchedulingListItem[]>(`/schedulings`, {
                params: {
                    filter: {
                        where,
                        order: ["start DESC"],
                        limit: pageSize,
                        skip,
                        include: [{ relation: "apartment" }],
                    },
                },
            }),
        ]);

        return {
            success: true,
            message: "Agendamientos obtenidos con éxito",
            data: {
                total: countRes.data.count ?? 0,
                items: listRes.data ?? [],
            },
        };
    } catch {
        return {
            success: false,
            message: "No se pudieron obtener los agendamientos.",
            data: { total: 0, items: [] },
        };
    }
}