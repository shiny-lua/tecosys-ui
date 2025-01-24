import { getService, postService, deleteService } from "../service";

export const createApiKey = async (param: { expiration_days: number }) => {
    const { data } = await postService('/api_key/', param)
    return data
}

export const getApiKey = async () => {
    const { data } = await getService('/api_key/')
    return data
}

export const deleteApiKey = async (param: { api_key: string }) => {
    const { data } = await deleteService('/api_key/', param)
    return data
}
