// slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('uduua_cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
  return [];
};

const initialState = {
  cartItems: loadCartFromStorage(),
  shippingAddress: {},
  paymentMethod: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);
      
      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product ? { ...item, quantity: x.quantity + item.quantity } : x
        );
      } else {
        state.cartItems.push(item);
      }
      
      // Save to localStorage
      localStorage.setItem('uduua_cart', JSON.stringify(state.cartItems));
      // Dispatch custom event for navbar
      window.dispatchEvent(new Event('cartUpdated'));
    },
    
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
      localStorage.setItem('uduua_cart', JSON.stringify(state.cartItems));
      window.dispatchEvent(new Event('cartUpdated'));
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((x) => x.product === id);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem('uduua_cart', JSON.stringify(state.cartItems));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    },
    
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('uduua_cart');
      window.dispatchEvent(new Event('cartUpdated'));
    },
    
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  saveShippingAddress,
  savePaymentMethod,
} = cartSlice.actions;

export default cartSlice.reducer;