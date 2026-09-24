import { configureStore } from '@reduxjs/toolkit';
import authSlice from './ReduxSlice/authSlice';
import mainSlice from './ReduxSlice/mainSlice';
import componentSlice from './ReduxSlice/componentSlice';

const store = configureStore(
    {
        reducer: {
            authSlice: authSlice,
            mainSlice: mainSlice,
            componentSlice: componentSlice
        }
    }
)

export default store;