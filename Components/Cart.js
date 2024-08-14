import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { removeFromCart, clearCart, updateQuantity } from '../redux/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Entypo from '@expo/vector-icons/Entypo';
import { View, Text, Image, FlatList, Alert, TouchableOpacity } from 'react-native';

const CartItem = ({ id, size, quantity, onIncrease, onDecrease, onRemove }) => {
  const [product, setProduct] = useState(null);
  const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_BASE_URL}/fetchproducts/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return null;

  const discountedPrice = product.sale
    ? (product.price - (product.price * product.sale) / 100).toFixed(2)
    : product.price.toFixed(2);

  return (
    <View className="flex-row  items-center h-[160px] justify-between rounded-xl px-2">
      <Image
        source={{ uri: `${REACT_APP_API_BASE_URL}/uploads/${product.image}` }}
        style={{ width: 85, height: 110, borderRadius: 8 }}
      />
      <View className="flex-1 mt-[10px] ml-4">
        <View className="flex-row h-[55px] justify-between">
          <View className="w-[200px] h-full">
            <Text className="text-[16px] font-bold underline">{product.name}</Text>
          </View>
          <TouchableOpacity onPress={onRemove} className="w-[22px] bg-red-800 flex justify-center items-center h-[22px] rounded-md">
            <Entypo name="cross" size={22} color="white" />
          </TouchableOpacity>
        </View>
        {/*
        <View className="flex-row items-center mb-2">
          <Button title="Remove" onPress={onRemove} color="#F87171" />
          <Text className="font-medium text-red-950 mr-2">Price:</Text> 
          <Text className="font-bold">${discountedPrice}</Text>
        </View>
      */}
        <View className="flex-row items-center mb-2">
          <Text className="font-semibold underline text-red-950 mr-2">Selected Size:</Text>
          <Text className="font-bold px-2 bg-gray-500 text-white rounded-md">{size}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="py-1 rounded font-bold">$ {(discountedPrice * quantity).toFixed(2)}</Text>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onDecrease} className="bg-red-700 w-[25px] flex justify-center items-center h-[25px] rounded-full">
              <Text className="text-[28px] mt-[-8px] text-white">-</Text>
            </TouchableOpacity>
            <Text className="mx-2 text-lg font-bold">{quantity}</Text>
            <TouchableOpacity onPress={onIncrease} className="bg-red-700 w-[25px] flex justify-center items-center h-[25px] rounded-full">
              <Text className="text-[20px] mt-[-2px] text-white">+</Text>
            </TouchableOpacity>
            {/*<Button title="-" onPress={onDecrease} color="#F87171" />
            <Button title="+" onPress={onIncrease} color="#F87171" /> */}
          </View>
        </View>

        <View className="h-[3px] w-full mt-[8px] bg-gray-200 "></View>
      </View>
    </View>
  );
};

const Cart = () => {
  const cart = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();
  const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

  const parseJwt = (token) => {
    try {
      const [header, payload, signature] = token.split('.');
      const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
      const base64 = base64Url + (base64Url.length % 4 === 0 ? '' : '='.repeat(4 - (base64Url.length % 4)));
      const decodedPayload = atob(base64);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const decoded = parseJwt(token);
        setUserId(decoded?.id);
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productResponses = await Promise.all(
          cart.map(item => axios.get(`${REACT_APP_API_BASE_URL}/fetchproducts/products/${item.id}`))
        );
        setProducts(productResponses.map(response => response.data));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [cart]);

  const handleRemoveFromCart = (id, size) => {
    dispatch(removeFromCart({ id, size }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleIncreaseQuantity = (id, size) => {
    dispatch(updateQuantity({ id, quantity: getQuantity(id, size) + 1, size }));
  };

  const handleDecreaseQuantity = (id, size) => {
    dispatch(updateQuantity({ id, quantity: Math.max(getQuantity(id, size) - 1, 1), size }));
  };

  const getQuantity = (id, size) => {
    const item = cart.find(product => product.id === id && product.size === size);
    return item ? item.quantity : 1;
  };

  const navigateToOrderList = () => {
    navigation.navigate('OrderList');
  };

  const calculateTotalBill = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p._id === item.id);
      if (product) {
        const discountedPrice = product.sale
          ? (product.price - (product.price * product.sale) / 100)
          : product.price;
        return total + (discountedPrice * item.quantity);
      }
      return total;
    }, 0).toFixed(2);
  };

  const calculateActualTotalBill = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p._id === item.id);
      if (product) {
        return total + (product.price * item.quantity);
      }
      return total;
    }, 0).toFixed(2);
  };

  const handleSaveCart = async () => {
    try {
      await axios.post(`${REACT_APP_API_BASE_URL}/cartState/cart/save`, { userId, items: cart });
      Alert.alert('Cart saved successfully!');
    } catch (error) {
      console.error('Error saving cart:', error);
      Alert.alert('Failed to save cart.');
    }
  };


  return (
    <View className="flex-1 pt-[45px] bg-white">

      <View className="p-4">
        <Text className="text-2xl mb-1 font-bold">Shopping Cart</Text>
        <View className="bg-gray-300 mb-3 w-full h-[3px]"></View>

        {cart.length === 0 ? (
          <View className="flex mt-[30px] justify-center items-center">
            <Text className="px-4 py-2 bg-red-100 border-2 border-red-700 rounded-lg text-lg font-medium text-red-700">
              Your cart is empty
            </Text>
          </View>
        ) : (
          <View className="flex">
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={handleClearCart} className="bg-red-700 flex justify-center items-center rounded-lg  py-1 px-3">
                <Text className="text-[16px] font-medium text-white">Clear Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveCart} className="bg-blue-700  flex justify-center items-center rounded-lg py-1 px-3">
                <Text className="text-[16px] font-medium text-white">Buy Later</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={navigateToOrderList} className="bg-green-700  flex justify-center items-center rounded-lg py-1 px-3">
                <Text className="text-[16px] font-medium text-white">Checkout Cart</Text>
              </TouchableOpacity>
            </View>

            <View className="border border-gray-400 rounded-lg flex-row justify-between items-center px-3 mt-[10px] py-2">
              <Text>Your Cart Subtotal:</Text>
              <Text className="text-xl font-bold">Rs.{calculateTotalBill()}</Text>
            </View>
            <View className="h-[15px]"></View>
            <FlatList
              data={cart}
              renderItem={({ item }) => (
                <CartItem
                  id={item.id}
                  size={item.size}
                  quantity={item.quantity}
                  onIncrease={() => handleIncreaseQuantity(item.id, item.size)}
                  onDecrease={() => handleDecreaseQuantity(item.id, item.size)}
                  onRemove={() => handleRemoveFromCart(item.id, item.size)}
                />
              )}
              keyExtractor={(item) => `${item.id}-${item.size}`}
              style={{ maxHeight: 550 }} // Custom max height in pixels
              className="w-full" // Optional: ensure full width
            />

          </View>
        )}
      </View>
    </View>
  );
};

export default Cart;
