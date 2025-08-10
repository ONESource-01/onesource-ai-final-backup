#!/usr/bin/env python3
"""
Clear booster usage for testing
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def clear_booster_usage():
    try:
        # Connect to MongoDB
        mongo_url = 'mongodb://localhost:27017'
        client = AsyncIOMotorClient(mongo_url)
        db = client['onesource_ai_production']
        
        # Check current booster usage
        print('=== Current Booster Usage Records ===')
        cursor = db.booster_usage.find({})
        records = await cursor.to_list(length=100)
        
        for record in records:
            print(f'User: {record.get("user_id", "unknown")}')
            print(f'Date: {record.get("date", "unknown")}')
            print(f'Usage Count: {record.get("usage_count", 0)}')
            print(f'Questions Boosted: {len(record.get("questions_boosted", []))}')
            print('---')
        
        print(f'Total records: {len(records)}')
        
        # Clear all booster usage for testing
        delete_result = await db.booster_usage.delete_many({})
        print(f'Cleared {delete_result.deleted_count} booster usage records for testing')
        
        await client.close()
        print('✅ Booster usage cleared successfully')
        
    except Exception as e:
        print(f'❌ Error clearing booster usage: {e}')

if __name__ == "__main__":
    asyncio.run(clear_booster_usage())