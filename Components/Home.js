import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_BASE_URL}/homeproducts`);
        setProducts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>Error: {error}</Text>;

  const handlePress = (productId) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const renderItem = ({ item }) => {
    const discountedPrice = item.sale
      ? (item.price - (item.price * item.sale) / 100).toFixed(2)
      : item.price.toFixed(2);

    return (
      <TouchableOpacity
        onPress={() => handlePress(item._id)}
        className="p-2 w-[180px] h-[340px] bg-white rounded-lg m-2 shadow-md"
      >
        <Image
          source={{ uri: `${REACT_APP_API_BASE_URL}/uploads/${item.image}` }}
          className="w-[160px] mx-auto h-[210px] object-cover rounded-lg mb-2"
        />
        <View className="p-2">
          <Text className="text-md font-medium text-red-900">
            {item.name.length > 22 ? `${item.name.substring(0, 15)}...` : item.name}
          </Text>
          {item.sale && (
            <Text className="text-red-500 line-through text-sm my-2">
              Rs.{item.price.toFixed(2)}
            </Text>
          )}
          <Text className="text-xl font-medium">
            <Text className="text-lg font-normal">Rs.</Text>{parseInt(discountedPrice)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 pt-[45px] bg-gray-200">
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle="px-2 py-5"
      />
    </View>
  );
};

export default Home;
