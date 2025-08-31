import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './Firebase';

// User Services
export const userServices = {
    async createUser(userId, userData) {
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                ...userData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, data: { id: userId, ...userData } };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    },

    async getUser(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                return { success: true, data: { id: userSnap.id, ...userSnap.data() } };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user:', error);
            return { success: false, error: error.message };
        }
    },

    async updateUser(userId, updates) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    },

    async getUsersByRole(role) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('role', '==', role));
            const querySnapshot = await getDocs(q);
            
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: users };
        } catch (error) {
            console.error('Error getting users by role:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteUser(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            await deleteDoc(userRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }
};

// Scribe Services
export const scribeServices = {
    async createScribeProfile(scribeId, scribeData) {
        try {
            const scribeRef = doc(db, 'scribes', scribeId);
            await setDoc(scribeRef, {
                ...scribeData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, data: { id: scribeId, ...scribeData } };
        } catch (error) {
            console.error('Error creating scribe profile:', error);
            return { success: false, error: error.message };
        }
    },

    async getScribeProfile(scribeId) {
        try {
            const scribeRef = doc(db, 'scribes', scribeId);
            const scribeSnap = await getDoc(scribeRef);
            
            if (scribeSnap.exists()) {
                return { success: true, data: { id: scribeSnap.id, ...scribeSnap.data() } };
            } else {
                return { success: false, error: 'Scribe profile not found' };
            }
        } catch (error) {
            console.error('Error getting scribe profile:', error);
            return { success: false, error: error.message };
        }
    },

    async updateScribeProfile(scribeId, updates) {
        try {
            const scribeRef = doc(db, 'scribes', scribeId);
            await updateDoc(scribeRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating scribe profile:', error);
            return { success: false, error: error.message };
        }
    },

    async getNearbyScribes(location, radius = 50) {
        try {
            const scribesRef = collection(db, 'scribes');
            const q = query(
                scribesRef,
                where('isAvailable', '==', true),
                orderBy('rating', 'desc'),
                limit(20)
            );
            const querySnapshot = await getDocs(q);
            
            const scribes = [];
            querySnapshot.forEach((doc) => {
                scribes.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: scribes };
        } catch (error) {
            console.error('Error getting nearby scribes:', error);
            return { success: false, error: error.message };
        }
    },

    async searchScribes(filters) {
        try {
            const scribesRef = collection(db, 'scribes');
            let q = query(scribesRef, where('isAvailable', '==', true));
            
            if (filters.language) {
                q = query(q, where('languages', 'array-contains', filters.language));
            }
            
            if (filters.subject) {
                q = query(q, where('subjects', 'array-contains', filters.subject));
            }
            
            const querySnapshot = await getDocs(q);
            
            const scribes = [];
            querySnapshot.forEach((doc) => {
                scribes.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: scribes };
        } catch (error) {
            console.error('Error searching scribes:', error);
            return { success: false, error: error.message };
        }
    }
};

// Booking Services
export const bookingServices = {
    async createBooking(bookingData) {
        try {
            const bookingRef = await addDoc(collection(db, 'bookings'), {
                ...bookingData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'pending'
            });
            return { success: true, data: { id: bookingRef.id, ...bookingData } };
        } catch (error) {
            console.error('Error creating booking:', error);
            return { success: false, error: error.message };
        }
    },

    async getBooking(bookingId) {
        try {
            const bookingRef = doc(db, 'bookings', bookingId);
            const bookingSnap = await getDoc(bookingRef);
            
            if (bookingSnap.exists()) {
                return { success: true, data: { id: bookingSnap.id, ...bookingSnap.data() } };
            } else {
                return { success: false, error: 'Booking not found' };
            }
        } catch (error) {
            console.error('Error getting booking:', error);
            return { success: false, error: error.message };
        }
    },

    async updateBooking(bookingId, updates) {
        try {
            const bookingRef = doc(db, 'bookings', bookingId);
            await updateDoc(bookingRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating booking:', error);
            return { success: false, error: error.message };
        }
    },

    async getUserBookings(userId, role = 'student') {
        try {
            const bookingsRef = collection(db, 'bookings');
            const field = role === 'scribe' ? 'scribeId' : 'studentId';
            
            // Try the optimized query first (requires composite index)
            try {
                const q = query(
                    bookingsRef,
                    where(field, '==', userId),
                    orderBy('examDate', 'desc')
                );
                const querySnapshot = await getDocs(q);
                
                const bookings = [];
                querySnapshot.forEach((doc) => {
                    bookings.push({ id: doc.id, ...doc.data() });
                });
                
                return { success: true, data: bookings };
            } catch (indexError) {
                // If index error occurs, fall back to simple query and sort in memory
                console.warn('Composite index not available, using fallback query:', indexError.message);
                console.info('💡 To improve performance, create composite indexes in Firebase Console:');
                console.info('   - Collection: bookings');
                console.info('   - Fields: ' + field + ' (Ascending), examDate (Descending), __name__ (Ascending)');
                console.info('   - For upcoming bookings: ' + field + ' (Ascending), examDate (Ascending), __name__ (Ascending)');
                
                const q = query(
                    bookingsRef,
                    where(field, '==', userId)
                );
                const querySnapshot = await getDocs(q);
                
                const bookings = [];
                querySnapshot.forEach((doc) => {
                    bookings.push({ id: doc.id, ...doc.data() });
                });
                
                // Sort by examDate in memory (descending)
                bookings.sort((a, b) => {
                    const dateA = a.examDate?.toDate ? a.examDate.toDate() : new Date(a.examDate);
                    const dateB = b.examDate?.toDate ? b.examDate.toDate() : new Date(b.examDate);
                    return dateB - dateA;
                });
                
                return { success: true, data: bookings };
            }
        } catch (error) {
            console.error('Error getting user bookings:', error);
            return { success: false, error: error.message };
        }
    },

    async getUpcomingBookings(userId, role = 'student') {
        try {
            const now = new Date();
            const bookingsRef = collection(db, 'bookings');
            const field = role === 'scribe' ? 'scribeId' : 'studentId';
            
            // Try the optimized query first (requires composite index)
            try {
                const q = query(
                    bookingsRef,
                    where(field, '==', userId),
                    where('examDate', '>=', now),
                    orderBy('examDate', 'asc')
                );
                const querySnapshot = await getDocs(q);
                
                const bookings = [];
                querySnapshot.forEach((doc) => {
                    bookings.push({ id: doc.id, ...doc.data() });
                });
                
                return { success: true, data: bookings };
            } catch (indexError) {
                // If index error occurs, fall back to simple query and filter/sort in memory
                console.warn('Composite index not available, using fallback query:', indexError.message);
                console.info('💡 To improve performance, create composite indexes in Firebase Console:');
                console.info('   - Collection: bookings');
                console.info('   - Fields: ' + field + ' (Ascending), examDate (Ascending), __name__ (Ascending)');
                
                const q = query(
                    bookingsRef,
                    where(field, '==', userId)
                );
                const querySnapshot = await getDocs(q);
                
                const bookings = [];
                querySnapshot.forEach((doc) => {
                    const bookingData = { id: doc.id, ...doc.data() };
                    const examDate = bookingData.examDate?.toDate ? bookingData.examDate.toDate() : new Date(bookingData.examDate);
                    
                    // Filter upcoming bookings in memory
                    if (examDate >= now) {
                        bookings.push(bookingData);
                    }
                });
                
                // Sort by examDate in memory (ascending)
                bookings.sort((a, b) => {
                    const dateA = a.examDate?.toDate ? a.examDate.toDate() : new Date(a.examDate);
                    const dateB = b.examDate?.toDate ? b.examDate.toDate() : new Date(b.examDate);
                    return dateA - dateB;
                });
                
                return { success: true, data: bookings };
            }
        } catch (error) {
            console.error('Error getting upcoming bookings:', error);
            return { success: false, error: error.message };
        }
    }
};

// Resource Services
export const resourceServices = {
    async createResource(resourceData) {
        try {
            const resourceRef = await addDoc(collection(db, 'resources'), {
                ...resourceData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, data: { id: resourceRef.id, ...resourceData } };
        } catch (error) {
            console.error('Error creating resource:', error);
            return { success: false, error: error.message };
        }
    },

    async getResources() {
        try {
            const resourcesRef = collection(db, 'resources');
            const q = query(resourcesRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const resources = [];
            querySnapshot.forEach((doc) => {
                resources.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: resources };
        } catch (error) {
            console.error('Error getting resources:', error);
            return { success: false, error: error.message };
        }
    }
};

// Storage Services
export const storageServices = {
    async uploadFile(file, path) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return { success: true, data: { url: downloadURL, path } };
        } catch (error) {
            console.error('Error uploading file:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteFile(path) {
        try {
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            return { success: false, error: error.message };
        }
    }
};

// Rating Services
export const ratingServices = {
    async addRating(ratingData) {
        try {
            const ratingRef = await addDoc(collection(db, 'ratings'), {
                ...ratingData,
                createdAt: serverTimestamp()
            });
            return { success: true, data: { id: ratingRef.id, ...ratingData } };
        } catch (error) {
            console.error('Error adding rating:', error);
            return { success: false, error: error.message };
        }
    },

    async getScribeRatings(scribeId) {
        try {
            const ratingsRef = collection(db, 'ratings');
            const q = query(
                ratingsRef,
                where('scribeId', '==', scribeId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            
            const ratings = [];
            querySnapshot.forEach((doc) => {
                ratings.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: ratings };
        } catch (error) {
            console.error('Error getting scribe ratings:', error);
            return { success: false, error: error.message };
        }
    }
};

// Notification Services
export const notificationServices = {
    async createNotification(notificationData) {
        try {
            const notificationRef = await addDoc(collection(db, 'notifications'), {
                ...notificationData,
                createdAt: serverTimestamp(),
                isRead: false
            });
            return { success: true, data: { id: notificationRef.id, ...notificationData } };
        } catch (error) {
            console.error('Error creating notification:', error);
            return { success: false, error: error.message };
        }
    },

    async getUserNotifications(userId) {
        try {
            const notificationsRef = collection(db, 'notifications');
            const q = query(
                notificationsRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            
            const notifications = [];
            querySnapshot.forEach((doc) => {
                notifications.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: notifications };
        } catch (error) {
            console.error('Error getting user notifications:', error);
            return { success: false, error: error.message };
        }
    }
};

// Realtime Services
export const realtimeServices = {
    listenToUserProfile(userId, callback) {
        const userRef = doc(db, 'users', userId);
        return onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                callback({ success: true, data: { id: doc.id, ...doc.data() } });
            } else {
                callback({ success: false, error: 'User not found' });
            }
        });
    },

    listenToUserBookings(userId, role = 'student', callback) {
        const bookingsRef = collection(db, 'bookings');
        const field = role === 'scribe' ? 'scribeId' : 'studentId';
        const q = query(bookingsRef, where(field, '==', userId), orderBy('examDate', 'desc'));
        
        return onSnapshot(q, (querySnapshot) => {
            const bookings = [];
            querySnapshot.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });
            callback({ success: true, data: bookings });
        });
    }
};

// Batch Operations
export const batchServices = {
    async batchUpdate(updates) {
        try {
            const batch = writeBatch(db);
            
            updates.forEach(({ collection, docId, data, operation }) => {
                const docRef = doc(db, collection, docId);
                if (operation === 'update') {
                    batch.update(docRef, data);
                } else if (operation === 'delete') {
                    batch.delete(docRef);
                }
            });
            
            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Error in batch update:', error);
            return { success: false, error: error.message };
        }
    }
};
