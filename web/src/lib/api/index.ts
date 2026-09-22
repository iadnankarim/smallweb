import { createHttpApi } from "./http";
import { createMockApi } from "./mock";
import type { SmallWebApi } from "./contract";

export { ApiError, type SmallWebApi } from "./contract";

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const api: SmallWebApi = baseUrl ? createHttpApi(baseUrl) : createMockApi();
export const usingMock = !baseUrl;
