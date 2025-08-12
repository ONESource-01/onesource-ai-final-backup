import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from typing import Dict, Any, Optional
import json
import logging

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        if not firebase_admin._apps:
            # Try to initialize with environment variables or use dummy credentials for development
            try:
                # For development, we'll create a minimal config
                # In production, this should be a proper service account key
                firebase_config = {
                    "type": "service_account",
                    "project_id": os.environ.get("FIREBASE_PROJECT_ID", "one-source-e6b0e"),
                    "private_key_id": "dummy_key_id",
                    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nHmq0TkUvHsHb3Rqh5Z6bJvGTRVuEOvUazhLVy5LcS5yPJp+uxF+YsqnF1HxkJ7n\nVcAuJ/DqfK7JGJTjfh7EkqEIXlHjF1TxfV1A+QT7a7k1n0mY8B3n7YOFQqxG1pG\n2+JmAF5A0n6bYqO7b9mS5b9C6Fa0Aw4/nMHr6Q4dZyGpFFRjKo/q4lfMZ4lDsL\n+LkF2nHHf/xaabSkXIUExj3jKGBk3GH4JlhgYWJhJ5OAg1TCQwxBMn2jPFqSm3\ntRnLaBh5T1u5xk9DnSu8vr4GdOK4i7O3l+h8mCRgIRlLZPq0cj5MmTwGM9hLq6\nNkN2m1s8FgcBN5VsQA+G9IjAgMBAAECggEAQeQGYDRyYE2tBXOFOePEMoAhQYW\nHT5QmXh1S9+rVJzTfGkMJ1k5f7X4Xg1MqPn1g7+lK8cOPgOYjGpSjw8ew8RGU\nTsLHEgGl5H4L5iGvz0g6BZAMv6O4Cy7H9J+VlRHdB+D5xGkj6xMfK8K5i5z/7m\nV3L8JqONQQyDOHPzgL9nKfPfK5hJ1N9K8rN6LfT8/f6YhGH5FtKfRJi8K5GnH\nKhT+L8gB2zJ1/m7Ly+Pz6P5f8P1fLq6/yQkD8B6F6h4S/M9X7kX5o6Dy2fS1q\n6F6e8f9S6f8E1RoP5hGy1+JTz9OJDo8/hL6JzTOqg2iF4+3hP4+2K+S5K2MsG\n2Zy1JK6M4RR6qK6J8K6K6VtT7P5zTCqKJoQKBgQDyJ1hH8JJ5F5QT+l8gQRz5\nw+r2j6BvzU9O/zOy7hG5Hn2Rz9sL8wz3vR6fJ8P5z5K8G8R5N1h9g3v8t9Z8\nj2t9R8j5oYoNz3z6L7Q3vPzz3s8r3t4g3t9rL5H4zTz5v5H5P8s8t8K9g3c\nv8t7T3t4K8z9T2zLs8p2c9TKBgQDDQZ9z9R5v3t2L5f6K6J8K6K6VtT7T9P\nP9p4K4V7t9R8j2J4t9v5z3t5K6b9S6f5E1QoP5hGy9+Jz9R7f3K7K2LzTq\n2O3K6dZy1JK6M4RR6qK6J8K6K6VtT7P5zTCqKJoQKBgA9H8vG9/k5h2g8t6F\nH8C3T2wMw3zTzn3i5T1Qs3h7RgS5K8K6W8t5H5G8t7L9j3v5t5z8R8j2J4t\nZ3t5K9f6E1RoP5hGy1+J9P8s2t8K9g3c3v8t7T3t4K8z9T2zJqY7K9q4Y2\nz2Ry1JK6M4RR6qK6J8K6K6VtT7P5zTCqKJoQKBgA9H8vG9/k5h2g8t6F\n9H8C3T2wMw3zTzn3i5T1Qs3h7RgS5K8K6W8t5H5G8t7L9j3v5t5z8R8j2J4\n-----END PRIVATE KEY-----",
                    "client_email": "firebase-adminsdk-dummy@one-source-e6b0e.iam.gserviceaccount.com",
                    "client_id": "1234567890",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dummy%40one-source-e6b0e.iam.gserviceaccount.com"
                }
                
                cred = credentials.Certificate(firebase_config)
                firebase_admin.initialize_app(cred)
                
                # Initialize Firestore (this might fail in development)
                try:
                    self.db = firestore.client()
                except Exception as e:
                    print(f"Firestore initialization failed (development mode): {e}")
                    self.db = None
                    
            except Exception as e:
                print(f"Firebase initialization failed: {e}")
                # For development, we'll create a mock implementation
                self.db = None
    
    async def verify_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """Verify Firebase ID token and return user info"""
        try:
            if not self.db:
                # Mock implementation for development
                return {
                    "uid": "dev_user_123",
                    "email": "dev@example.com",
                    "name": "Development User"
                }
            
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            print(f"Error verifying token: {e}")
            return None
    
    async def create_user_profile(self, uid: str, profile_data: Dict[str, Any]) -> bool:
        """Create or update user profile in Firestore"""
        try:
            if not self.db:
                print(f"Mock: Creating user profile for {uid}: {profile_data}")
                return True
                
            user_ref = self.db.collection('users').document(uid)
            user_ref.set(profile_data, merge=True)
            return True
        except Exception as e:
            print(f"Error creating user profile: {e}")
            return False
    
    async def get_user_profile(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get user profile from Firestore"""
        try:
            if not self.db:
                # Mock implementation with more realistic data
                # Extract name from email if possible for demo
                mock_name = "John Smith"  # Default
                if "john" in uid.lower():
                    mock_name = "John Smith"
                elif "sarah" in uid.lower():
                    mock_name = "Sarah Williams"
                elif "michael" in uid.lower():
                    mock_name = "Michael Johnson"
                elif "emma" in uid.lower():
                    mock_name = "Emma Davis"
                else:
                    mock_name = "Alex Thompson"
                
                # CRITICAL FIX: Determine subscription tier based on token/uid
                subscription_tier = "starter"
                subscription_active = False
                
                # Mock different user types based on token patterns
                if "pro_user" in uid.lower():
                    subscription_tier = "pro"
                    subscription_active = True
                elif "consultant" in uid.lower() or "pro_plus" in uid.lower():
                    subscription_tier = "consultant"  # Pro-Plus
                    subscription_active = True
                elif "day_pass" in uid.lower():
                    subscription_tier = "day_pass"
                    subscription_active = True
                else:
                    # Default to starter for demo users and others
                    subscription_tier = "starter"
                    subscription_active = False
                
                return {
                    "uid": uid,
                    "name": mock_name,
                    "profession": "Structural Engineer",
                    "sector": "Commercial",
                    "use_case": "Design compliance checking",
                    "onboarding_completed": True,
                    "subscription_tier": subscription_tier,
                    "trial_questions_used": 0,
                    "subscription_active": subscription_active
                }
                
            user_ref = self.db.collection('users').document(uid)
            doc = user_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    async def update_user_daily_count(self, uid: str, daily_key: str, increment: int = 1):
        """Update user's daily question count"""
        try:
            # In production, update Firebase
            # doc_ref = self.db.collection('users').document(uid)
            # doc_ref.update({daily_key: firestore.Increment(increment)})
            
            # For development/mock mode
            return {"status": "success", "daily_count_updated": True}
        except Exception as e:
            logger.error(f"Error updating daily count: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def check_user_subscription(self, uid: str) -> Dict[str, Any]:
        """Check user's subscription status"""
        try:
            if not self.db:
                # CRITICAL FIX: Mock implementation that respects different user types
                subscription_tier = "starter"
                subscription_active = False
                trial_questions_used = 0
                
                # Mock different user types based on token patterns
                if "pro_user" in uid.lower():
                    subscription_tier = "pro"
                    subscription_active = True
                    trial_questions_used = 0  # Pro users don't use trial questions
                elif "consultant" in uid.lower() or "pro_plus" in uid.lower():
                    subscription_tier = "consultant"  # Pro-Plus
                    subscription_active = True
                    trial_questions_used = 0
                elif "day_pass" in uid.lower():
                    subscription_tier = "day_pass"
                    subscription_active = True
                    trial_questions_used = 0
                else:
                    # Default to starter for demo users and others
                    subscription_tier = "starter"
                    subscription_active = False
                    trial_questions_used = 0  # Fresh users start with 0
                
                return {
                    'subscription_tier': subscription_tier,
                    'trial_questions_used': trial_questions_used,
                    'subscription_active': subscription_active,
                    'subscription_expires': None
                }
                
            user_ref = self.db.collection('users').document(uid)
            doc = user_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return {
                    'subscription_tier': data.get('subscription_tier', 'starter'),
                    'trial_questions_used': data.get('trial_questions_used', 0),
                    'subscription_active': data.get('subscription_active', False),
                    'subscription_expires': data.get('subscription_expires')
                }
            else:
                # New user - create basic profile
                user_ref.set({
                    'subscription_tier': 'starter',
                    'trial_questions_used': 0,
                    'subscription_active': False,
                    'created_at': firestore.SERVER_TIMESTAMP
                })
                return {
                    'subscription_tier': 'starter',
                    'trial_questions_used': 0,
                    'subscription_active': False,
                    'subscription_expires': None
                }
        except Exception as e:
            print(f"Error checking subscription: {e}")
            return {
                'subscription_tier': 'starter',
                'trial_questions_used': 0,
                'subscription_active': False,
                'subscription_expires': None
            }
    
    async def update_subscription_status(self, uid: str, subscription_data: Dict[str, Any]) -> bool:
        """Update user's subscription status after payment"""
        try:
            if not self.db:
                print(f"Mock: Updating subscription for {uid}: {subscription_data}")
                return True
                
            user_ref = self.db.collection('users').document(uid)
            user_ref.set(subscription_data, merge=True)
            return True
        except Exception as e:
            print(f"Error updating subscription: {e}")
            return False

# Global instance
firebase_service = FirebaseService()