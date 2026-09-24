import { createSlice } from '@reduxjs/toolkit';
import { fetchLineChartData, captureChartImage, fetchMenuProjectDetails, fetchGroupMenuDetails } from './actions/componentActions';
const initialState = {
  traces: [],
  chartData: null,
  loading: false,
  noData: false,
  description: '',
  summaryLoading: false,
  errorMessage: null,
  menuProjectDetails: null,
  groupMenuDetails: [],
  menuLoading: false,
  menuError: null
};

const componentSlice = createSlice({
  name: 'chartComponent',
  initialState,
  reducers: {
    setTraces(state, action) {
      state.traces = action.payload;
    },
    resetChartState(state) {
      state.traces = [];
      state.chartData = null;
      state.loading = false;
      state.noData = false;
      state.description = '';
      state.errorMessage = null;
    },
    resetMenuState(state) {
      state.menuProjectDetails = null;
      state.groupMenuDetails = [];
      state.menuLoading = false;
      state.menuError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLineChartData.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(fetchLineChartData.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const hasData = payload && Object.keys(payload).length > 0;
        state.noData = !hasData;
        state.chartData = hasData ? payload.data || null : null;
      })
      .addCase(fetchLineChartData.rejected, (state, action) => {
        state.loading = false;
        state.noData = true;
        state.chartData = null;
        state.errorMessage = action.payload;
      })
      .addCase(captureChartImage.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(captureChartImage.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.description = action.payload;
      })
      .addCase(captureChartImage.rejected, (state, action) => {
        state.summaryLoading = false;
        state.errorMessage = action.payload;
      })
      .addCase(fetchMenuProjectDetails.pending, (state) => {
        state.menuLoading = true;
        state.menuError = null;
      })
      .addCase(fetchMenuProjectDetails.fulfilled, (state, action) => {
        state.menuLoading = false;
        state.menuProjectDetails = action.payload;
      })
      .addCase(fetchMenuProjectDetails.rejected, (state, action) => {
        state.menuLoading = false;
        state.menuError = action.payload;
      })
      .addCase(fetchGroupMenuDetails.pending, (state) => {
        state.menuLoading = true;
        state.menuError = null;
      })
      .addCase(fetchGroupMenuDetails.fulfilled, (state, action) => {
        state.menuLoading = false;
        state.groupMenuDetails = action.payload;
      })
      .addCase(fetchGroupMenuDetails.rejected, (state, action) => {
        state.menuLoading = false;
        state.menuError = action.payload;
      });
  }
});

export const { setTraces, resetChartState, resetMenuState } = componentSlice.actions;
export default componentSlice.reducer;