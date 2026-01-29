import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '../../../services/auditService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get user from query params or headers (you might want to use JWT/session)
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action') || undefined;
    const sellerName = searchParams.get('sellerName') || undefined; // Changed from sellerId
    const severity = searchParams.get('severity') || undefined;
    
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : undefined;
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : undefined;

    const result = await AuditService.getLogs(userId, {
      page,
      limit,
      action,
      sellerName, // Changed from sellerId
      severity,
      startDate,
      endDate
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { logIds, userId } = body;

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json(
        { error: 'logIds array is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required for audit trail' },
        { status: 400 }
      );
    }

    const result = await AuditService.deleteLogs(logIds, userId);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error deleting audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit logs' },
      { status: 500 }
    );
  }
}