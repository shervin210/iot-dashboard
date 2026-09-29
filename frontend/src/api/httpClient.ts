import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
export class ApiError extends Error {
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, status?: number, cause?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cause = cause;
  }
}
class HttpClient {
  private readonly instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10_000,
      headers: { "Content-Type": "application/json" }
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data: body });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.request<T>(config);
      return response.data;
    } catch (error) {
      throw HttpClient.toApiError(error);
    }
  }

  private static toApiError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const status = axiosError.response?.status;
      const serverMessage = axiosError.response?.data?.error;
      if (axiosError.code === "ECONNABORTED") {
        return new ApiError("Request timed out", status, error);
      }
      if (!axiosError.response) {
        return new ApiError("Network error — could not reach the server", undefined, error);
      }
      return new ApiError(serverMessage ?? axiosError.message, status, error);
    }
    return new ApiError("Unexpected error", undefined, error);
  }
}

export const httpClient = new HttpClient("/api");
