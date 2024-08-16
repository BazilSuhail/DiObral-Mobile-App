import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import REACT_APP_API_BASE_URL from '../Config/Config';
const ReviewsList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_BASE_URL}/product-reviews/reviews/${productId}`);
        setReviews(response.data.reviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 4, reviews.length));
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  const displayedReviews = reviews.slice(0, visibleCount);

  return (
    <ScrollView className="p-4">
      {reviews.length === 0 ? (
        <Text className="text-center">No reviews made till now. Make a review NOW!!!</Text>
      ) : (
        displayedReviews.map((review) => (
          <View key={review._id} className="mb-4 p-4 bg-white shadow-lg rounded-lg">
            <View className="flex-row justify-between">
              <Text className="text-xl font-bold">{review.name}</Text>
              <Text className="text-gray-500">{new Date(review.date).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <FontAwesome name="envelope" size={20} color="gray" />
              <Text className="ml-2 text-gray-500">{review.email}</Text>
            </View>
            <View className="flex-row items-center mt-4">
              <Text className="text-lg font-medium mr-2">Rating:</Text>
              {Array.from({ length: 5 }, (_, index) => (
                <FontAwesome
                  key={index}
                  name="star"
                  size={25}
                  color={index < review.rating ? '#FFD700' : '#D3D3D3'}
                />
              ))}
            </View>
            <Text className="mt-4 text-lg font-bold">Review:</Text>
            <Text className="mt-2 text-gray-700">{review.description}</Text>
          </View>
        ))
      )}
      {visibleCount < reviews.length && (
        <TouchableOpacity
          onPress={handleShowMore}
          className="bg-red-800 py-2 px-4 rounded-md mt-4"
        >
          <Text className="text-white text-center text-lg font-semibold">Show More</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default ReviewsList;
