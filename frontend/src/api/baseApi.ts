import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5001/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  console.log("Executing API call:", args);
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    console.log("401 error detected. Refresh token:", refreshToken);

    if (!refreshToken || refreshToken === "") {
      console.log("No valid refresh token.");
      return { error: { status: 401, data: "No valid refresh token" } };
    }

    console.log("Attempting token refresh with:", refreshToken);
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string };
      console.log("Refresh successful. New access token:", accessToken);
      const retryArgs =
        typeof args === "string"
          ? args
          : {
              ...args,
              headers: {
                ...args.headers,
                Authorization: `Bearer ${accessToken}`,
              },
            };
      result = await baseQuery(retryArgs, api, extraOptions);
    } else {
      console.log("Refresh failed:", refreshResult.error);
      return { error: { status: 401, data: "Refresh token invalid" } };
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
