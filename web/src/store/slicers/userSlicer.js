import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { formsApi } from "@/services/http";

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, thunkAPI) => {
    try {
      const response = await formsApi.post("/user/create", userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getUser = createAsyncThunk(
  "user/getUser",
  async (userId, thunkAPI) => {
    try {
      const response = await formsApi.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getUsers = createAsyncThunk(
  "user/getUsers",
  async (query, thunkAPI) => {
    try {
      const response = await formsApi.get("/user/" + query);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (userData, thunkAPI) => {
    try {
      const response = await formsApi.put(
        `/user/update/${userData.id}`,
        userData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, thunkAPI) => {
    try {
      const response = await formsApi.delete(`/user/delete/${userId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const enableUser = createAsyncThunk(
  "user/enableUser",
  async (userId, thunkAPI) => {
    try {
      const response = await formsApi.put(`/user/enable/${userId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const disableUser = createAsyncThunk(
  "user/disableUser",
  async (userId, thunkAPI) => {
    try {
      const response = await formsApi.put(`/user/disable/${userId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {},
    users: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(getUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(getUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload || [];
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(deleteUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = state.users.filter(
          (user) => user.id !== action.payload.id
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(enableUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(enableUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = state.users.map((user) => {
          if (user.id === action.payload.id) {
            return { ...user, isActive: true };
          }
          return user;
        });
      })
      .addCase(enableUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      .addCase(disableUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(disableUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = state.users.map((user) => {
          if (user.id === action.payload.id) {
            return { ...user, isActive: false };
          }
          return user;
        });
      })
      .addCase(disableUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
