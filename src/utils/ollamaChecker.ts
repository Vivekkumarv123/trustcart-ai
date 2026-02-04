/**
 * Ollama Setup Checker Utility
 * Helps diagnose Ollama connection and setup issues
 */

export interface OllamaStatus {
  isRunning: boolean;
  hasModel: boolean;
  error?: string;
  suggestion?: string;
}

export class OllamaChecker {
  private static readonly OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private static readonly MODEL = 'mistral:latest';

  static async checkStatus(): Promise<OllamaStatus> {
    try {
      // Check if Ollama is running
      const response = await fetch(`${this.OLLAMA_URL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });

      if (!response.ok) {
        return {
          isRunning: false,
          hasModel: false,
          error: `Ollama server returned ${response.status}`,
          suggestion: 'Check if Ollama is running: ollama serve'
        };
      }

      const data = await response.json();
      const models = data.models || [];
      const hasModel = models.some((model: any) => 
        model.name === this.MODEL || model.name.startsWith('mistral')
      );

      if (!hasModel) {
        return {
          isRunning: true,
          hasModel: false,
          error: `Model '${this.MODEL}' not found`,
          suggestion: `Install the model: ollama pull ${this.MODEL}`
        };
      }

      return {
        isRunning: true,
        hasModel: true
      };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          isRunning: false,
          hasModel: false,
          error: 'Connection timeout',
          suggestion: 'Check if Ollama is running and accessible'
        };
      }

      if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
        return {
          isRunning: false,
          hasModel: false,
          error: 'Connection refused',
          suggestion: 'Start Ollama: ollama serve'
        };
      }

      return {
        isRunning: false,
        hasModel: false,
        error: error.message,
        suggestion: 'Check Ollama installation and configuration'
      };
    }
  }

  static getSetupInstructions(): string[] {
    return [
      '1. Install Ollama: https://ollama.ai/download',
      '2. Start Ollama: ollama serve',
      '3. Install Mistral model: ollama pull mistral:latest',
      '4. Test: curl http://localhost:11434/api/tags'
    ];
  }
}