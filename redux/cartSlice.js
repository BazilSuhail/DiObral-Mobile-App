import { createSlice, createSelector } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const cart = await loadCartFromAsyncStorage();
    dispatch(setCart(cart));
};

export const { addToCart, removeFromCart, clearCart, updateQuantity, setCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selector to get cart length
export const selectCartLength = createSelector(
    state => state.cart, // Selector function to get the cart state from Redux store
    cart => cart.length // Compute the length of the cart
);