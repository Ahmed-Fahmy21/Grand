import React from 'react';
import { ScrollView } from 'react-native';
import HeaderSection from '../components/HeaderSection';
import InfoSection from '../components/InfoSection';
import RoomsSection from '../components/RoomsSection';
import ServicesSection from '../components/ServicesSection';
import ReviewsSection from '../components/ReviewsSection';
import AddReviewSection from '../components/AddReviewSection';

export default function Home() {
  return (
    <ScrollView>
      <HeaderSection />
      <ServicesSection />
      <InfoSection />
      <RoomsSection />
      
      <ReviewsSection />
    </ScrollView>
  );
}