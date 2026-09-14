import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrlIs, menuBackground, userDetails } from '../authSlice';

const BASE_URL = "https://sustainos.ai:10000/global_master_app/api";
const LOGIN_URL = `${BASE_URL}/login_user/`;
const PROJECT_LIST_URL = `${BASE_URL}/project_list/`;

const formatDate = (dateString) => {
    if (!dateString) return dateString;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const formatDatesInProject = (project) => ({
    ...project,
    created_on: formatDate(project.created_on),
    modified_on: formatDate(project.modified_on),
});

export const loginUser = createAsyncThunk('login/loginUser', async (values, { rejectWithValue }) => {
    try {
        const fcmToken = await AsyncStorage.getItem('fcmtoken');
        const payload = {
            username: values.username,
            password: values.password,
            fcmtoken: fcmToken,
        };
        await AsyncStorage.setItem('email', values.username);
        const { data } = await axios.post(LOGIN_URL, payload, {
            headers: { "Content-Type": "application/json" }
        });
        await AsyncStorage.setItem('jwttoken', data.access_token);
        return data;
    } catch (error) {
        return rejectWithValue(error?.response?.data || error.message);
    }
});

export const getProjectList = createAsyncThunk('project/getProjectList', async (_, { rejectWithValue, dispatch }) => {
    try {
        const token = await AsyncStorage.getItem('jwttoken');
        const { data } = await axios.get(PROJECT_LIST_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(data) && data.length > 0) {
            const updatedProjects = data.map(formatDatesInProject);
            const firstProject = updatedProjects[0];
            await AsyncStorage.setItem('baseurl', firstProject.project_instance_url);
            dispatch(baseUrlIs(firstProject.project_instance_url));
            dispatch(menuBackground("#fff"));
            dispatch(userDetails({ key: "projectName", value: updatedProjects[0] }));
            return firstProject;
        }
        return rejectWithValue('No projects found');
    } catch (error) {
        return rejectWithValue(error?.response?.data || error.message);
    }
});