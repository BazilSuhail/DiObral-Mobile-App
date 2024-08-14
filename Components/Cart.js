import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { removeFromCart, clearCart, updateQuantity } from '../redux/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, Text, Image, Button, FlatList, Alert } from 'react-native';

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
    <View className="flex-row items-center justify-between bg-red-50 border border-red-700 rounded-xl p-4 mb-4">
      <Image
        source={{ uri: `${REACT_APP_API_BASE_URL}/uploads/${product.image}` }}
        style={{ width: 100, height: 120, borderRadius: 8 }}
      />
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold underline">{product.name}</Text>
          <Button title="Remove" onPress={onRemove} color="#F87171" />
        </View>
        <View className="flex-row items-center mb-2">
          <Text className="font-medium text-red-950 mr-2">Item Price:</Text>
          {product.sale && <Text className="text-red-600 line-through">${product.price}</Text>}
          <Text className="font-bold">${discountedPrice}</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <Text className="font-medium text-red-950 mr-2">Size:</Text>
          <Text className="font-bold">{size}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Button title="-" onPress={onDecrease} color="#F87171" />
            <Text className="mx-2 text-lg font-bold">{quantity}</Text>
            <Button title="+" onPress={onIncrease} color="#F87171" />
          </View>
          <Text className="text-lg font-bold">
            Item Checkout: <Text className="bg-green-200 px-2 py-1 rounded border border-green-800">${(discountedPrice * quantity).toFixed(2)}</Text>
          </Text>
        </View>
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
    //navigation.navigate('OrderList');
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
    <View className="flex-1 pt-[45px] bg-gray-50">
      {cart.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="p-4 bg-red-100 border-2 border-red-700 rounded-xl text-xl text-red-600">
            Your cart is empty
          </Text>
        </View>
      ) : (
        <View className="p-4">
          <View className="flex-row justify-between">
            <Text className="text-2xl font-bold">Shopping Cart</Text>
            <View className="flex-row">
              <Button title="Clear Cart" onPress={handleClearCart} color="#F87171" />
              <View className="mx-2">
                <Button title="Save for Later" onPress={handleSaveCart} color="#3B82F6" />
              </View>
            </View>
          </View>

          <View className="border p-4 rounded-xl mt-4">
            <Text className="text-xl font-bold">Checkout</Text>
            <View className="border-t border-b border-gray-400 text-sm mt-4">
              <View className="flex-row justify-between py-2">
                <Text>Your Cart Subtotal:</Text>
                <Text className="text-xl font-bold">Rs.{calculateTotalBill()}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text>Discount Through Applied Sales:</Text>
                <Text className="text-xl font-bold">Rs.{calculateActualTotalBill()}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text>Delivery Charges (*On Delivery):</Text>
                <Text className="text-xl font-bold">Rs.200</Text>
              </View>
            </View>

            <View className="flex-row justify-between mt-4">
              <Text className="text-2xl font-bold">Rs.200</Text>
              <Button title="Checkout" onPress={navigateToOrderList} color="#16A34A" />
            </View>
          </View>

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
          />
        </View>
      )}
    </View>
  );
};

export default Cart;
