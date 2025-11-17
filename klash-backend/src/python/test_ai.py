#!/usr/bin/env python3
"""
Test script for Klash AI components.

This script tests the following components:
1. Sentiment Analysis (sentiment_hf.py)
2. Team Classification (team_classifier.py)
3. Market Resolution (market_resolver.py)
"""

import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add parent directory to path for module imports
sys.path.append(str(Path(__file__).parent.parent))

# Test data
SAMPLE_TWEETS = [
    {"id": "1", "text": "Bitcoin is going to the moon! 🚀 #BTC"},
    {"id": "2", "text": "I'm concerned about the recent market crash. #crypto"},
    {"id": "3", "text": "Ethereum's upgrade is a game changer for DeFi"},
    {"id": "4", "text": "The SEC's regulations are killing innovation in crypto"},
    {"id": "5", "text": "Just bought more $BTC. Diamond hands! 💎🙌"}
]

SAMPLE_MARKET = {
    "market_id": "test_market_1",
    "question": "Will Bitcoin hit $100k by the end of 2025?",
    "outcomes": ["Yes", "No"],
    "original_tweet_id": "tweet_123",
    "reply_tweets": [
        {"id": "r1", "text": "Yes, Bitcoin will definitely hit $100k! The halving is coming.", "author": "bull1"},
        {"id": "r2", "text": "No way, the bear market will continue", "author": "bear1"},
        {"id": "r3", "text": "Yes, institutional adoption is growing", "author": "bull2"},
        {"id": "r4", "text": "Not with these regulations", "author": "bear2"},
        {"id": "r5", "text": "Yes, the charts look very bullish", "author": "bull3"}
    ],
    "closing_time": "2025-12-31T23:59:59Z"
}

def run_script(script_name: str, input_data: Any) -> Dict[str, Any]:
    """Run a Python script with the given input data."""
    script_path = Path(__file__).parent / f"{script_name}.py"
    if not script_path.exists():
        raise FileNotFoundError(f"Script not found: {script_path}")
    
    try:
        input_str = json.dumps(input_data, ensure_ascii=False) if not isinstance(input_data, str) else input_data
        result = subprocess.run(
            [sys.executable, str(script_path)],
            input=input_str,
            capture_output=True,
            text=True,
            encoding='utf-8',
            check=True
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_name}:")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        raise
    except json.JSONDecodeError:
        print(f"Invalid JSON output from {script_name}:")
        print(result.stdout)
        raise

def test_sentiment_analysis() -> bool:
    """Test the sentiment analysis script."""
    print("\n=== Testing Sentiment Analysis ===")
    try:
        result = run_script("sentiment_hf", SAMPLE_TWEETS)
        print("✅ Sentiment analysis successful")
        print(f"Overall sentiment: {result.get('outcome')} (confidence: {result.get('avg_confidence', 0):.2f})")
        print(f"Sample size: {result.get('sample_size')}")
        return True
    except Exception as e:
        print(f"❌ Sentiment analysis test failed: {str(e)}")
        return False

def test_team_classification() -> bool:
    """Test the team classification script."""
    print("\n=== Testing Team Classification ===")
    try:
        input_data = {
            "controversy": "Is Bitcoin a good investment compared to traditional assets?",
            "teams": ["Pro-Bitcoin", "Anti-Bitcoin", "Neutral"],
            "tweets": SAMPLE_TWEETS
        }
        result = run_script("team_classifier", input_data)
        print("✅ Team classification successful")
        print(f"Winning team: {result.get('winning_team')}")
        print("Team stats:")
        for team, stats in result.get('team_stats', {}).items():
            print(f"  - {team}: {stats.get('count')} tweets ({stats.get('percentage'):.1f}%)")
        return True
    except Exception as e:
        print(f"❌ Team classification test failed: {str(e)}")
        return False

def test_market_resolution() -> bool:
    """Test the market resolution script."""
    print("\n=== Testing Market Resolution ===")
    try:
        result = run_script("market_resolver", SAMPLE_MARKET)
        print("✅ Market resolution successful")
        print(f"Winning outcome: {result.get('winning_outcome')} (confidence: {result.get('confidence', 0):.2f})")
        print("Sentiment breakdown:")
        for outcome, stats in result.get('sentiment_breakdown', {}).items():
            if outcome != 'total_analyzed':
                print(f"  - {outcome}: {stats.get('count')} tweets ({stats.get('percentage'):.1f}%)")
        return True
    except Exception as e:
        print(f"❌ Market resolution test failed: {str(e)}")
        return False

def main():
    """Run all tests and print summary."""
    print("🚀 Starting Klash AI Integration Tests")
    print("=" * 40)
    
    # Run tests
    tests = [
        ("Sentiment Analysis", test_sentiment_analysis),
        ("Team Classification", test_team_classification),
        ("Market Resolution", test_market_resolution)
    ]
    
    results = {}
    for name, test_func in tests:
        print(f"\n🔍 Running test: {name}")
        print("-" * 40)
        results[name] = test_func()
    
    # Print summary
    print("\n📊 Test Summary")
    print("=" * 40)
    for name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{name}: {status}")
    
    # Exit with appropriate status code
    if all(results.values()):
        print("\n🎉 All tests passed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Please check the logs above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
