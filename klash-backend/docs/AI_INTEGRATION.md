# Klash AI Integration Guide

This document provides an overview of the AI components integrated into the Klash platform, including sentiment analysis, team classification, and market resolution.

## Table of Contents
- [AI Models Overview](#ai-models-overview)
- [Python Scripts](#python-scripts)
- [API Endpoints](#api-endpoints)
- [Testing the Integration](#testing-the-integration)
- [Troubleshooting](#troubleshooting)
- [Performance Considerations](#performance-considerations)

## AI Models Overview

### 1. Sentiment Analysis (`sentiment_hf.py`)
- **Model**: ProsusAI/finbert
- **Purpose**: Analyze sentiment of tweets with financial context
- **Output**: Sentiment labels (positive/negative/neutral) with confidence scores
- **Dependencies**: Transformers, Torch, Numpy

### 2. Team Classification (`team_classifier.py`)
- **Model**: facebook/bart-large-mnli
- **Purpose**: Classify tweets into different teams/sides of a controversy
- **Output**: Team assignments with confidence scores
- **Dependencies**: Transformers, Torch, Numpy

### 3. Market Resolution (`market_resolver.py`)
- **Purpose**: Determine market resolution based on sentiment and team classification
- **Input**: Market data and tweet replies
- **Output**: Winning outcome with confidence metrics
- **Dependencies**: sentiment_hf, team_classifier

## Python Scripts

### Directory Structure
```
src/python/
├── sentiment_hf.py      # Sentiment analysis with FinBERT
├── team_classifier.py   # Zero-shot team classification
├── market_resolver.py   # Market resolution logic
└── test_ai.py          # Test script for all AI components
```

### Running Scripts Directly

1. **Sentiment Analysis**
   ```bash
   echo '[{"id":"1","text":"Bitcoin is going to the moon!"}]' | python src/python/sentiment_hf.py
   ```

2. **Team Classification**
   ```bash
   echo '{"controversy":"Is Bitcoin better than Ethereum?","teams":["Bitcoin","Ethereum"],"tweets":[{"id":"1","text":"Bitcoin is the future"}]}' | python src/python/team_classifier.py
   ```

3. **Market Resolution**
   ```bash
   cat market_data.json | python src/python/market_resolver.py
   ```

## API Endpoints

### 1. Analyze Sentiment
```http
POST /twitter/analyze-sentiment
Content-Type: application/json

{
  "tweets": [
    {"id": "1", "text": "Bitcoin is going to the moon!"},
    {"id": "2", "text": "I'm worried about the market crash"}
  ]
}
```

### 2. Classify Teams
```http
POST /twitter/classify-teams
Content-Type: application/json

{
  "controversy": "Is Bitcoin better than Ethereum?",
  "teams": ["Bitcoin", "Ethereum"],
  "tweets": [
    {"id": "1", "text": "Bitcoin is the future"},
    {"id": "2", "text": "Ethereum has better tech"}
  ]
}
```

### 3. Resolve Market
```http
POST /twitter/resolve/market-123
```

## Testing the Integration

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/twitter/twitter.service.spec.ts
```

### Integration Testing
1. Start the NestJS server
2. Use the test script:
   ```bash
   python src/python/test_ai.py
   ```

## Troubleshooting

### Common Issues

1. **Python Dependencies**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # If using a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Model Loading Issues**
   - Check internet connection for model downloads
   - Verify sufficient disk space for model weights
   - Set `HF_HOME` environment variable for custom cache location

3. **Performance Problems**
   - Enable GPU acceleration if available
   - Reduce batch size for large datasets
   - Use `fp16` for faster inference on compatible hardware

## Performance Considerations

### Model Optimization
- Quantize models for production
- Use ONNX runtime for better performance
- Implement model caching

### Scaling
- Use a job queue (e.g., Bull, RabbitMQ) for processing
- Implement request rate limiting
- Consider model serving solutions (TorchServe, TensorFlow Serving)

### Monitoring
- Track API response times
- Monitor GPU/CPU usage
- Log model inference metrics

## Security Considerations

- Validate all input data
- Implement API authentication
- Rate limit endpoints
- Sanitize outputs to prevent XSS

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
