# 🔥 Firebase Indexes Setup Guide

## Problem
Your Firebase queries are failing because they require composite indexes that haven't been created yet.

## Solution
Create the following composite indexes in your Firebase Console:

### 📍 **Step 1: Access Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `fir-authentication-8abb6`
3. Navigate to **Firestore Database** → **Indexes** tab

### 📊 **Step 2: Create Required Indexes**

#### **Index 1: Student Bookings (All)**
- **Collection ID**: `bookings`
- **Fields**:
  - `studentId` (Ascending)
  - `examDate` (Descending)
  - `__name__` (Ascending)

#### **Index 2: Student Bookings (Upcoming)**
- **Collection ID**: `bookings`
- **Fields**:
  - `studentId` (Ascending)
  - `examDate` (Ascending)
  - `__name__` (Ascending)

#### **Index 3: Scribe Bookings (All)**
- **Collection ID**: `bookings`
- **Fields**:
  - `scribeId` (Ascending)
  - `examDate` (Descending)
  - `__name__` (Ascending)

#### **Index 4: Scribe Bookings (Upcoming)**
- **Collection ID**: `bookings`
- **Fields**:
  - `scribeId` (Ascending)
  - `examDate` (Ascending)
  - `__name__` (Ascending)

### 🚀 **Step 3: Quick Index Creation**
Click these direct links to create indexes:

- **Student Indexes**: [Click here](https://console.firebase.google.com/v1/r/project/fir-authentication-8abb6/firestore/indexes?create_composite=Cllwcm9qZWN0cy9maXItYXV0aGVudGljYXRpb24tOGFiYjYvZGF0YWJzL2luZGV4ZXMvXxABGg0KCXN0dWRlbnRJZBABGgwKCGV4YW1EYXRlEAIaDAoIX19uYW1lX18QAg)
- **Scribe Indexes**: [Click here](https://console.firebase.google.com/v1/r/project/fir-authentication-8abb6/firestore/indexes?create_composite=Cllwcm9qZWN0cy9maXItYXV0aGVudGljYXRpb24tOGFiYjYvZGF0YWJzL2luZGV4ZXMvXxABGgwKCHNjcmliZUlkEAEaDAoIZXhhbURhdGUQAhoMCghfX25hbWVfXxAC)

### ⏱️ **Step 4: Wait for Index Building**
- Indexes take **2-5 minutes** to build
- You'll see status: "Building" → "Enabled"
- **Don't delete indexes** while they're building

### 🔍 **Step 5: Verify Indexes**
After building, you should see:
- ✅ All 4 indexes with status "Enabled"
- ✅ No more "requires an index" errors
- ✅ Fast query performance

## 🆘 **Temporary Workaround**
While indexes are building, the app will:
- Use fallback queries (slower but functional)
- Show helpful error messages
- Allow retry functionality
- Continue working with basic functionality

## 📱 **What This Fixes**
- ✅ Scribes can see students who booked them
- ✅ Students can see their booking history
- ✅ Dashboard loads without errors
- ✅ My Calendar works for both roles
- ✅ Upcoming bookings display correctly

## 🚨 **Important Notes**
- **Don't delete indexes** once created
- **Indexes are free** for normal usage
- **Performance improves** significantly after indexes are built
- **Automatic fallback** ensures app continues working

## 🆘 **Need Help?**
If you still encounter issues:
1. Check index status in Firebase Console
2. Wait 5-10 minutes for indexes to build
3. Restart the app
4. Check console logs for helpful messages
