import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
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

    return NextResponse.json({
      success: true,
      database: {
        status: stateMap[dbState] || 'unknown',
        connectionTime: `${connectionTime}ms`,
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database: {
        status: 'error',
        connectionTime: 'timeout'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}