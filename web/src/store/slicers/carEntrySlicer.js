import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formsApi } from "@/services/http";

export const fuelIn = createAsyncThunk(
  "car-entry/fuel",
  async (fuelData, thunkAPI) => {
    try {
      const response = await formsApi.post("/car-entry/fuel", fuelData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const checkIn = createAsyncThunk(
  "car-entry/start",
  async (checkInData, thunkAPI) => {
    try {
      const response = await formsApi.post("/car-entry/start", checkInData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const checkOut = createAsyncThunk(
  "car-entry/end",
  async (checkOutData, thunkAPI) => {
    try {
      const response = await formsApi.put("/car-entry/end", checkOutData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getCarEntry = createAsyncThunk(
  "car-entry/getCarEntry",
  async (entryId, thunkAPI) => {
    try {
      const response = await formsApi.get(`/car-entry/${entryId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getCarEntries = createAsyncThunk(
  "car-entry/getCarEntries",
  async (query, thunkAPI) => {
    try {
      const response = await formsApi.get("/car-entry/" + query);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteCarEntry = createAsyncThunk(
  "car-entry/delete",
  async (entryId, thunkAPI) => {
    try {
      const response = await formsApi.delete(`/car-entry/delete/${entryId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const postCheckInImages = createAsyncThunk(
  "car-entry/postCheckInImages",
  async ({ data, entryId }, thunkAPI) => {
    try {
      const response = await formsApi.post(
        `/car-entry/${entryId}/checkin/upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const postCheckOutImages = createAsyncThunk(
  "car-entry/postCheckOutImages",
  async ({ data, entryId }, thunkAPI) => {
    try {
      const response = await formsApi.post(
        `/car-entry/${entryId}/checkout/upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const carEntrySlice = createSlice({
  name: "carEntry",
  initialState: {
    carEntry: {},
    carEntries: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fuelIn.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fuelIn.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(fuelIn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(checkIn.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkIn.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(checkOut.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkOut.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(getCarEntry.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCarEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.carEntry = action.payload;
      })
      .addCase(getCarEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(getCarEntries.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCarEntries.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.carEntries = action.payload || [];
      })
      .addCase(getCarEntries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(deleteCarEntry.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCarEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.carEntries = state.carEntries.filter(
          (carEntry) => carEntry.id !== action.payload.id
        );
      })
      .addCase(deleteCarEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(postCheckInImages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(postCheckInImages.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(postCheckInImages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(postCheckOutImages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(postCheckOutImages.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(postCheckOutImages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default carEntrySlice.reducer;
