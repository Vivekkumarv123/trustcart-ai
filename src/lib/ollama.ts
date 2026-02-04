interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface VerificationPrompt {
  promise: any;
  invoice: any;
}

export class OllamaService {
  private static readonly OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private static readonly MODEL = 'mistral:latest';

  static async generateVerificationAnalysis(prompt: VerificationPrompt): Promise<string> {
    try {
      const systemPrompt = `You are TrustCart AI, an expert verification system for e-commerce transactions. 
Your job is to compare seller promises with actual invoice data and detect mismatches.

CRITICAL ANALYSIS RULES:
1. Compare each field exactly: price, delivery charges, delivery time, return policy, product description
2. Flag ANY differences, no matter how small
3. Pay special attention to:
   - Numeric differences (even 1 rupee matters)
   - Policy changes (5 days vs 0 days return is CRITICAL)
   - Product description changes (replacement vs repair is MAJOR)
   - Hidden charges or fees
4. Rate severity: HIGH (price, return policy), MEDIUM (delivery), LOW (minor description)
5. Be strict - trust is earned through consistency

Respond in this JSON format:
{
  "mismatches": [
    {
      "field": "fieldName",
      "promised": "value",
      "actual": "value", 
      "severity": "high|medium|low",
      "explanation": "detailed explanation"
    }
  ],
  "overallScore": number_0_to_100,
  "analysis": "detailed analysis with emojis and recommendations"
}`;

      const userPrompt = `SELLER PROMISE:
Price: ₹${prompt.promise.price}
Delivery Charges: ₹${prompt.promise.deliveryCharges}
Delivery Time: ${prompt.promise.deliveryTime}
Return Policy: ${prompt.promise.returnPolicy}
Product Description: ${prompt.promise.productDescription}

ACTUAL INVOICE:
Price: ₹${prompt.invoice.price}
Delivery Charges: ₹${prompt.invoice.deliveryCharges}
Delivery Time: ${prompt.invoice.deliveryTime}
Return Policy: ${prompt.invoice.returnPolicy}
Product Description: ${prompt.invoice.productDescription}

Analyze these for mismatches and provide verification results.`;

      const response = await fetch(`${this.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          prompt: `${systemPrompt}\n\nUSER: ${userPrompt}`,
          stream: false,
          options: {
            temperature: 0.1, // Low temperature for consistent analysis
            top_p: 0.9,
          }
        }),
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error(`Ollama model '${this.MODEL}' not found. Please run: ollama pull ${this.MODEL}`);
        } else if (response.status === 500) {
          throw new Error('Ollama server error. Please check if Ollama is running properly.');
        } else {
          throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
        }
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error: any) {
      // Don't log connection errors as they're expected when Ollama isn't running
      if (!error.message?.includes('fetch failed') && !error.message?.includes('ECONNREFUSED')) {
        console.error('Ollama API error:', error.message);
      }
      throw new Error(`AI verification service unavailable: ${error.message}`);
    }
  }

  static async checkOllamaStatus(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout
      
      const response = await fetch(`${this.OLLAMA_URL}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error: any) {
      // Only log if it's not a connection refused error (which is expected when Ollama isn't running)
      if (!error.message?.includes('ECONNREFUSED') && !error.message?.includes('fetch failed')) {
        console.error('Ollama connection failed:', error);
      }
      return false;
    }
  }

  static parseVerificationResponse(response: string): {
    mismatches: any[];
    overallScore: number;
    analysis: string;
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          mismatches: parsed.mismatches || [],
          overallScore: Math.max(0, Math.min(100, parsed.overallScore || 0)),
          analysis: parsed.analysis || response
        };
      }
      
      // Fallback: treat entire response as analysis
      return {
        mismatches: [],
        overallScore: 50, // Default uncertain score
        analysis: response
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        mismatches: [],
        overallScore: 0,
        analysis: `AI Analysis Error: ${response.substring(0, 500)}...`
      };
    }
  }
}