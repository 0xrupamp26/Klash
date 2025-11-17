#!/usr/bin/env python3
"""
Market Resolution Algorithm for Klash

Automatically resolves prediction markets based on tweet sentiment and team classification.
"""

import sys
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import local modules
try:
    from sentiment_hf import SentimentAnalyzer as SentimentAnalyzerHF
    from team_classifier import TeamClassifier
except ImportError as e:
    logger.error(f"Failed to import required modules: {e}")
    raise

class MarketResolver:
    """Handles market resolution using various methods."""
    
    def __init__(self):
        """Initialize the market resolver with required models."""
        self.sentiment_analyzer = None
        self.team_classifier = None
        self.min_confidence = 0.6  # Minimum confidence threshold for classification
        
    def initialize_models(self):
        """Lazy initialization of ML models."""
        if not self.sentiment_analyzer:
            self.sentiment_analyzer = SentimentAnalyzerHF()
            self.sentiment_analyzer.load_model()
            
        if not self.team_classifier:
            self.team_classifier = TeamClassifier()
            self.team_classifier.load_model()
    
    def resolve_market(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolve a market based on the specified method.
        
        Args:
            market_data: Dictionary containing market information
            
        Returns:
            Dict with resolution results
        """
        try:
            # Validate input
            self._validate_market_data(market_data)
            
            # Get resolution method
            resolution_method = market_data.get('resolution_method', 'sentiment').lower()
            
            # Handle different resolution methods
            if resolution_method == 'sentiment':
                return self._resolve_by_sentiment(market_data)
            elif resolution_method == 'oracle':
                return self._pending_resolution(market_data, "oracle")
            elif resolution_method == 'manual':
                return self._pending_resolution(market_data, "manual")
            else:
                raise ValueError(f"Unsupported resolution method: {resolution_method}")
                
        except Exception as e:
            logger.error(f"Error resolving market: {str(e)}")
            return self._create_error_response(market_data, str(e))
    
    def _resolve_by_sentiment(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve market using sentiment analysis of reply tweets."""
        self.initialize_models()
        
        # Initialize outcome counters
        outcomes = market_data['outcomes']
        outcome_counts = {outcome: {"count": 0, "confidence_sum": 0.0} for outcome in outcomes}
        total_analyzed = 0
        
        # Process each reply tweet
        for tweet in market_data.get('reply_tweets', []):
            if not isinstance(tweet, dict) or 'text' not in tweet:
                continue
                
            # Classify tweet sentiment towards each outcome
            try:
                result = self.team_classifier.classify_tweet(
                    tweet['text'], 
                    outcomes
                )
                
                # Only count if confidence is above threshold
                if result['confidence'] >= self.min_confidence and result['team'] in outcome_counts:
                    outcome = result['team']
                    outcome_counts[outcome]['count'] += 1
                    outcome_counts[outcome]['confidence_sum'] += result['confidence']
                    total_analyzed += 1
                    
            except Exception as e:
                logger.warning(f"Error processing tweet {tweet.get('id', 'unknown')}: {str(e)}")
        
        # Calculate results
        if total_analyzed == 0:
            raise ValueError("No valid tweets could be analyzed for sentiment")
        
        # Prepare sentiment breakdown
        sentiment_breakdown = {}
        max_count = 0
        winning_outcome = None
        
        for outcome, data in outcome_counts.items():
            count = data['count']
            sentiment_breakdown[outcome] = {
                'support_count': count,
                'support_percentage': round(count / total_analyzed * 100, 2) if total_analyzed > 0 else 0,
                'avg_confidence': round(data['confidence_sum'] / count, 4) if count > 0 else 0
            }
            
            # Track winning outcome
            if count > max_count:
                max_count = count
                winning_outcome = outcome
            elif count == max_count and max_count > 0:
                # Handle tie by confidence
                current_confidence = data['confidence_sum'] / count if count > 0 else 0
                winning_confidence = outcome_counts[winning_outcome]['confidence_sum'] / max_count \
                    if max_count > 0 else 0
                if current_confidence > winning_confidence:
                    winning_outcome = outcome
        
        # If all outcomes have 0 count, mark as unresolved
        if max_count == 0:
            return self._pending_resolution(
                market_data, 
                "sentiment", 
                "Insufficient data for sentiment analysis"
            )
        
        # Calculate confidence as percentage of winning outcome
        confidence = round(max_count / total_analyzed, 4)
        
        # Get winning index
        winning_index = outcomes.index(winning_outcome) if winning_outcome else -1
        
        # Prepare and return result
        return {
            "market_id": market_data['market_id'],
            "question": market_data['question'],
            "outcomes": outcomes,
            "winning_outcome": winning_outcome,
            "winning_index": winning_index,
            "confidence": confidence,
            "resolution_method": "sentiment",
            "sentiment_breakdown": sentiment_breakdown,
            "total_analyzed": total_analyzed,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _pending_resolution(self, market_data: Dict[str, Any], method: str, 
                          message: str = "Pending manual resolution") -> Dict[str, Any]:
        """Create a response for pending resolutions."""
        return {
            "market_id": market_data.get('market_id', ''),
            "question": market_data.get('question', ''),
            "outcomes": market_data.get('outcomes', []),
            "winning_outcome": None,
            "winning_index": -1,
            "confidence": 0.0,
            "resolution_method": method,
            "status": "pending",
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _validate_market_data(self, market_data: Dict[str, Any]):
        """Validate the input market data."""
        required_fields = ['market_id', 'question', 'outcomes', 'resolution_method']
        for field in required_fields:
            if field not in market_data:
                raise ValueError(f"Missing required field: {field}")
        
        if not isinstance(market_data['outcomes'], list) or len(market_data['outcomes']) < 2:
            raise ValueError("At least two outcomes are required")
    
    def _create_error_response(self, market_data: Dict[str, Any], error_msg: str) -> Dict[str, Any]:
        """Create an error response."""
        return {
            "market_id": market_data.get('market_id', 'unknown'),
            "question": market_data.get('question', ''),
            "outcomes": market_data.get('outcomes', []),
            "error": error_msg,
            "status": "error",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

def resolve_market() -> Dict[str, Any]:
    """
    Main function to resolve a market from stdin.
    
    Expected input from stdin:
    {
        "market_id": "market_123",
        "question": "Will Bitcoin hit $100k by end of 2025?",
        "outcomes": ["Yes", "No"],
        "original_tweet_id": "789",
        "reply_tweets": [
            {"id": "1", "text": "...", "author": "..."},
            ...
        ],
        "closing_time": "2025-11-10T00:00:00Z",
        "resolution_method": "sentiment"
    }
    """
    try:
        # Read and parse input
        input_text = sys.stdin.read()
        if not input_text.strip():
            raise ValueError("No input provided")
            
        try:
            market_data = json.loads(input_text)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON input: {str(e)}")
        
        # Resolve market
        resolver = MarketResolver()
        result = resolver.resolve_market(market_data)
        return result
        
    except Exception as e:
        logger.error(f"Error in resolve_market: {str(e)}")
        return {
            "error": str(e),
            "status": "error",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

if __name__ == "__main__":
    try:
        # Run resolution and print result as JSON
        result = resolve_market()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        error_result = {
            "error": str(e),
            "status": "error",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        print(json.dumps(error_result, ensure_ascii=False, indent=2))
        sys.exit(1)
