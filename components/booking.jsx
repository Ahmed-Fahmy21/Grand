import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const createBooking = async (bookingData) => {
  try {
    const bookingRef = await addDoc(collection(db, 'booking'), {
      ...bookingData,
      bookingDate: serverTimestamp(),
      status: 'confirmed'
    });
    return bookingRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};