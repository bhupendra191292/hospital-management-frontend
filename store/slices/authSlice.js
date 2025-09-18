import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    doctor: null,
    role: null,
  },
  reducers: {
    setDoctor: (state, action) => {
      state.doctor = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    logoutDoctor: (state) => {
      state.token = null;
      state.doctor = null;
      state.role = null;
    },
  },
});

// ✅ Export the actions you use elsewhere
export const { setDoctor, setToken, setRole, logoutDoctor } = authSlice.actions;
export default authSlice.reducer;
