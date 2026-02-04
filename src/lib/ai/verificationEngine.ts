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
        case 'high': severityPenalty += 35; break;  // Increased from 30
        case 'medium': severityPenalty += 20; break; // Increased from 15
        case 'low': severityPenalty += 10; break;    // Increased from 8
      }
    });
    
    // Additional penalty for multiple mismatches
    if (mismatches.length > 1) {
      severityPenalty += mismatches.length * 8; // Extra penalty for multiple issues
    }
    
    // Critical field penalties (warranty/return policy is critical for trust)
    const criticalFields = ['price', 'returnPolicy'];
    const criticalMismatches = mismatches.filter(m => criticalFields.includes(m.field));
    if (criticalMismatches.length > 0) {
      severityPenalty += criticalMismatches.length * 15; // Extra penalty for critical fields
    }
    
    // Special penalty for warranty/return policy mismatches (these are trust-breaking)
    const policyMismatches = mismatches.filter(m => m.field === 'returnPolicy');
    if (policyMismatches.length > 0) {
      severityPenalty += 25; // Additional penalty for policy breaches
    }

    const overallScore = Math.max(0, Math.min(100, baseScore - severityPenalty));

    const analysis = this.generateAnalysis(mismatches, overallScore);

    return { mismatches, overallScore, analysis };
  }

  private static arePoliciesSimilar(policy1: string, policy2: string): boolean {
    // Handle exact matches first
    if (policy1 === policy2) return true;
    
    const policy1Lower = policy1.toLowerCase().trim();
    const policy2Lower = policy2.toLowerCase().trim();
    
    // Extract numeric values from policies (warranty months, return days, etc.)
    const extractNumbers = (text: string): number[] => {
      const matches = text.match(/\d+/g);
      return matches ? matches.map(num => parseInt(num)) : [];
    };
    
    const nums1 = extractNumbers(policy1Lower);
    const nums2 = extractNumbers(policy2Lower);
    
    // If both policies contain numbers, compare them strictly
    if (nums1.length > 0 && nums2.length > 0) {
      // For warranty/return policies, the main number should match exactly
      const mainNum1 = Math.max(...nums1); // Get the largest number (usually the warranty period)
      const mainNum2 = Math.max(...nums2);
      
      // Numbers must match exactly for policies
      if (mainNum1 !== mainNum2) {
        return false;
      }
    }
    
    // Handle zero/no warranty cases
    const zeroWarrantyKeywords = ['no warranty', 'no return', 'no refund', '0 month', '0 day', 'zero', 'none'];
    const hasZeroWarranty1 = zeroWarrantyKeywords.some(keyword => policy1Lower.includes(keyword)) || nums1.includes(0);
    const hasZeroWarranty2 = zeroWarrantyKeywords.some(keyword => policy2Lower.includes(keyword)) || nums2.includes(0);
    
    // If one has zero warranty and other doesn't, they're different
    if (hasZeroWarranty1 !== hasZeroWarranty2) {
      return false;
    }
    
    // Check for warranty vs return policy type mismatches
    const warrantyKeywords = ['warranty', 'guarantee', 'coverage'];
    const returnKeywords = ['return', 'refund', 'exchange'];
    
    const isWarranty1 = warrantyKeywords.some(keyword => policy1Lower.includes(keyword));
    const isReturn1 = returnKeywords.some(keyword => policy1Lower.includes(keyword));
    const isWarranty2 = warrantyKeywords.some(keyword => policy2Lower.includes(keyword));
    const isReturn2 = returnKeywords.some(keyword => policy2Lower.includes(keyword));
    
    // If one is warranty and other is return policy, they're different
    if ((isWarranty1 && isReturn2) || (isReturn1 && isWarranty2)) {
      return false;
    }
    
    // For text-based policies without clear numbers, use stricter similarity
    const words1 = policy1Lower.split(/\s+/).filter(word => word.length > 2);
    const words2 = policy2Lower.split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return false;
    
    const commonWords = words1.filter(word => 
      words2.some(word2 => word === word2) // Exact word match only
    );
    
    // Require at least 90% similarity for policies (stricter than before)
    return commonWords.length >= Math.min(words1.length, words2.length) * 0.9;
  }

  private static areDescriptionsSimilar(desc1: string, desc2: string): boolean {
    // Handle exact matches
    if (desc1.toLowerCase().trim() === desc2.toLowerCase().trim()) return true;
    
    const desc1Lower = desc1.toLowerCase();
    const desc2Lower = desc2.toLowerCase();
    
    // Extract and compare numeric values first (critical for warranty/duration)
    const extractNumbers = (text: string): number[] => {
      const matches = text.match(/\d+/g);
      return matches ? matches.map(num => parseInt(num)) : [];
    };
    
    const nums1 = extractNumbers(desc1);
    const nums2 = extractNumbers(desc2);
    
    // Special handling for warranty/duration numbers
    if (nums1.length > 0 && nums2.length > 0) {
      // Get the main warranty/duration number (usually the largest)
      const mainNum1 = Math.max(...nums1);
      const mainNum2 = Math.max(...nums2);
      
      // If warranty numbers differ significantly, it's a mismatch
      if (Math.abs(mainNum1 - mainNum2) > 0) {
        return false;
      }
    }
    
    // Handle cases where one has numbers and other doesn't
    if (nums1.length !== nums2.length) {
      return false;
    }
    
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
    try {
      // Check if Ollama is available (without logging)
      const isOllamaAvailable = await OllamaService.checkOllamaStatus();
      
      if (isOllamaAvailable) {
        // Use Ollama + Mistral for AI analysis
        const aiResponse = await OllamaService.generateVerificationAnalysis({
          promise,
          invoice
        });
        
        const result = OllamaService.parseVerificationResponse(aiResponse);
        return result;
      } else {
        // Fallback to rule-based verification (silently)
        const result = this.performRuleBasedVerification(promise, invoice);
        return result;
      }
    } catch (error: any) {
      // Always fallback to rule-based verification without logging
      return this.performRuleBasedVerification(promise, invoice);
    }
  }
}