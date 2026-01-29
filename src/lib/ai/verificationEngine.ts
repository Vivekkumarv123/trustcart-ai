import { IPromise, IInvoice, IMismatch } from '../models/Verification';
import { OllamaService } from '../ollama';
import { AuditService } from '../../services/auditService';

export class VerificationEngine {
  // Rule-based verification as fallback
  static performRuleBasedVerification(promise: IPromise, invoice: IInvoice): {
    mismatches: IMismatch[];
    overallScore: number;
    analysis: string;
  } {
    const mismatches: IMismatch[] = [];

    // Price verification
    if (Math.abs(promise.price - invoice.price) > 0.01) {
      mismatches.push({
        field: 'price',
        promised: promise.price,
        actual: invoice.price,
        severity: 'high',
        explanation: `Price mismatch: Promised ₹${promise.price} but invoice shows ₹${invoice.price}`
      });
    }

    // Delivery charges verification
    if (Math.abs(promise.deliveryCharges - invoice.deliveryCharges) > 0.01) {
      mismatches.push({
        field: 'deliveryCharges',
        promised: promise.deliveryCharges,
        actual: invoice.deliveryCharges,
        severity: 'medium',
        explanation: `Delivery charges mismatch: Promised ₹${promise.deliveryCharges} but invoice shows ₹${invoice.deliveryCharges}`
      });
    }

    // Delivery time verification
    if (promise.deliveryTime.toLowerCase() !== invoice.deliveryTime.toLowerCase()) {
      mismatches.push({
        field: 'deliveryTime',
        promised: promise.deliveryTime,
        actual: invoice.deliveryTime,
        severity: 'medium',
        explanation: `Delivery time mismatch: Promised "${promise.deliveryTime}" but invoice shows "${invoice.deliveryTime}"`
      });
    }

    // Return policy verification
    const promisePolicy = promise.returnPolicy.toLowerCase().trim();
    const invoicePolicy = invoice.returnPolicy.toLowerCase().trim();
    
    if (!this.arePoliciesSimilar(promisePolicy, invoicePolicy)) {
      mismatches.push({
        field: 'returnPolicy',
        promised: promise.returnPolicy,
        actual: invoice.returnPolicy,
        severity: 'high',
        explanation: `Return policy mismatch: Promised "${promise.returnPolicy}" but invoice shows "${invoice.returnPolicy}"`
      });
    }

    // Product description verification
    if (!this.areDescriptionsSimilar(promise.productDescription, invoice.productDescription)) {
      mismatches.push({
        field: 'productDescription',
        promised: promise.productDescription,
        actual: invoice.productDescription,
        severity: 'low',
        explanation: `Product description differs between promise and invoice`
      });
    }

    // Calculate overall score with improved algorithm
    const totalFields = 5;
    const mismatchedFields = mismatches.length;
    
    // Start with base score
    let baseScore = ((totalFields - mismatchedFields) / totalFields) * 100;
    
    // Apply severity penalties (more aggressive)
    let severityPenalty = 0;
    mismatches.forEach(mismatch => {
      switch (mismatch.severity) {
        case 'high': severityPenalty += 30; break;  // Increased from 20
        case 'medium': severityPenalty += 15; break; // Increased from 10
        case 'low': severityPenalty += 8; break;    // Increased from 5
      }
    });
    
    // Additional penalty for multiple mismatches
    if (mismatches.length > 1) {
      severityPenalty += mismatches.length * 5; // Extra penalty for multiple issues
    }
    
    // Critical field penalties
    const criticalFields = ['price', 'returnPolicy'];
    const criticalMismatches = mismatches.filter(m => criticalFields.includes(m.field));
    if (criticalMismatches.length > 0) {
      severityPenalty += criticalMismatches.length * 10; // Extra penalty for critical fields
    }

    const overallScore = Math.max(0, Math.min(100, baseScore - severityPenalty));

    const analysis = this.generateAnalysis(mismatches, overallScore);

    return { mismatches, overallScore, analysis };
  }

  private static arePoliciesSimilar(policy1: string, policy2: string): boolean {
    // Handle exact matches first
    if (policy1 === policy2) return true;
    
    // Handle numeric policies (like "5" vs "0" days)
    const num1 = parseFloat(policy1);
    const num2 = parseFloat(policy2);
    
    // If both are numbers, they must be exactly equal
    if (!isNaN(num1) && !isNaN(num2)) {
      return num1 === num2;
    }
    
    // Handle "no return" vs numeric policies
    const noReturnKeywords = ['no', 'none', '0', 'zero', 'not', 'non'];
    const policy1Lower = policy1.toLowerCase();
    const policy2Lower = policy2.toLowerCase();
    
    const isPolicy1NoReturn = noReturnKeywords.some(keyword => policy1Lower.includes(keyword));
    const isPolicy2NoReturn = noReturnKeywords.some(keyword => policy2Lower.includes(keyword));
    
    // If one is "no return" and other is a positive number, they're different
    if (isPolicy1NoReturn !== isPolicy2NoReturn) {
      return false;
    }
    
    // For text-based policies, use stricter similarity
    const keywords1 = policy1Lower.split(/\s+/).filter(word => word.length > 2);
    const keywords2 = policy2Lower.split(/\s+/).filter(word => word.length > 2);
    
    if (keywords1.length === 0 || keywords2.length === 0) return false;
    
    const commonKeywords = keywords1.filter(word => 
      keywords2.some(word2 => word2.includes(word) || word.includes(word2))
    );
    
    // Require at least 80% similarity for policies
    return commonKeywords.length >= Math.min(keywords1.length, keywords2.length) * 0.8;
  }

  private static areDescriptionsSimilar(desc1: string, desc2: string): boolean {
    // Handle exact matches
    if (desc1.toLowerCase().trim() === desc2.toLowerCase().trim()) return true;
    
    const desc1Lower = desc1.toLowerCase();
    const desc2Lower = desc2.toLowerCase();
    
    // Check for critical word differences that indicate different products/services
    const criticalDifferences = [
      ['replacement', 'repair'],
      ['new', 'used'],
      ['original', 'duplicate'],
      ['warranty', 'guarantee'],
      ['free', 'paid'],
      ['unlimited', 'limited'],
      ['premium', 'basic'],
      ['professional', 'standard']
    ];
    
    // If critical words differ, it's a mismatch
    for (const [word1, word2] of criticalDifferences) {
      const hasWord1InDesc1 = desc1Lower.includes(word1);
      const hasWord2InDesc1 = desc1Lower.includes(word2);
      const hasWord1InDesc2 = desc2Lower.includes(word1);
      const hasWord2InDesc2 = desc2Lower.includes(word2);
      
      // If one description has word1 and the other has word2, it's a critical difference
      if ((hasWord1InDesc1 && hasWord2InDesc2) || (hasWord2InDesc1 && hasWord1InDesc2)) {
        return false;
      }
    }
    
    // For general similarity, use stricter matching
    const words1 = desc1Lower.split(/\s+/).filter(word => word.length > 2);
    const words2 = desc2Lower.split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return false;
    
    const commonWords = words1.filter(word => 
      words2.some(word2 => word2.includes(word) || word.includes(word2))
    );
    
    // Require at least 70% similarity for descriptions
    return commonWords.length >= Math.min(words1.length, words2.length) * 0.7;
  }

  private static generateAnalysis(mismatches: IMismatch[], score: number): string {
    if (mismatches.length === 0) {
      return "✅ Perfect match! All seller promises align with the invoice. This seller demonstrates high trustworthiness.";
    }

    let analysis = `🔍 Verification completed with ${mismatches.length} mismatch(es) found:\n\n`;
    
    // Group mismatches by severity
    const highSeverity = mismatches.filter(m => m.severity === 'high');
    const mediumSeverity = mismatches.filter(m => m.severity === 'medium');
    const lowSeverity = mismatches.filter(m => m.severity === 'low');
    
    // Report high severity issues first
    if (highSeverity.length > 0) {
      analysis += "🚨 CRITICAL ISSUES:\n";
      highSeverity.forEach(mismatch => {
        analysis += `   • ${mismatch.explanation}\n`;
      });
      analysis += "\n";
    }
    
    // Report medium severity issues
    if (mediumSeverity.length > 0) {
      analysis += "⚠️ MODERATE CONCERNS:\n";
      mediumSeverity.forEach(mismatch => {
        analysis += `   • ${mismatch.explanation}\n`;
      });
      analysis += "\n";
    }
    
    // Report low severity issues
    if (lowSeverity.length > 0) {
      analysis += "ℹ️ MINOR DISCREPANCIES:\n";
      lowSeverity.forEach(mismatch => {
        analysis += `   • ${mismatch.explanation}\n`;
      });
      analysis += "\n";
    }

    analysis += `📊 Overall Trust Score: ${score.toFixed(1)}/100\n\n`;
    
    // More detailed trust assessment
    if (score >= 90) {
      analysis += "✅ EXCELLENT - Minimal discrepancies, highly trustworthy seller";
    } else if (score >= 80) {
      analysis += "✅ GOOD - Minor issues detected, generally trustworthy";
    } else if (score >= 70) {
      analysis += "⚠️ FAIR - Some concerns identified, proceed with caution";
    } else if (score >= 50) {
      analysis += "⚠️ POOR - Multiple issues detected, high risk transaction";
    } else {
      analysis += "🚨 CRITICAL - Significant mismatches found, avoid this seller";
    }
    
    // Add recommendation based on critical issues
    if (highSeverity.length > 0) {
      analysis += "\n\n🔴 RECOMMENDATION: Contact seller to clarify discrepancies before proceeding.";
    }

    return analysis;
  }

  // AI-powered verification using Ollama + Mistral
  static async performAIVerification(
    promise: IPromise, 
    invoice: IInvoice,
    options: {
      userId?: string;
      sellerId?: string;
      verificationId?: string;
    } = {}
  ): Promise<{
    mismatches: IMismatch[];
    overallScore: number;
    analysis: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Log verification start
      await AuditService.log('ai_analysis', {
        action: 'verification_started',
        promise: {
          price: promise.price,
          deliveryCharges: promise.deliveryCharges,
          deliveryTime: promise.deliveryTime,
          returnPolicy: promise.returnPolicy,
          productDescription: promise.productDescription.substring(0, 200) // Truncate for logging
        },
        invoice: {
          price: invoice.price,
          deliveryCharges: invoice.deliveryCharges,
          deliveryTime: invoice.deliveryTime,
          returnPolicy: invoice.returnPolicy,
          productDescription: invoice.productDescription.substring(0, 200)
        }
      }, {
        userId: options.userId,
        sellerId: options.sellerId,
        verificationId: options.verificationId,
        severity: 'info',
        aiModel: 'mistral:latest'
      });

      // Check if Ollama is available
      const isOllamaAvailable = await OllamaService.checkOllamaStatus();
      
      if (isOllamaAvailable) {
        // Use Ollama + Mistral for AI analysis
        const aiResponse = await OllamaService.generateVerificationAnalysis({
          promise,
          invoice
        });
        
        const result = OllamaService.parseVerificationResponse(aiResponse);
        const processingTime = Date.now() - startTime;
        
        // Log successful AI analysis
        await AuditService.log('ai_analysis', {
          action: 'ai_verification_completed',
          aiModel: 'mistral:latest',
          processingTime,
          result: {
            mismatchCount: result.mismatches.length,
            overallScore: result.overallScore,
            analysisLength: result.analysis.length
          },
          rawResponse: aiResponse.substring(0, 500) // Truncate for logging
        }, {
          userId: options.userId,
          sellerId: options.sellerId,
          verificationId: options.verificationId,
          severity: result.overallScore < 50 ? 'warning' : 'info',
          aiModel: 'mistral:latest',
          processingTime
        });
        
        return result;
      } else {
        // Fallback to rule-based verification
        console.warn('Ollama unavailable, falling back to rule-based verification');
        
        const result = this.performRuleBasedVerification(promise, invoice);
        const processingTime = Date.now() - startTime;
        
        // Log fallback usage
        await AuditService.log('ai_analysis', {
          action: 'fallback_verification_used',
          reason: 'ollama_unavailable',
          processingTime,
          result: {
            mismatchCount: result.mismatches.length,
            overallScore: result.overallScore
          }
        }, {
          userId: options.userId,
          sellerId: options.sellerId,
          verificationId: options.verificationId,
          severity: 'warning',
          processingTime
        });
        
        return result;
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Log error and fallback
      await AuditService.log('system_error', {
        action: 'ai_verification_failed',
        error: error.message,
        processingTime,
        fallbackUsed: true
      }, {
        userId: options.userId,
        sellerId: options.sellerId,
        verificationId: options.verificationId,
        severity: 'error',
        processingTime
      });
      
      console.error('AI verification failed, using rule-based fallback:', error);
      return this.performRuleBasedVerification(promise, invoice);
    }
  }
}