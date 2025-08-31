# 🚀 Eklavya - Scribe Booking Platform

A React Native application that connects visually impaired students with trained scribes for exam assistance. Built with Firebase backend for real-time data management and authentication.

## 🌟 Features

- **User Authentication**: Secure login/register with Firebase Auth
- **Role-based Access**: Separate interfaces for students and scribes
- **Real-time Data**: Live updates using Firebase Firestore
- **Advanced Search**: Filter scribes by language, subject, and location
- **Booking System**: Complete exam booking workflow
- **Resource Management**: Educational resources and materials
- **Rating System**: Scribe reviews and ratings
- **Notifications**: Real-time updates and alerts
- **Cross-platform**: Works on both mobile and web

## 🏗️ Project Structure

```
Eklavya/
├── app/
│   └── (tabs)/
│       ├── _layout.jsx          # Main navigation structure
│       ├── index.jsx            # Login/Register screen
│       ├── DashboardScreen.jsx  # Main dashboard
│       ├── FindScribeScreen.jsx # Scribe search and discovery
│       ├── BookScribeScreen.jsx # Booking interface
│       ├── ResourceBankScreen.jsx # Educational resources
│       ├── MyUpcomingExamsScreen.jsx # Calendar and exams
│       ├── ProfileScreen.jsx    # User profile management
│       └── AboutScreen.jsx      # App information
├── config/
│   ├── Firebase.js              # Firebase configuration
│   └── firebaseServices.js      # Firebase service layer
├── hooks/
│   ├── useColorScheme.js        # Dark/light mode hook
│   └── useFirebase.js           # Firebase operations hook
└── constants/
    └── Colors.ts                # Color scheme definitions
```

## 🔥 Firebase Integration

### Configuration (`config/Firebase.js`)

The app uses Firebase for:
- **Authentication**: User login/register
- **Firestore**: Real-time database
- **Storage**: File uploads and management

### Service Layer (`config/firebaseServices.js`)

Comprehensive Firebase services organized by functionality:

#### User Services
- `createUser()` - Create new user profiles
- `getUser()` - Retrieve user data
- `updateUser()` - Update user information
- `getUsersByRole()` - Get users by role (student/scribe)

#### Scribe Services
- `createScribeProfile()` - Create scribe profiles
- `searchScribes()` - Advanced scribe search with filters
- `getNearbyScribes()` - Location-based scribe discovery
- `updateScribeProfile()` - Update scribe information

#### Booking Services
- `createBooking()` - Create new exam bookings
- `getUserBookings()` - Get user's booking history
- `getUpcomingBookings()` - Get future bookings
- `updateBookingStatus()` - Update booking status

#### Resource Services
- `createResource()` - Add educational resources
- `getAllResources()` - Retrieve all resources
- `getResourcesByCategory()` - Filter resources by category

#### Rating & Review Services
- `addRating()` - Add scribe ratings and reviews
- `getScribeRatings()` - Get scribe rating history

#### Notification Services
- `createNotification()` - Send notifications
- `getUserNotifications()` - Get user notifications
- `markNotificationAsRead()` - Mark notifications as read

#### Real-time Services
- `listenToUserProfile()` - Real-time profile updates
- `listenToUserBookings()` - Live booking updates
- `listenToScribeAvailability()` - Scribe availability changes

#### Storage Services
- `uploadFile()` - Upload files to Firebase Storage
- `deleteFile()` - Remove files from storage

### Custom Hook (`hooks/useFirebase.js`)

A React hook that provides:
- **Authentication state**: User login status
- **Loading states**: Operation progress indicators
- **Error handling**: Centralized error management
- **Service methods**: Easy access to all Firebase operations

## 📱 Screens & Functionality

### 1. Authentication (`index.jsx`)
- User registration with role selection
- Login with email/password
- Automatic scribe profile creation for scribe users
- Web-optimized responsive design

### 2. Dashboard (`DashboardScreen.jsx`)
- Personalized welcome message
- Role-based content (student vs scribe)
- Real-time upcoming bookings
- Quick action buttons
- Dynamic announcements

### 3. Find Scribe (`FindScribeScreen.jsx`)
- Advanced search with filters
- Real-time scribe discovery
- Rating and review display
- Safety tips and guidelines
- Location-based filtering

### 4. Book Scribe (`BookScribeScreen.jsx`)
- Exam booking interface
- Time slot selection
- Exam details input
- Draft saving and confirmation

### 5. Resource Bank (`ResourceBankScreen.jsx`)
- Educational materials
- Categorized resources
- Audio and text resources
- Accessibility-focused content

### 6. Profile (`ProfileScreen.jsx`)
- User profile management
- Privacy settings
- Account preferences
- Data export options

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Eklavya
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Storage
   - Update `config/Firebase.js` with your Firebase config

4. **Run the application**
   ```bash
   npm start
   ```

### Firebase Project Setup

1. **Create Firestore Collections**
   ```
   users/          # User profiles
   scribes/        # Scribe profiles
   bookings/       # Exam bookings
   resources/      # Educational resources
   ratings/        # Scribe ratings
   notifications/  # User notifications
   ```

2. **Set up Security Rules**
   ```javascript
   // Example Firestore security rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Scribes can read/write their own profiles
       match /scribes/{scribeId} {
         allow read, write: if request.auth != null && request.auth.uid == scribeId;
       }
       
       // Bookings: students can create, both can read their own
       match /bookings/{bookingId} {
         allow read: if request.auth != null && 
           (resource.data.studentId == request.auth.uid || 
            resource.data.scribeId == request.auth.uid);
         allow create: if request.auth != null;
         allow update: if request.auth != null && 
           (resource.data.studentId == request.auth.uid || 
            resource.data.scribeId == request.auth.uid);
       }
     }
   }
   ```

## 🔧 Usage Examples

### Using Firebase Services

```javascript
import useFirebase from '../hooks/useFirebase';

function MyComponent() {
  const { 
    user, 
    createBooking, 
    searchScribes, 
    isLoading, 
    firebaseError 
  } = useFirebase();

  const handleBookScribe = async () => {
    const result = await createBooking({
      scribeId: 'scribe123',
      examDate: new Date(),
      subject: 'Mathematics',
      venue: 'Room 101'
    });
    
    if (result.success) {
      console.log('Booking created:', result.bookingId);
    }
  };

  const handleSearch = async () => {
    const result = await searchScribes({
      language: 'English',
      subject: 'Math',
      maxDistance: 10
    });
    
    if (result.success) {
      console.log('Found scribes:', result.data);
    }
  };
}
```

### Real-time Listeners

```javascript
import { useEffect } from 'react';
import useFirebase from '../hooks/useFirebase';

function RealTimeComponent() {
  const { listenToUserBookings, user } = useFirebase();

  useEffect(() => {
    if (user) {
      const unsubscribe = listenToUserBookings(user.uid, 'student', (result) => {
        if (result.success) {
          console.log('Updated bookings:', result.data);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);
}
```

## 🎨 Styling & Theming

- **Dark Mode Support**: Automatic theme switching
- **Responsive Design**: Mobile-first with web optimization
- **Consistent UI**: Material Design principles
- **Accessibility**: Screen reader friendly

## 🔒 Security Features

- **Authentication**: Firebase Auth with email/password
- **Data Validation**: Server-side and client-side validation
- **Role-based Access**: Different permissions for students and scribes
- **Secure Storage**: Firebase Security Rules enforcement

## 📊 Data Models

### User Document
```javascript
{
  uid: "user123",
  name: "John Doe",
  email: "john@example.com",
  role: "student", // or "scribe"
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Scribe Document
```javascript
{
  userId: "user123",
  name: "John Doe",
  languages: ["English", "Hindi"],
  subjects: ["Math", "Physics"],
  city: "Mumbai",
  rating: 4.8,
  totalBookings: 25,
  isAvailable: true,
  hourlyRate: 500,
  bio: "Experienced scribe...",
  experience: "5 years"
}
```

### Booking Document
```javascript
{
  studentId: "student123",
  scribeId: "scribe456",
  examDate: Timestamp,
  subject: "Mathematics",
  venue: "Room 101",
  status: "pending", // pending, confirmed, completed, cancelled
  notes: "Special requirements...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚀 Deployment

### Expo Build
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build for web
expo build:web
```

### Firebase Hosting (Web)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the Firebase documentation

## 🔮 Future Enhancements

- **Push Notifications**: Firebase Cloud Messaging
- **Video Calls**: Integration with video platforms
- **Payment Gateway**: Stripe integration for payments
- **Analytics**: Firebase Analytics and Crashlytics
- **Offline Support**: PWA capabilities
- **Multi-language**: Internationalization support

---

**Built with ❤️ using React Native, Expo, and Firebase**
