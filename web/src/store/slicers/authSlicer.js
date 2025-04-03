import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formsApi } from "@/services/http";

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, thunkAPI) => {
    try {
      const response = await formsApi.get("/auth/refresh-token");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await formsApi.post("/auth/login", userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const response = await formsApi.post("/auth/logout");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await formsApi.get("/user/current");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "succeeded";
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
