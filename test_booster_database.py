#!/usr/bin/env python3
"""
Test booster database operations
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def test_booster_database():
    """Test booster database operations"""
    print(f"🗄️  TESTING BOOSTER DATABASE OPERATIONS")
    print("=" * 60)
    
    try:
        # Connect to MongoDB
        mongo_url = 'mongodb://localhost:27017'
        client = AsyncIOMotorClient(mongo_url)
        db = client['onesource_ai_production']
        
        # Check booster usage collection
        print('=== Booster Usage Collection ===')
        cursor = db.booster_usage.find({})
        records = await cursor.to_list(length=100)
        
        if records:
            print(f"✅ Found {len(records)} booster usage records")
            
            for i, record in enumerate(records, 1):
                print(f"\nRecord {i}:")
                print(f"  User ID: {record.get('user_id', 'unknown')}")
                print(f"  Date: {record.get('date', 'unknown')}")
                print(f"  Usage Count: {record.get('usage_count', 0)}")
                print(f"  Questions Boosted: {len(record.get('questions_boosted', []))}")
                
                # Show questions boosted
                questions = record.get('questions_boosted', [])
                if questions:
                    print(f"  Questions:")
                    for j, q in enumerate(questions, 1):
                        print(f"    {j}. {q[:50]}..." if len(q) > 50 else f"    {j}. {q}")
                
                # Show target tiers
                target_tiers = record.get('target_tiers', [])
                if target_tiers:
                    print(f"  Target Tiers: {target_tiers}")
                
                print(f"  Created At: {record.get('created_at', 'unknown')}")
                print(f"  Updated At: {record.get('updated_at', 'unknown')}")
        else:
            print("⚠️  No booster usage records found")
        
        # Check if collections exist
        collections = await db.list_collection_names()
        print(f"\n=== Available Collections ===")
        booster_related = [col for col in collections if 'boost' in col.lower()]
        if booster_related:
            print(f"✅ Booster-related collections: {booster_related}")
        else:
            print("⚠️  No booster-related collections found")
        
        # Check conversations collection for booster usage
        print(f"\n=== Recent Conversations with Booster Usage ===")
        cursor = db.conversations.find({'booster_used': True}).sort('timestamp', -1).limit(5)
        booster_conversations = await cursor.to_list(length=5)
        
        if booster_conversations:
            print(f"✅ Found {len(booster_conversations)} conversations with booster usage")
            
            for i, conv in enumerate(booster_conversations, 1):
                print(f"\nConversation {i}:")
                print(f"  Session ID: {conv.get('session_id', 'unknown')}")
                print(f"  User ID: {conv.get('user_id', 'unknown')}")
                print(f"  Question: {conv.get('question', 'unknown')[:50]}...")
                print(f"  Booster Used: {conv.get('booster_used', False)}")
                print(f"  Target Tier: {conv.get('target_tier', 'unknown')}")
                print(f"  Timestamp: {conv.get('timestamp', 'unknown')}")
        else:
            print("⚠️  No conversations with booster usage found")
        
        await client.close()
        print("\n✅ Database operations test completed")
        
    except Exception as e:
        print(f"❌ Error testing database operations: {e}")

if __name__ == "__main__":
    asyncio.run(test_booster_database())