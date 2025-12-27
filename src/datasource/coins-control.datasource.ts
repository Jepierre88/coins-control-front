'use server'

import { createMainApi, mainApi } from "@/lib/axios-instance";
import { ActionResponseEntity } from "@/types/action-response.entity";
import { Building } from "@/types/auth-types.entity";

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