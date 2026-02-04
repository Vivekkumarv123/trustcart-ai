import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import AuditLog from '../../../../lib/models/AuditLog';

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    // Delete all verification_started logs since we only want verification_completed
    const result = await AuditLog.deleteMany({ 
      action: 'verification_started' 
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} verification_started audit logs`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('Error purging verification_started logs:', error);
    return NextResponse.json(
      { error: 'Failed to purge logs' },
      { status: 500 }
    );
  }
}