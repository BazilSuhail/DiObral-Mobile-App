import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProductList = () => {
    const navigation = useNavigation();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubcategory, setSelectedSubcategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${REACT_APP_API_BASE_URL}/fetchproducts/products`);
                setProducts(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${REACT_APP_API_BASE_URL}/category`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'All') {
            setSubcategories([]);
            return;
        }

        const fetchSubcategories = async () => {
            try {
                const response = await axios.get(`${REACT_APP_API_BASE_URL}/subcategories`);
                const filteredSubcategories = response.data.filter(subcat => subcat.category === selectedCategory);
                setSubcategories(filteredSubcategories);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
            }
        };

        fetchSubcategories();
    }, [selectedCategory]);

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text>Error: {error}</Text>;

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSubcategory = selectedSubcategory === 'All' || product.subcategory === selectedSubcategory;
        return matchesCategory && matchesSubcategory;
    });

    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
    };

    const handleSubcategoryClick = (subcategoryName) => {
        setSelectedSubcategory(subcategoryName);
    };

    const handleProductClick = (productId) => {
        navigation.navigate('ProductDetails', { id: productId });
    };

    const renderProductItem = ({ item }) => {
        const discountedPrice = item.sale
            ? (item.price - (item.price * item.sale) / 100).toFixed(2)
            : item.price.toFixed(2);

        return (
            <TouchableOpacity
                onPress={() => handleProductClick(item._id)}
                className="p-2 w-[180px] h-[340px] bg-white rounded-lg m-2 shadow-md"
            >
                <Image
                    source={{ uri: `${REACT_APP_API_BASE_URL}/uploads/${item.image}` }}
                    className="w-[160px] mx-auto h-[210px] object-cover rounded-lg mb-2"
                />
                <View className="p-2">
                    <Text className="text-md font-medium text-red-900">
                        {item.name.length > 22 ? `${item.name.substring(0, 32)}...` : item.name}
                    </Text>
                    <View className="flex-row justify-between">
                        {item.sale && (
                            <Text className="text-red-500 line-through text-[12px] my-2">
                                Rs.{parseInt(item.price)}
                            </Text>
                        )}
                        <Text className="text-xl font-medium">
                            <Text className="text-lg font-normal">Rs.</Text>{parseInt(discountedPrice)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 pt-[48px] bg-gray-200">
            {/* Category filter */}
            <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-2 mx-3">
                <View className="flex flex-row flex-wrap gap-2">
                    <TouchableOpacity onPress={() => handleCategoryClick('All')}>
                        <Text className={`px-3 py-1 rounded ${selectedCategory === 'All' ? 'bg-red-900 text-white' : 'bg-red-100'}`}>All Categories</Text>
                    </TouchableOpacity>
                    {categories
                        .map(category => (
                            <TouchableOpacity
                                key={category._id}
                                onPress={() => handleCategoryClick(category.name)}
                            >
                                <Text className={`px-3 py-1 rounded ${selectedCategory === category.name ? 'bg-red-900 text-white' : 'bg-red-100'}`}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                </View>
            </ScrollView>

            {selectedCategory !== 'All' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className=" mx-3">
                    <View className="flex flex-row flex-wrap gap-2">
                        <TouchableOpacity onPress={() => handleSubcategoryClick('All')} className={`px-3 py-1 rounded ${selectedSubcategory === 'All' ? 'bg-red-900 text-white' : 'bg-red-100'}`}>
                            <Text>All Subcategories</Text>
                        </TouchableOpacity>
                        {subcategories.map(subcategory => (
                            <TouchableOpacity
                                key={subcategory._id}
                                onPress={() => handleSubcategoryClick(subcategory.name)}
                                className={`px-3 py-1 rounded ${selectedSubcategory === subcategory.name ? 'bg-red-900 text-white' : 'bg-red-100'}`}
                            >
                                <Text>{subcategory.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}

           </View>
            {/* Product list */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle="px-2 py-5"
            />
        </View>
    );
};

export default ProductList;
