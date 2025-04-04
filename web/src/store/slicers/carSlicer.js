import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formsApi } from "@/services/http";

export const createCar = createAsyncThunk(
  "car/createCar",
  async (carData, thunkAPI) => {
    try {
      const response = await formsApi.post("/car/create", carData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getCar = createAsyncThunk(
  "car/getCar",
  async (carId, thunkAPI) => {
    try {
      const response = await formsApi.get(`/car/${carId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getCars = createAsyncThunk(
  "car/getCars",
  async (query, thunkAPI) => {
    try {
      const response = await formsApi.get("/car/" + query);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateCar = createAsyncThunk(
  "car/updateCar",
  async (carData, thunkAPI) => {
    try {
      const response = await formsApi.put(
        `/car/update/${carData.id}`,
        carData.data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteCar = createAsyncThunk(
  "car/deleteCar",
  async (carId, thunkAPI) => {
    try {
      const response = await formsApi.delete(`/car/delete/${carId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const enableCar = createAsyncThunk(
  "car/enableCar",
  async (carId, thunkAPI) => {
    try {
      const response = await formsApi.put(`/car/enable/${carId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const disableCar = createAsyncThunk(
  "car/disableCar",
  async (carId, thunkAPI) => {
    try {
      const response = await formsApi.put(`/car/disable/${carId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const carSlice = createSlice({
  name: "car",
  initialState: {
    car: {},
    cars: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCar.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCar.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.car = action.payload;
        state.cars.push(action.payload);
      })
      .addCase(createCar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(getCar.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCar.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.car = action.payload;
      })
      .addCase(getCar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(getCars.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCars.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cars = action.payload ?? [];
      })
      .addCase(getCars.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(updateCar.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCar.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.car = action.payload;
        state.cars = state.cars.map((car) => {
          if (car.id === action.payload.id) {
            return action.payload;
          }
          return car;
        });
      })
      .addCase(updateCar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(deleteCar.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cars = state.cars.filter((car) => car.id !== action.payload.id);
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(enableCar.pending, (state) => {
        state.status = "loading";
      })
      .addCase(enableCar.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cars = state.cars.map((car) => {
          if (car.id === action.payload.id) {
            return { ...car, isActive: true };
          }
          return car;
        });
      })
      .addCase(enableCar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(disableCar.pending, (state) => {
        state.status = "loading";
      })
      .addCase(disableCar.fulfilled, (state) => {
        state.status = "succeeded";
        state.cars = state.cars.map((car) => {
          if (car.id === action.payload.id) {
            return { ...car, isActive: false };
          }
          return car;
        });
      })
      .addCase(disableCar.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default carSlice.reducer;
