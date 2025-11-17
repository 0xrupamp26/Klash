import sys
import json
from textblob import TextBlob
from typing import List, Dict, Any, Tuple
import spacy

# Load the English language model
nlp = spacy.load("en_core_web_sm")

def preprocess_text(text: str) -> str:
    """Preprocess text for sentiment analysis"""
    # Remove URLs, mentions, and special characters
    doc = nlp(text)
    tokens = [token.lemma_.lower() for token in doc 
              if not token.is_stop and not token.is_punct 
              and not token.like_url and not token.like_email]
    return " ".join(tokens)

def analyze_sentiment(text: str) -> Tuple[float, float]:
    """Analyze sentiment of a single text"""
    # Preprocess text
    processed_text = preprocess_text(text)
    
    # Get sentiment using TextBlob
    blob = TextBlob(processed_text)
    
    # Polarity: -1 (negative) to 1 (positive)
    # Subjectivity: 0 (objective) to 1 (subjective)
    return blob.sentiment.polarity, blob.sentiment.subjectivity

def process_tweets(tweets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Process multiple tweets and return aggregated sentiment analysis"""
    if not tweets:
        return {
            "outcome": "NEUTRAL",
            "avg_polarity": 0.0,
            "avg_subjectivity": 0.0,
            "sample_size": 0,
            "sentiments": []
        }
    
    sentiments = []
    total_polarity = 0.0
    total_subjectivity = 0.0
    
    for tweet in tweets:
        text = tweet.get('text', '')
        polarity, subjectivity = analyze_sentiment(text)
        
        sentiments.append({
            "tweet_id": tweet.get('id', ''),
            "polarity": polarity,
            "subjectivity": subjectivity
        })
        
        total_polarity += polarity
        total_subjectivity += subjectivity
    
    avg_polarity = total_polarity / len(tweets)
    avg_subjectivity = total_subjectivity / len(tweets)
    
    # Determine overall outcome
    if avg_polarity > 0.3:
        outcome = "POSITIVE"
    elif avg_polarity < -0.3:
        outcome = "NEGATIVE"
    else:
        outcome = "NEUTRAL"
    
    return {
        "outcome": outcome,
        "avg_polarity": round(avg_polarity, 4),
        "avg_subjectivity": round(avg_subjectivity, 4),
        "sample_size": len(tweets),
        "sentiments": sentiments
    }

def main():
    # Read tweets from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data.strip():
            print(json.dumps({
                "error": "No input data provided"
            }), file=sys.stderr)
            sys.exit(1)
            
        tweets = json.loads(input_data)
        if not isinstance(tweets, list):
            tweets = [tweets]
            
        result = process_tweets(tweets)
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            "error": f"Invalid JSON input: {str(e)}"
        }), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "error": f"Error processing tweets: {str(e)}"
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
