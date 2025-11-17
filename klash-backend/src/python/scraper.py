import sys
import json
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from twscrape import API, gather
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize twscrape API
api = API()

async def search_controversies(query: str, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Search for controversial tweets by keyword.
    Controversy score = (replies + quotes) / (likes + 1)
    """
    try:
        tweets = []
        async for tweet in api.search(query, limit=limit):
            # Skip tweets with no engagement
            if tweet.likeCount is None or tweet.retweetCount is None:
                continue
                
            replies = tweet.replyCount or 0
            quotes = tweet.quoteCount or 0
            likes = tweet.likeCount or 0
            
            # Calculate controversy score
            controversy_score = (replies + quotes) / (likes + 1)
            
            # Only include controversial tweets
            if controversy_score >= 0.3:
                tweets.append({
                    "id": str(tweet.id),
                    "text": tweet.rawContent,
                    "author": tweet.user.username,
                    "created_at": tweet.date.isoformat(),
                    "replies": replies,
                    "retweets": tweet.retweetCount,
                    "likes": likes,
                    "quotes": quotes,
                    "controversy_score": round(controversy_score, 2)
                })
        
        return tweets
    except Exception as e:
        print(f"Error in search_controversies: {str(e)}", file=sys.stderr)
        return []

async def monitor_influencer(username: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Monitor a specific user for controversial tweets"""
    try:
        user = await api.user_by_login(username)
        if not user:
            return []
            
        tweets = []
        async for tweet in api.user_tweets(user.id, limit=limit):
            replies = tweet.replyCount or 0
            quotes = tweet.quoteCount or 0
            likes = tweet.likeCount or 0
            
            controversy_score = (replies + quotes) / (likes + 1)
            
            if controversy_score >= 0.3:
                tweets.append({
                    "id": str(tweet.id),
                    "text": tweet.rawContent,
                    "author": username,
                    "created_at": tweet.date.isoformat(),
                    "replies": replies,
                    "retweets": tweet.retweetCount,
                    "likes": likes,
                    "quotes": quotes,
                    "controversy_score": round(controversy_score, 2)
                })
        
        return tweets
    except Exception as e:
        print(f"Error in monitor_influencer: {str(e)}", file=sys.stderr)
        return []

async def get_replies(tweet_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Get replies to a specific tweet"""
    try:
        replies = []
        async for reply in api.tweet_replies(tweet_id, limit=limit):
            replies.append({
                "id": str(reply.id),
                "text": reply.rawContent,
                "author": reply.user.username,
                "created_at": reply.date.isoformat(),
                "replies": reply.replyCount or 0,
                "retweets": reply.retweetCount or 0,
                "likes": reply.likeCount or 0,
                "quotes": reply.quoteCount or 0
            })
        return replies
    except Exception as e:
        print(f"Error in get_replies: {str(e)}", file=sys.stderr)
        return []

def main():
    if len(sys.argv) < 3:
        print("Usage: python scraper.py <command> <arg1> [arg2]")
        print("Commands: search <query> [limit], monitor <username> [limit], replies <tweet_id> [limit]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    arg = sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 20
    
    async def run():
        if command == "search":
            result = await search_controversies(arg, limit)
        elif command == "monitor":
            result = await monitor_influencer(arg, limit)
        elif command == "replies":
            result = await get_replies(arg, limit)
        else:
            print(f"Unknown command: {command}", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(result, indent=2))
    
    asyncio.run(run())

if __name__ == "__main__":
    main()
