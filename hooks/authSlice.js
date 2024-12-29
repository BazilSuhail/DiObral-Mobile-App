import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

function checkTokenValidation(token) {
    try {
        if (!token) {
            console.error('No token provided');
            return false; // Return false if there is no token
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid token format');
            return false; // Return false for invalid token format
        }

        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        if (payload.exp && Date.now() >= payload.exp * 1000) {
            console.error('Token has expired');
            return false; // Return false if the token has expired
        }

        return true; // Return true if the token is valid
    } catch (err) {
        console.error('Failed to decode JWT:', err);
        return false; // Return false if an error occurs during decoding
    }
}

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        isLoggedIn: false,
    },
    reducers: {
        setToken: (state, action) => {
            const token = action.payload;
            state.token = token;
            console.log( state.token )
            state.isLoggedIn = checkTokenValidation(token);
            state.isLoggedIn = checkTokenValidation(token);
            console.log("seted = "+checkTokenValidation(token))
        },
        clearToken: (state) => {
            state.token = null;
            state.isLoggedIn = false;
        },
    },
});

export const { setToken, clearToken } = authSlice.actions;

export const initializeAuth = () => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            dispatch(setToken(token));
        }
    } catch (error) {
        console.error('Failed to initialize auth:', error);
    }
};

export default authSlice.reducer;