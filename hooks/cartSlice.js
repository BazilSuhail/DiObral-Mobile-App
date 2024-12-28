import { createSlice, createSelector } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Don't forget to import axios
import config from '@/Config/Config';

// Function to save cart state to AsyncStorage
const saveCartToAsyncStorage = async (cart) => {
    try {
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Failed to save cart to AsyncStorage', error);
    }
};

// Function to load cart state from AsyncStorage
const loadCartFromAsyncStorage = async () => {
    try {
        const cart = await AsyncStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Failed to load cart from AsyncStorage', error);
        return [];
    }
};

function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.id;
    } catch (err) {
        console.error('Failed to decode JWT:', err);
        throw err;
    }
}

// Function to check token validity and fetch cart 
const fetchCart = async (token) => {
    const userId = decodeJWT(token);
    console.log(userId);
    try {  
        const userId = decodeJWT(token);
        const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/cartState/cart/${userId}`); 
        return response.data.items || [];
    } 
    catch (error) {
        console.error('Failed to fetch cart', error);
        return [];
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: [], // Initialize state as an empty array
    reducers: {
        addToCart: (state, action) => {
            const { id, quantity, size } = action.payload;
            const existingProduct = state.find(item => item.id === id && item.size === size);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                state.push({ id, quantity, size });
            }
            saveCartToAsyncStorage(state); // Save updated state to AsyncStorage
        },
        removeFromCart: (state, action) => {
            const { id, size } = action.payload;
            const updatedCart = state.filter(item => item.id !== id || item.size !== size);
            saveCartToAsyncStorage(updatedCart); // Save updated state to AsyncStorage
            return updatedCart;
        },
        clearCart: () => {
            saveCartToAsyncStorage([]); // Save empty state to AsyncStorage
            return [];
        },
        updateQuantity: (state, action) => {
            const { id, quantity, size } = action.payload;
            const existingProduct = state.find(item => item.id === id && item.size === size);
            if (existingProduct) {
                existingProduct.quantity = quantity;
            }
            saveCartToAsyncStorage(state); // Save updated state to AsyncStorage
        },
        setCart: (state, action) => {
            saveCartToAsyncStorage(action.payload); // Save updated state to AsyncStorage
            return action.payload;
        },
    },
});

// Async thunk to initialize the cart state
export const initializeCart = () => async (dispatch) => {
    const token = await AsyncStorage.getItem('token'); // Load token from AsyncStorage
    if (token) {
        const cart = await fetchCart(token); // Fetch cart if token exists
        dispatch(setCart(cart));
    } else {
        const cart = await loadCartFromAsyncStorage(); // Load cart from AsyncStorage if no token
        dispatch(setCart(cart));
    }
};

// Function to check if a token is valid
const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = decodeJWT(token);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        return payload.exp > currentTime; // Token is valid if expiration time is in the future
    } catch (error) {
        return false;
    }
};
// Exported variable to check if the user is logged out
export const isUserLoggedOut = async () => {
    const token = await AsyncStorage.getItem('token');
    return !isTokenValid(token);
};

export const { addToCart, removeFromCart, clearCart, updateQuantity, setCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selector to get cart length
export const selectCartLength = createSelector(
    state => state.cart, // Selector function to get the cart state from Redux store
    cart => cart.length // Compute the length of the cart
);
