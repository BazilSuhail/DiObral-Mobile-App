import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProductList = () => {
    const navigation = useNavigation();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubcategory, setSelectedSubcategory] = useState('All');
    const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${REACT_APP_API_BASE_URL}/fetchproducts/products`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
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

    const excludedCategories = ['Fitness Wear', 'Sports Wear', 'Gym Wear'];

    return (
        <ScrollView className="bg-white">
            {/* Category filter */}
            <View className="my-2 mx-3">
                <View className="flex flex-row flex-wrap gap-2">
                    <TouchableOpacity onPress={() => handleCategoryClick('All')} className={`px-3 py-1 rounded ${selectedCategory === 'All' ? 'bg-red-900 text-white' : 'bg-red-100'}`}>
                        <Text>All Categories</Text>
                    </TouchableOpacity>
                    {categories
                        .filter(category => !excludedCategories.includes(category.name))
                        .map(category => (
                            <TouchableOpacity
                                key={category._id}
                                onPress={() => handleCategoryClick(category.name)}
                                className={`px-3 py-1 rounded ${selectedCategory === category.name ? 'bg-red-900 text-white' : 'bg-red-100'}`}
                            >
                                <Text>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                </View>
            </View>

            {selectedCategory !== 'All' && (
                <View className="my-2 mx-3">
                    <View className="flex flex-row flex-wrap gap-2">
                        <TouchableOpacity onPress={() => handleSubcategoryClick('All')} style={tailwind(`px-3 py-1 rounded ${selectedSubcategory === 'All' ? 'bg-red-900 text-white' : 'bg-red-100'}`)}>
                            <Text>All Subcategories</Text>
                        </TouchableOpacity>
                        {subcategories.map(subcategory => (
                            <TouchableOpacity
                                key={subcategory._id}
                                onPress={() => handleSubcategoryClick(subcategory.name)}
                                style={tailwind(`px-3 py-1 rounded ${selectedSubcategory === subcategory.name ? 'bg-red-900 text-white' : 'bg-red-100'}`)}
                            >
                                <Text>{subcategory.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Product list */}
            <View className="mx-2 my-4">
                <View className="flex flex-row flex-wrap">
                    {filteredProducts.map((product) => {
                        const discountedPrice = product.sale
                            ? (product.price - (product.price * product.sale) / 100).toFixed(2)
                            : product.price.toFixed(2);

                        return (
                            <TouchableOpacity
                                key={product._id}
                                onPress={() => handleProductClick(product._id)}
                                className="p-2 bg-white border border-gray-300 rounded mb-4 mr-2 w-1/2"
                            >
                                <Image
                                    source={{ uri: `${REACT_APP_API_BASE_URL}/uploads/${product.image}` }}
                                    className="h-48 w-full object-cover mb-2"
                                />
                                <Text className="text-lg font-medium text-red-900">
                                    {product.name.length > 22 ? `${product.name.substring(0, 22)}...` : product.name}
                                </Text>
                                <View className="flex flex-row justify-between items-center mt-2">
                                    {product.sale && (
                                        <Text className="text-red-500 line-through text-sm">Rs.{product.price.toFixed(2)}</Text>
                                    )}
                                    <Text className="text-lg font-medium">"Rs.{parseInt(discountedPrice)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
};

export default ProductList;
