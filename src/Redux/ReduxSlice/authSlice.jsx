import { createSlice } from "@reduxjs/toolkit";
import { getProjectList, loginUser } from "./actions/authActions";

const initialState = {
    loginLoading: false,
    projectListLoading: false,
    usertype: '',
    phoneNo: '',
    username: '',
    userId: '',
    projectName: {},
    loginSuccess: false,
    loginData: {},
    loginError: '',
    projectListSuccess: false,
    projectListError: '',
    baseUrlIs: 'https://SustainOS.ai:9000/',
    menuBackground: '',
    pageName: '',
    userDetails: {  },
    menu: [],
};

const authSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        usertype: (state, action) => {
            state.usertype = action.payload;
        },
        phoneNo: (state, action) => {
            state.phoneNo = action.payload;
        },
        userDetails: (state, action) => {

            const { key, value } = action.payload;
            state.userDetails = {
                ...state.userDetails,
                [key]: value
            };
        },
        baseUrlIs: (state, action) => {
            state.baseUrlIs = action.payload;
        },
        menuBackground: (state, action) => {
            state.menuBackground = action.payload;
        },
        resetAuthState: (state) => {
            Object.assign(state, initialState);
        },
        clearAuthStates: (state) => {
            state.loginLoading = false;
            state.projectListLoading = false;
            state.loginSuccess = false;
            state.projectListSuccess = false;
            state.loginError = '';
            state.projectListError = '';
        },
        pageName: (state, action) => {
            state.pageName = action.payload;
        },
        menu: (state, action) => {
            state.menu = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loginLoading = true;
                state.loginError = '';
            })
            .addCase(loginUser.fulfilled, (state, { payload }) => {
                state.loginLoading = false;
                state.loginSuccess = true;
                state.loginData = payload;
                state.username = payload.user_name;
                state.userId = payload.user_id;
            })
            .addCase(loginUser.rejected, (state, { payload }) => {
                state.loginLoading = false;
                state.loginSuccess = false;
                state.loginError = payload;
            })

            .addCase(getProjectList.pending, (state) => {
                state.projectListLoading = true;
                state.projectListError = '';
            })
            .addCase(getProjectList.fulfilled, (state, { payload }) => {
                state.projectListLoading = false;
                state.projectListSuccess = true;
                state.projectName = payload;
            })
            .addCase(getProjectList.rejected, (state, { payload }) => {
                state.projectListLoading = false;
                state.projectListSuccess = false;
                state.projectListError = payload;
            });
    }
});

export const { usertype, phoneNo, userDetails, baseUrlIs,menu, menuBackground, resetAuthState, clearAuthStates,pageName } = authSlice.actions;

export default authSlice.reducer;