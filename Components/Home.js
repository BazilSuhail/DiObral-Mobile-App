import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import REACT_APP_API_BASE_URL from '../Config/Config';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

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

  const renderProductRow = (rowProducts) => (
    <View className="flex-row justify-between">
      {rowProducts.map((item) => {
        const discountedPrice = item.sale
          ? (item.price - (item.price * item.sale) / 100).toFixed(2)
          : item.price.toFixed(2);

        return (
          <TouchableOpacity
            key={item._id}
            onPress={() => handlePress(item._id)}
            className="p-2 w-[48%] bg-white rounded-lg m-1 shadow-md"
          >
            <Image
              source={{ uri: `${REACT_APP_API_BASE_URL}/uploads/${item.image}` }}
              className="w-full h-[210px] object-cover rounded-lg mb-2"
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
      })}
    </View>
  );

  const rows = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(renderProductRow(products.slice(i, i + 2)));
  }

  return (
    <SafeAreaView className="flex-1 pt-[48px] px-3">
      <ScrollView>

        <View className="flex-row justify-between items-center  shadow-md">
          {/* Settings Icon */}
          <TouchableOpacity className="bg-red-900 rounded-full h-[40px] w-[40px] flex justify-center items-center">
            <FontAwesome name="cog" size={23} color="white" />
          </TouchableOpacity>

          {/* Address Text */}
          <View className="flex justify-center">
            <Text className="text-center text-[13px] text-gray-500 font-bold">Main Office</Text>
            <Text className="text-center text-[16px] font-medium">12th Street, Reiman Road</Text>
          </View>

          <TouchableOpacity className="bg-red-100 rounded-full h-[40px] w-[40px] flex justify-center items-center">
            <FontAwesome name="ellipsis-h" size={23} color="red" />
          </TouchableOpacity>
        </View>

        <View className="bg-gray-300 mt-[15px] flex-row justify-center items-center py-3 rounded-lg ">
          <FontAwesome name="search" size={19} color="#474747" />
          <Text className="font-medium text-search-color ml-[8px] text-[16px]">Search the Entire Catalog</Text>
        </View>

        <View className="bg-gray-900 mt-[15px] flex-row  items-center py-3 rounded-lg ">
          <FontAwesome name="search" size={19} color="#474747" />
          <Text className="font-medium text-gray-100 ml-[8px] text-[16px]">Delivery is</Text>
          <Text className="text-gray-700 bg-white rounded-[5px] px-1 font-bold ml-[8px] text-[16px]">50%</Text>
          <Text className="font-medium text-gray-100 ml-[8px] text-[16px]">Cheaper</Text>
        </View>

        <View className="flex-1 pt-[45px] ">
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {rows}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
