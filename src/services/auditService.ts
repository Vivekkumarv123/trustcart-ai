import dbConnect from '../lib/mongodb';
import AuditLog, { IAuditLog } from '../lib/models/AuditLog';

export class AuditService {
  static async log(
    action: IAuditLog['action'],
    details: any,
    options: {
      userId?: string;
      sellerId?: string;
      verificationId?: string;
      severity?: IAuditLog['severity'];
      userAgent?: string;
      ipAddress?: string;
      aiModel?: string;
      processingTime?: number;
    } = {}
  ): Promise<string> {
    try {
      await dbConnect();

      const auditLog = new AuditLog({
        action,
        userId: options.userId,
        sellerId: options.sellerId,
        verificationId: options.verificationId,
        details,
        metadata: {
          userAgent: options.userAgent,
          ipAddress: options.ipAddress,
          timestamp: new Date(),
          aiModel: options.aiModel,
          processingTime: options.processingTime
        },
        severity: options.severity || 'info',
        immutable: true
      });

      await auditLog.save();
      return auditLog._id.toString();
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging should not break main functionality
      return '';
    }
  }

  static async getLogs(
    userId: string, // Make logs user-specific
    options: {
      page?: number;
      limit?: number;
      action?: string;
      sellerName?: string; // Changed from sellerId to sellerName
      severity?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{
    logs: IAuditLog[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      await dbConnect();

      const page = Math.max(1, options.page || 1);
      const limit = Math.min(100, Math.max(1, options.limit || 20));
      const skip = (page - 1) * limit;

      // Build query - always filter by userId
      const query: any = { userId };
      
      if (options.action) query.action = options.action;
      if (options.severity) query.severity = options.severity;
      
      // Search by seller name in details
      if (options.sellerName) {
        query['details.sellerName'] = { 
          $regex: options.sellerName, 
          $options: 'i' // case insensitive
        };
      }
      
      if (options.startDate || options.endDate) {
        query.createdAt = {};
        if (options.startDate) query.createdAt.$gte = options.startDate;
        if (options.endDate) query.createdAt.$lte = options.endDate;
      }

      // Execute queries
      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditLog.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        logs,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return {
        logs: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };
    }
  }

  static async deleteLogs(logIds: string[], userId: string): Promise<{
    deleted: number;
    errors: string[];
  }> {
    try {
      await dbConnect();

      const results = {
        deleted: 0,
        errors: [] as string[]
      };

      for (const logId of logIds) {
        try {
          const result = await AuditLog.deleteOne({ _id: logId });
          if (result.deletedCount > 0) {
            results.deleted++;
            
            // Log the deletion action
            await this.log('system_error', {
              action: 'audit_log_deleted',
              deletedLogId: logId,
              deletedBy: userId,
              reason: 'Manual deletion'
            }, {
              userId,
              severity: 'warning'
            });
          } else {
            results.errors.push(`Log ${logId} not found`);
          }
        } catch (error) {
          results.errors.push(`Failed to delete log ${logId}: ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to delete audit logs:', error);
      return {
        deleted: 0,
        errors: ['Failed to delete logs: ' + error.message]
      };
    }
  }

  static async getLogStats(userId: string): Promise<{
    totalLogs: number;
    logsByAction: { [key: string]: number };
    logsBySeverity: { [key: string]: number };
    recentActivity: number; // logs in last 24 hours
  }> {
    try {
      await dbConnect();

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [
        totalLogs,
        actionStats,
        severityStats,
        recentActivity
      ] = await Promise.all([
        AuditLog.countDocuments({ userId }),
        AuditLog.aggregate([
          { $match: { userId } },
          { $group: { _id: '$action', count: { $sum: 1 } } }
        ]),
        AuditLog.aggregate([
          { $match: { userId } },
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]),
        AuditLog.countDocuments({ userId, createdAt: { $gte: yesterday } })
      ]);

      const logsByAction = actionStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const logsBySeverity = severityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      return {
        totalLogs,
        logsByAction,
        logsBySeverity,
        recentActivity
      };
    } catch (error) {
      console.error('Failed to get log stats:', error);
      return {
        totalLogs: 0,
        logsByAction: {},
        logsBySeverity: {},
        recentActivity: 0
      };
    }
  }
}