import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import Entypo from '@expo/vector-icons/Entypo';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import config from '../../Config/Config';

const ReviewsList = ({ productId, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0); // State for review count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/product-reviews/reviews/${productId}`);
        setReviews(response.data.reviews);
        setReviewCount(response.data.reviews.length);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setReviews([]);
          setReviewCount(0);
        } else {
          setError('An error occurred while fetching reviews.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 4, reviews.length));
  };

  const handleCloseSheet = () => {
    bottomSheetRef.current?.close(); // Close the sheet
    setTimeout(() => onClose(), 200); // Delay calling onClose to avoid multiple calls
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['25%', '50%', '100%']} // Adjust snap points as requested
      onClose={handleCloseSheet}
      index={0} 
    >
      <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}> 
        <View className="flex-row px-3 justify-between items-center">
          <Text className="text-[22px] text-red-600 font-bold">
            {reviewCount} <Text className="text-[15px] text-red-400">{reviewCount === 1 ? 'Review' : 'Reviews'}</Text>
          </Text>
          <TouchableOpacity onPress={handleCloseSheet}>
            <Entypo name="cross" size={24} color="red" />
          </TouchableOpacity>
        </View>
        <View className="mt-[8px] w-[93%] h-[3px] bg-gray-300 mx-auto"></View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text className="text-center">{error}</Text>
        ) : reviews.length === 0 ? (
          <Text className="text-center mt-4">No reviews available.</Text>
        ) : (
          reviews.slice(0, visibleCount).map((review) => (
            <View key={review._id} className="mb-2 p-4 bg-white shadow-lg rounded-lg">
              <View className="flex-row justify-between">
                <Text className="text-2xl font-bold">{review.name}</Text>
                <View className="flex-row items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <FontAwesome
                      key={index}
                      name="star"
                      size={20}
                      color={index < review.rating ? '#FFD700' : '#D3D3D3'}
                    />
                  ))}
                </View>
              </View>

              <View className="flex-row items-center mt-[2px]">
                <FontAwesome name="envelope" size={15} color="gray" />
                <Text className="ml-2 text-gray-500">{review.email}</Text>
              </View>
              <Text className="mt-2 bg-gray-200 px-3 py-2 rounded-md text-gray-900">{review.description}</Text>
            </View>
          ))
        )}
        {visibleCount < reviews.length && (
          <TouchableOpacity
            onPress={handleShowMore}
            className="bg-red-800 py-[3px] w-[140px] ml-auto mr-4 px-4 rounded-md mt-1"
          >
            <Text className="text-white text-center text-[15px] font-semibold">Show More</Text>
          </TouchableOpacity>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default ReviewsList;
