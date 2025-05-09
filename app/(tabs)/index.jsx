import React from 'react';
import { FlatList } from 'react-native';
import HeaderSection from '../../components/HeaderSection';
import InfoSection from '../../components/InfoSection';
import RoomsSection from '../../components/RoomsSection';
import ServicesSection from '../../components/ServicesSection';
import ReviewsSection from '../../components/ReviewsSection';

export default function Home() {
  const dummyData = [];

  return (
    <FlatList
      data={dummyData}
      keyExtractor={(item, index) => index.toString()}
      renderItem={null}
      ListHeaderComponent={
        <>
      <HeaderSection />
      <ServicesSection />
      <InfoSection />
      <RoomsSection />
      <ReviewsSection />
        </>
      }
    />
  );
}
