#!/usr/bin/env python3
"""
Team Classifier for Klash Prediction Markets

Uses facebook/bart-large-mnli for zero-shot classification of tweets into teams.
"""

import sys
import json
import logging
from typing import Dict, List, Any, Tuple, Optional
import numpy as np
from transformers import pipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TeamClassifier:
    """Classify tweets into teams using zero-shot classification."""
    
    def __init__(self, model_name: str = "facebook/bart-large-mnli"):
        """Initialize the classifier with the specified model."""
        self.model = None
        self.model_name = model_name
        self.device = 0 if torch.cuda.is_available() else -1  # Use GPU if available
        self.min_confidence = 0.5  # Minimum confidence threshold for classification
        self.dominance_threshold = 0.95  # Threshold for single team dominance
        
    def load_model(self):
        """Load the zero-shot classification model."""
        try:
            logger.info(f"Loading {self.model_name} model...")
            self.classifier = pipeline(
                "zero-shot-classification",
                model=self.model_name,
                device=self.device
            )
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def preprocess_text(self, text: str, max_length: int = 512) -> str:
        """Preprocess text for classification."""
        if not text:
            return ""
        # Simple truncation while trying to preserve meaning
        return text[:max_length].strip()
    
    def classify_tweet(self, text: str, team_labels: List[str]) -> Dict[str, Any]:
        """Classify a single tweet into one of the teams."""
        if not self.classifier:
            self.load_model()
            
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            if not processed_text:
                return {"team": None, "confidence": 0.0}
                
            # Get classification
            result = self.classifier(
                processed_text,
                candidate_labels=team_labels,
                multi_label=False
            )
            
            # Get best match
            best_idx = np.argmax(result['scores'])
            confidence = float(result['scores'][best_idx])
            team = result['labels'][best_idx] if confidence >= self.min_confidence else None
            
            return {
                "team": team,
                "confidence": confidence,
                "all_scores": dict(zip(result['labels'], map(float, result['scores'])))
            }
            
        except Exception as e:
            logger.error(f"Error classifying tweet: {str(e)}")
            return {"team": None, "confidence": 0.0, "error": str(e)}

def classify_teams() -> Dict[str, Any]:
    """
    Main function to classify tweets into teams.
    
    Expected input from stdin:
    {
        "controversy": "Bitcoin will hit $100k by end of 2025",
        "teams": ["Will hit $100k", "Won't hit $100k"],
        "tweets": [
            {"id": "1", "text": "...", "author": "username"},
            ...
        ]
    }
    """
    try:
        # Read and parse input
        input_text = sys.stdin.read()
        if not input_text.strip():
            raise ValueError("No input provided")
            
        try:
            data = json.loads(input_text)
            if not isinstance(data, dict) or 'controversy' not in data or 'teams' not in data or 'tweets' not in data:
                raise ValueError("Invalid input format. Expected keys: controversy, teams, tweets")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON input: {str(e)}")
        
        controversy = data['controversy']
        team_labels = data['teams']
        tweets = data['tweets']
        
        if not isinstance(team_labels, list) or len(team_labels) < 2:
            raise ValueError("At least two team labels are required")
            
        if not isinstance(tweets, list):
            raise ValueError("Tweets must be a list")
        
        # Initialize classifier
        classifier = TeamClassifier()
        classifier.load_model()
        
        # Initialize team stats
        team_stats = {team: {
            "count": 0,
            "percentage": 0.0,
            "avg_confidence": 0.0,
            "confidence_sum": 0.0,
            "supporters": []
        } for team in team_labels}
        
        unclassified_count = 0
        
        # Process each tweet
        for tweet in tweets:
            if not isinstance(tweet, dict) or 'text' not in tweet:
                logger.warning("Skipping invalid tweet format")
                continue
                
            tweet_id = str(tweet.get('id', ''))
            author = tweet.get('author', 'unknown')
            text = tweet.get('text', '')
            
            # Classify tweet
            result = classifier.classify_tweet(text, team_labels)
            team = result.get('team')
            confidence = result.get('confidence', 0.0)
            
            # Update team stats
            if team and team in team_stats:
                team_stats[team]["count"] += 1
                team_stats[team]["confidence_sum"] += confidence
                team_stats[team]["supporters"].append({
                    "tweet_id": tweet_id,
                    "author": author,
                    "text": text,
                    "confidence": confidence
                })
            else:
                unclassified_count += 1
        
        # Calculate statistics
        total_classified = sum(stats["count"] for stats in team_stats.values())
        
        # Check for single team dominance
        winning_team = None
        if total_classified > 0:
            for team, stats in team_stats.items():
                stats["percentage"] = stats["count"] / total_classified * 100
                stats["avg_confidence"] = (
                    stats["confidence_sum"] / stats["count"] 
                    if stats["count"] > 0 else 0.0
                )
                # Determine winning team (highest percentage, with confidence > 50%)
                if (stats["percentage"] / 100 >= 0.5 and 
                    (winning_team is None or 
                     stats["percentage"] > team_stats[winning_team]["percentage"])):
                    winning_team = team
            
            # Check for dominance
            if winning_team and team_stats[winning_team]["percentage"] >= 95.0:
                logger.info(f"Single team dominance detected: {winning_team}")
        
        # Clean up supporters list for output (keep only top 100 per team)
        for team in team_stats:
            # Sort supporters by confidence (highest first)
            team_stats[team]["supporters"].sort(key=lambda x: x["confidence"], reverse=True)
            # Keep only top 100 supporters
            team_stats[team]["supporters"] = team_stats[team]["supporters"][:100]
            # Remove confidence_sum from output
            team_stats[team].pop("confidence_sum", None)
        
        # Prepare result
        result = {
            "controversy": controversy,
            "winning_team": winning_team if winning_team else "Undecided",
            "team_stats": team_stats,
            "total_classified": total_classified,
            "unclassified_count": unclassified_count
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in classify_teams: {str(e)}")
        return {
            "error": str(e),
            "controversy": data.get('controversy', '') if 'data' in locals() else 'Unknown',
            "winning_team": "Error",
            "team_stats": {},
            "total_classified": 0,
            "unclassified_count": 0
        }

if __name__ == "__main__":
    try:
        # Import torch here to avoid loading it when the module is imported
        import torch
        
        # Run classification and print result as JSON
        result = classify_teams()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except ImportError as e:
        error_result = {
            "error": f"Required package not found: {str(e)}",
            "solution": "Please install the required packages with: pip install -r requirements.txt"
        }
        print(json.dumps(error_result, ensure_ascii=False, indent=2))
        sys.exit(1)
    except Exception as e:
        error_result = {
            "error": str(e),
            "controversy": "Error",
            "winning_team": "Error",
            "team_stats": {},
            "total_classified": 0,
            "unclassified_count": 0
        }
        print(json.dumps(error_result, ensure_ascii=False, indent=2))
        sys.exit(1)
