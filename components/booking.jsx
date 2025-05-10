import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


export const createBooking = async (bookingData) => {
    const bookingRef = await addDoc(collection(db, 'booking'), {
      ...bookingData,
      status: 'confirmed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: bookingRef.id,
      ...bookingData
    };
};