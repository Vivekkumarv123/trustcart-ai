# Ollama + Mistral Setup Guide

## 🚀 Quick Setup

### 1. Install Ollama

**Windows:**
```bash
# Download and install from https://ollama.ai/download
# Or use winget
winget install Ollama.Ollama
```

**macOS:**
```bash
# Download from https://ollama.ai/download
# Or use Homebrew
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama Service

```bash
# Start Ollama (runs on http://localhost:11434)
ollama serve
```

### 3. Pull Mistral Model

```bash
# Download Mistral 7B model (~4GB)
ollama pull mistral:latest

# Or use a smaller model for testing
ollama pull mistral:7b-instruct
```

### 4. Test Ollama

```bash
# Test the installation
curl http://localhost:11434/api/tags

# Test Mistral model
ollama run mistral:latest "Hello, how are you?"
```

## 🔧 Configuration

The TrustCart AI system will automatically:
- ✅ **Detect Ollama availability** at startup
- ✅ **Use Mistral for AI verification** when available
- ✅ **Fallback to rule-based verification** if Ollama is down
- ✅ **Log all AI interactions** in audit logs

## 📊 Model Performance

**Mistral 7B:**
- **Size**: ~4GB
- **RAM**: 8GB+ recommended
- **Speed**: ~2-5 seconds per verification
- **Quality**: High accuracy for mismatch detection

**Alternative Models:**
```bash
# Lighter models for lower-end hardware
ollama pull mistral:7b-instruct-q4_0  # ~2.2GB
ollama pull llama2:7b                 # ~3.8GB

# Larger models for better accuracy
ollama pull mistral:8x7b              # ~26GB
```

## 🛠️ Troubleshooting

### Ollama Not Starting
```bash
# Check if port 11434 is in use
netstat -an | grep 11434

# Kill existing Ollama processes
pkill ollama

# Restart Ollama
ollama serve
```

### Model Download Issues
```bash
# Check available models
ollama list

# Re-download if corrupted
ollama rm mistral:latest
ollama pull mistral:latest
```

### Performance Issues
```bash
# Monitor Ollama logs
ollama logs

# Check system resources
htop  # Linux/macOS
taskmgr  # Windows
```

## 🔍 Verification Process

With Ollama + Mistral, TrustCart AI will:

1. **Send structured prompts** to Mistral with promise vs invoice data
2. **Get JSON responses** with detected mismatches and scores
3. **Parse and validate** AI responses
4. **Log all interactions** for audit trail
5. **Fallback gracefully** if AI fails

## 📈 Expected Improvements

**Before (Rule-based):**
- ❌ Simple text matching
- ❌ Limited context understanding
- ❌ Fixed scoring rules

**After (AI-powered):**
- ✅ **Semantic understanding** of promises vs reality
- ✅ **Context-aware analysis** of product descriptions
- ✅ **Nuanced scoring** based on severity
- ✅ **Better fraud detection** with natural language processing

## 🎯 Example AI Analysis

**Input:**
- Promise: "5 day return policy, replacement warranty"
- Invoice: "0 day return, repair warranty"

**Mistral Output:**
```json
{
  "mismatches": [
    {
      "field": "returnPolicy",
      "promised": "5 day return policy",
      "actual": "0 day return",
      "severity": "high",
      "explanation": "Return policy changed from 5 days to no returns - major breach of promise"
    },
    {
      "field": "productDescription", 
      "promised": "replacement warranty",
      "actual": "repair warranty",
      "severity": "medium",
      "explanation": "Warranty type downgraded from replacement to repair only"
    }
  ],
  "overallScore": 35,
  "analysis": "🚨 CRITICAL ISSUES DETECTED: Seller has significantly altered both return policy and warranty terms. This represents a major breach of trust. Recommendation: Contact seller immediately or avoid transaction."
}
```

## 🔒 Security & Privacy

- ✅ **Local processing** - No data sent to external APIs
- ✅ **Audit logging** - All AI interactions logged
- ✅ **Fallback system** - Always works even without AI
- ✅ **Data sanitization** - Sensitive data filtered from logs

Start Ollama and enjoy AI-powered verification! 🎉