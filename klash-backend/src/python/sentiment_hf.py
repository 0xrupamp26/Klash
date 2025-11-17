#!/usr/bin/env python3
"""
Hugging Face FinBERT-based sentiment analysis for crypto tweets.
Uses ProsusAI/finbert model for financial sentiment analysis.
"""

import sys
import json
import logging
import io
from typing import List, Dict, Any, Tuple, Optional
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import pipeline

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
MODEL_NAME = "ProsusAI/finbert"
MAX_LENGTH = 512  # Max sequence length for BERT models
DEVICE = 0 if torch.cuda.is_available() else -1  # Use GPU if available

class SentimentAnalyzer:
    """Wrapper for Hugging Face sentiment analysis model."""
    
    def __init__(self):
        """Initialize the sentiment analyzer with FinBERT model."""
        self.model = None
        self.tokenizer = None
        self.classifier = None
        self.labels = ["positive", "negative", "neutral"]
        
    def load_model(self):
        """Load the FinBERT model and tokenizer."""
        try:
            logger.info("Loading FinBERT model and tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
            self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
            # Create sentiment analysis pipeline
            self.classifier = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if torch.cuda.is_available() else -1,
                top_k=1  # Use top_k instead of return_all_scores
            )
            logger.info("FinBERT model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess text for sentiment analysis."""
        # Truncate to max length while preserving whole words if possible
        if len(text) > MAX_LENGTH:
            text = text[:MAX_LENGTH].rsplit(' ', 1)[0] + '...'
        return text.strip()
    
    def predict_sentiment(self, text: str) -> Dict[str, Any]:
        """Predict sentiment for a single text."""
        if not self.classifier:
            self.load_model()
            
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            # Get predictions
            predictions = self.classifier(processed_text)
            
            # Process predictions
            detailed_results = []
            total_polarity = 0.0
            total_confidence = 0.0
            
            for pred in predictions:
                # Handle single prediction case
                if not isinstance(pred, list):
                    pred = [pred]
                    
                # Get the first prediction (highest confidence)
                if len(pred) > 0:
                    pred = pred[0]
                    
                    sentiment = pred['label'].lower()
                    confidence = float(pred['score'])
                    
                    # Convert sentiment to polarity (-1 to 1)
                    if 'pos' in sentiment:
                        polarity = 1.0
                    elif 'neg' in sentiment:
                        polarity = -1.0
                    else:  # neutral or unknown
                        polarity = 0.0
                        
                    total_polarity += polarity * confidence
                    total_confidence += confidence
                    
                    detailed_results.append({
                        'text': processed_text,
                        'sentiment': sentiment,
                        'confidence': confidence,
                        'polarity': polarity
                    })
                    
            # Calculate averages
            sample_size = len(detailed_results)
            if sample_size == 0:
                raise ValueError("No valid tweets to analyze")
                
            avg_polarity = total_polarity / sample_size
            avg_confidence = total_confidence / sample_size
            
            # Determine overall outcome
            if avg_polarity > 0.3:
                outcome = "POSITIVE"
            elif avg_polarity < -0.3:
                outcome = "NEGATIVE"
            else:
                outcome = "NEUTRAL"
            
            # Return final result
            return {
                "outcome": outcome,
                "avg_polarity": float(avg_polarity),
                "avg_confidence": float(avg_confidence),
                "sample_size": sample_size,
                "detailed_sentiments": detailed_results
            }
            
        except Exception as e:
            logger.error(f"Error in sentiment prediction: {str(e)}")
            # Return neutral sentiment in case of errors
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "polarity": 0.0
            }

def analyze_sentiment_hf() -> Dict[str, Any]:
    """
    Main function to analyze sentiment of tweets from stdin.
    
    Expected input: JSON array of tweets via stdin
    Returns: JSON with sentiment analysis results
    """
    try:
        # Read input from stdin
        input_text = sys.stdin.read()
        if not input_text.strip():
            raise ValueError("No input provided")
            
        # Parse JSON input
        try:
            tweets = json.loads(input_text)
            if not isinstance(tweets, list):
                raise ValueError("Input must be a JSON array of tweets")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON input: {str(e)}")
        
        # Initialize analyzer
        analyzer = SentimentAnalyzer()
        analyzer.load_model()
        
        # Process each tweet
        results = []
        total_polarity = 0.0
        total_confidence = 0.0
        
        for tweet in tweets:
            if not isinstance(tweet, dict) or 'text' not in tweet:
                logger.warning("Skipping invalid tweet format")
                continue
                
            tweet_id = tweet.get('id', 'unknown')
            text = tweet.get('text', '')
            
            if not text.strip():
                continue
                
            # Get sentiment prediction
            sentiment_result = analyzer.predict_sentiment(text)
            
            # Add to results
            result = {
                "tweet_id": tweet_id,
                "text": text,
                **sentiment_result
            }
            results.append(result)
            
            # Update aggregates
            total_polarity += sentiment_result["polarity"]
            total_confidence += sentiment_result["confidence"]
        
        # Calculate averages
        sample_size = len(results)
        if sample_size == 0:
            raise ValueError("No valid tweets to analyze")
            
        avg_polarity = total_polarity / sample_size
        avg_confidence = total_confidence / sample_size
        
        # Determine overall outcome
        if avg_polarity > 0.3:
            outcome = "POSITIVE"
        elif avg_polarity < -0.3:
            outcome = "NEGATIVE"
        else:
            outcome = "NEUTRAL"
        
        # Return final result
        return {
            "outcome": outcome,
            "avg_polarity": float(avg_polarity),
            "avg_confidence": float(avg_confidence),
            "sample_size": sample_size,
            "detailed_sentiments": results
        }
        
    except Exception as e:
        logger.error(f"Error in analyze_sentiment_hf: {str(e)}")
        return {
            "error": str(e),
            "outcome": "ERROR",
            "avg_polarity": 0.0,
            "avg_confidence": 0.0,
            "sample_size": 0,
            "detailed_sentiments": []
        }

if __name__ == "__main__":
    try:
        # Run analysis and print result as JSON
        result = analyze_sentiment_hf()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        error_result = {
            "error": str(e),
            "outcome": "ERROR",
            "avg_polarity": 0.0,
            "avg_confidence": 0.0,
            "sample_size": 0,
            "detailed_sentiments": []
        }
        print(json.dumps(error_result, ensure_ascii=False, indent=2))
        sys.exit(1)
