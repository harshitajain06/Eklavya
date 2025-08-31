import { signOut as firebaseSignOut } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/Firebase';
import {
    bookingServices,
    notificationServices,
    ratingServices,
    realtimeServices,
    resourceServices,
    scribeServices,
    storageServices,
    userServices
} from '../config/firebaseServices';

export const useFirebase = () => {
  const [user, loading, error] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);

  // Clear errors when user changes
  useEffect(() => {
    setFirebaseError(null);
  }, [user]);

  // Generic error handler
  const handleError = useCallback((error, context = '') => {
    console.error(`Firebase Error in ${context}:`, error);
    setFirebaseError(error.message || 'An error occurred');
    return { success: false, error: error.message };
  }, []);

  // Generic loading wrapper
  const withLoading = useCallback(async (operation, context = '') => {
    setIsLoading(true);
    setFirebaseError(null);
    try {
      const result = await operation();
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return handleError(error, context);
    }
  }, [handleError]);

  // User Services
  const createUser = useCallback(async (userData) => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    return withLoading(
      () => userServices.createUser(user.uid, userData),
      'createUser'
    );
  }, [user, withLoading]);

  const getUser = useCallback(async (userId = user?.uid) => {
    if (!userId) return { success: false, error: 'User ID required' };
    return withLoading(
      () => userServices.getUser(userId),
      'getUser'
    );
  }, [user, withLoading]);

  const updateUser = useCallback(async (updates, userId = user?.uid) => {
    if (!userId) return { success: false, error: 'User ID required' };
    return withLoading(
      () => userServices.updateUser(userId, updates),
      'updateUser'
    );
  }, [user, withLoading]);

  const getUsersByRole = useCallback(async (role) => {
    return withLoading(
      () => userServices.getUsersByRole(role),
      'getUsersByRole'
    );
  }, [withLoading]);

  // Scribe Services
  const createScribeProfile = useCallback(async (scribeData) => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    return withLoading(
      () => scribeServices.createScribeProfile(user.uid, scribeData),
      'createScribeProfile'
    );
  }, [user, withLoading]);

  const getScribeProfile = useCallback(async (scribeId) => {
    return withLoading(
      () => scribeServices.getScribeProfile(scribeId),
      'getScribeProfile'
    );
  }, [withLoading]);

  const updateScribeProfile = useCallback(async (updates, scribeId = user?.uid) => {
    if (!scribeId) return { success: false, error: 'Scribe ID required' };
    return withLoading(
      () => scribeServices.updateScribeProfile(scribeId, updates),
      'updateScribeProfile'
    );
  }, [user, withLoading]);

  const searchScribes = useCallback(async (filters) => {
    return withLoading(
      () => scribeServices.searchScribes(filters),
      'searchScribes'
    );
  }, [withLoading]);

  const getNearbyScribes = useCallback(async (location, maxDistance) => {
    return withLoading(
      () => scribeServices.getNearbyScribes(location, maxDistance),
      'getNearbyScribes'
    );
  }, [withLoading]);

  // Booking Services
  const createBooking = useCallback(async (bookingData) => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    const fullBookingData = {
      ...bookingData,
      studentId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return withLoading(
      () => bookingServices.createBooking(fullBookingData),
      'createBooking'
    );
  }, [user, withLoading]);

  const getBooking = useCallback(async (bookingId) => {
    return withLoading(
      () => bookingServices.getBooking(bookingId),
      'getBooking'
    );
  }, [withLoading]);

  const updateBookingStatus = useCallback(async (bookingId, status, additionalData) => {
    return withLoading(
      () => bookingServices.updateBookingStatus(bookingId, status, additionalData),
      'updateBookingStatus'
    );
  }, [withLoading]);

  const getUserBookings = useCallback(async (role = 'student') => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    return withLoading(
      () => bookingServices.getUserBookings(user.uid, role),
      'getUserBookings'
    );
  }, [user, withLoading]);

  const getUpcomingBookings = useCallback(async (role = 'student') => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    return withLoading(
      () => bookingServices.getUpcomingBookings(user.uid, role),
      'getUpcomingBookings'
    );
  }, [user, withLoading]);

  // Resource Services
  const createResource = useCallback(async (resourceData) => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    const fullResourceData = {
      ...resourceData,
      createdBy: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return withLoading(
      () => resourceServices.createResource(fullResourceData),
      'createResource'
    );
  }, [user, withLoading]);

  const getAllResources = useCallback(async () => {
    return withLoading(
      () => resourceServices.getAllResources(),
      'getAllResources'
    );
  }, [withLoading]);

  const getResourcesByCategory = useCallback(async (category) => {
    return withLoading(
      () => resourceServices.getResourcesByCategory(category),
      'getResourcesByCategory'
    );
  }, [withLoading]);

  const updateResource = useCallback(async (resourceId, updates) => {
    return withLoading(
      () => resourceServices.updateResource(resourceId, updates),
      'updateResource'
    );
  }, [withLoading]);

  const deleteResource = useCallback(async (resourceId) => {
    return withLoading(
      () => resourceServices.deleteResource(resourceId),
      'deleteResource'
    );
  }, [withLoading]);

  // Storage Services
  const uploadFile = useCallback(async (file, path) => {
    return withLoading(
      () => storageServices.uploadFile(file, path),
      'uploadFile'
    );
  }, [withLoading]);

  const deleteFile = useCallback(async (path) => {
    return withLoading(
      () => storageServices.deleteFile(path),
      'deleteFile'
    );
  }, [withLoading]);

  // Rating Services
  const addRating = useCallback(async (bookingId, ratingData) => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    const fullRatingData = {
      ...ratingData,
      studentId: user.uid,
      createdAt: new Date()
    };
    return withLoading(
      () => ratingServices.addRating(bookingId, fullRatingData),
      'addRating'
    );
  }, [user, withLoading]);

  const getScribeRatings = useCallback(async (scribeId) => {
    return withLoading(
      () => ratingServices.getScribeRatings(scribeId),
      'getScribeRatings'
    );
  }, [withLoading]);

  // Notification Services
  const createNotification = useCallback(async (notificationData) => {
    return withLoading(
      () => notificationServices.createNotification(notificationData),
      'createNotification'
    );
  }, [withLoading]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    return withLoading(
      () => notificationServices.markNotificationAsRead(notificationId),
      'markNotificationAsRead'
    );
  }, [withLoading]);

  const getUserNotifications = useCallback(async (userId = user?.uid) => {
    if (!userId) return { success: false, error: 'User ID required' };
    return withLoading(
      () => notificationServices.getUserNotifications(userId),
      'getUserNotifications'
    );
  }, [user, withLoading]);

  // Real-time Services
  const listenToUserProfile = useCallback((userId, callback) => {
    if (!userId) return null;
    return realtimeServices.listenToUserProfile(userId, callback);
  }, []);

  const listenToUserBookings = useCallback((userId, role, callback) => {
    if (!userId) return null;
    return realtimeServices.listenToUserBookings(userId, role, callback);
  }, []);

  const listenToScribeAvailability = useCallback((scribeId, callback) => {
    if (!scribeId) return null;
    return realtimeServices.listenToScribeAvailability(scribeId, callback);
  }, []);

  // Utility functions
  const clearError = useCallback(() => {
    setFirebaseError(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return handleError(error, 'signOut');
    }
  }, [handleError]);

  const isAuthenticated = !!user && !loading;

  return {
    // State
    user,
    loading,
    error,
    isLoading,
    firebaseError,
    isAuthenticated,

    // User operations
    createUser,
    getUser,
    updateUser,
    getUsersByRole,

    // Scribe operations
    createScribeProfile,
    getScribeProfile,
    updateScribeProfile,
    searchScribes,
    getNearbyScribes,

    // Booking operations
    createBooking,
    getBooking,
    updateBookingStatus,
    getUserBookings,
    getUpcomingBookings,

    // Resource operations
    createResource,
    getAllResources,
    getResourcesByCategory,
    updateResource,
    deleteResource,

    // Storage operations
    uploadFile,
    deleteFile,

    // Rating operations
    addRating,
    getScribeRatings,

    // Notification operations
    createNotification,
    markNotificationAsRead,
    getUserNotifications,

    // Real-time operations
    listenToUserProfile,
    listenToUserBookings,
    listenToScribeAvailability,

    // Utility
    clearError,
    signOut
  };
};

export default useFirebase;
