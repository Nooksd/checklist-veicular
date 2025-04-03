import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slicers/authSlicer";
import userReducer from "./slicers/userSlicer";
import carReducer from "./slicers/carSlicer";
import carEntryReducer from "./slicers/carEntrySlicer";
import formsReducer from "./slicers/formsSlicer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    car: carReducer,
    carEntry: carEntryReducer,
    forms: formsReducer,
  },
});

export default store;
