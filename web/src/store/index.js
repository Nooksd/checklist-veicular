// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slicers/authSlicer";
import userReducer from "./slicers/userSlicer";
import employeeReducer from "./slicers/employeeSlicer";
import carReducer from "./slicers/carSlicer";
import carEntryReducer from "./slicers/carEntrySlicer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    employee: employeeReducer,
    car: carReducer,
    carEntry: carEntryReducer,
  },
});

export default store;
