import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { OllamaChecker } from '../../../utils/ollamaChecker';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test database connection with timeout
    const connectPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    const connectionTime = Date.now() - startTime;
    const dbState = mongoose.connection.readyState;
    
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Check Ollama status with detailed diagnostics
    const ollamaStartTime = Date.now();
    const ollamaStatus = await OllamaChecker.checkStatus();
    const ollamaResponseTime = Date.now() - ollamaStartTime;

    return NextResponse.json({
      success: true,
      database: {
        status: stateMap[dbState] || 'unknown',
        connectionTime: `${connectionTime}ms`,
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown'
      },
      ollama: {
        available: ollamaStatus.isRunning && ollamaStatus.hasModel,
        isRunning: ollamaStatus.isRunning,
        hasModel: ollamaStatus.hasModel,
        responseTime: `${ollamaResponseTime}ms`,
        url: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: 'mistral:latest',
        error: ollamaStatus.error,
        suggestion: ollamaStatus.suggestion,
        setupInstructions: ollamaStatus.error ? OllamaChecker.getSetupInstructions() : undefined
      },
      verification: {
        mode: (ollamaStatus.isRunning && ollamaStatus.hasModel) ? 'ai-powered' : 'rule-based',
        fallbackEnabled: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database: {
        status: 'error',
        connectionTime: 'timeout'
      },
      ollama: {
        available: false,
        error: 'Health check failed'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}