import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formsApi } from "@/services/http";

export const getStatistics = createAsyncThunk(
  "forms/getStatistics",
  async (_, thunkAPI) => {
    try {
      const response = await formsApi.get("/forms/statistics");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const formsSlice = createSlice({
  name: "forms",
  initialState: {
    statistics: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStatistics.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
        state.status = "succeeded";
      })
      .addCase(getStatistics.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default formsSlice.reducer;
