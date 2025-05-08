/**
 * Barcode matching utilities for wine collection app
 * 
 * This file contains functions for comparing and matching barcodes,
 * including fuzzy matching to handle scanning variations.
 */

import { Wine } from '../context/types';

// Debugging flag - set to true to enable detailed logging
const DEBUG_BARCODE = true;

/**
 * Get database configuration based on environment variables
 */
export function getDatabaseConfig() {
  const dbType = process.env.REACT_APP_DB_TYPE || 'indexeddb'; // Default to IndexedDB if not specified
  const config = {
    type: dbType,
    host: process.env.REACT_APP_DB_HOST || 'localhost',
    port: process.env.REACT_APP_DB_PORT || (dbType === 'postgres' ? '5432' : '3306'),
    username: process.env.REACT_APP_DB_USERNAME || '',
    password: process.env.REACT_APP_DB_PASSWORD || '',
    database: process.env.REACT_APP_DB_NAME || 'wine_collection',
    useIndexedDB: dbType === 'indexeddb'
  };
  
  console.log(`[DB CONFIG] Using database type: ${config.type}`);
  return config;
}

/**
 * Check if two barcodes match exactly
 */
export function exactBarcodeMatch(barcode1: string, barcode2: string): boolean {
  return barcode1 === barcode2;
}

/**
 * Check if one barcode contains the other (handles truncated or prefixed scans)
 */
export function containerBarcodeMatch(barcode1: string, barcode2: string): boolean {
  if (!barcode1 || !barcode2) return false;
  
  // Check if one barcode contains the other completely
  if (barcode1.includes(barcode2) || barcode2.includes(barcode1)) {
    // If one is clearly a longer version of the other
    if (Math.abs(barcode1.length - barcode2.length) >= 3) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate similarity score between two barcodes (0-1.0)
 */
export function calculateBarcodeSimilarity(barcode1: string, barcode2: string): number {
  if (!barcode1 || !barcode2) return 0;
  
  // Use the shorter string as reference length
  const minLength = Math.min(barcode1.length, barcode2.length);
  let matchCount = 0;
  
  // Compare digits at each position up to the length of the shorter string
  for (let i = 0; i < minLength; i++) {
    if (barcode1[i] === barcode2[i]) matchCount++;
  }
  
  // Calculate similarity percentage
  return matchCount / minLength;
}

/**
 * Simple direct console log wrapper that ensures logs appear in development
 */
function logBarcode(message: string, ...data: any[]): void {
  if (DEBUG_BARCODE) {
    console.log(`%c${message}`, 'background: #222; color: #bada55', ...data);
  }
}

/**
 * Normalize barcode to a standard format
 */
export function normalizeBarcode(barcode: string): string | null {
  if (!barcode) return null;
  
  // Log the raw barcode for debugging
  logBarcode(`[BARCODE NORMALIZE] Raw barcode: "${barcode}"`);
  
  // Remove all non-numeric characters
  const numericOnly = barcode.replace(/[^0-9]/g, '');
  
  // Check if we have a valid barcode length
  // Common formats: EAN-13 (13), UPC-A (12), EAN-8 (8), UPC-E (8)
  if (![8, 12, 13, 14].includes(numericOnly.length)) {
    console.warn(`[BARCODE NORMALIZE] Potentially invalid barcode length: ${numericOnly.length} for "${numericOnly}"`);
    // We'll still return it for fuzzy matching, but log the warning
  }
  
  logBarcode(`[BARCODE NORMALIZE] Normalized barcode: "${numericOnly}" (length: ${numericOnly.length})`);
  return numericOnly;
}

/**
 * Fuzzy barcode matching with improved confidence scoring
 */
export function findFuzzyBarcodeMatch(targetBarcode: string, wines: Wine[]): Wine | null {
  if (!targetBarcode || !wines || wines.length === 0) {
    logBarcode(`[BARCODE MATCH] No wines to compare with target barcode: "${targetBarcode}"`);
    return null;
  }
  
  logBarcode(`[BARCODE MATCH] Finding match for barcode: "${targetBarcode}" in ${wines.length} wines`);
  
  // Keep the minimum required similarity (0-100%)
  const SIMILARITY_THRESHOLD = 80;
  
  // First pass: Look for wines where one barcode contains the other
  // (helps with truncated scans or when additional digits are added)
  let bestMatch = null;
  let highestSimilarity = 0;
  
  // Track matches separately by type for better decision making
  const containsMatches: Array<{wine: Wine, similarity: number}> = [];
  const similarityMatches: Array<{wine: Wine, similarity: number}> = [];
  
  // Try to find the best match across all wines
  for (const wine of wines) {
    if (!wine.barcode) continue;
    
    // Exact match - return immediately
    if (wine.barcode === targetBarcode) {
      logBarcode(`[BARCODE MATCH] ✅ EXACT MATCH found: "${wine.barcode}" = "${targetBarcode}" (Wine: ${wine.name})`);
      return wine;
    }
    
    // Container match (one barcode contains the other)
    const shorterCode = wine.barcode.length < targetBarcode.length ? wine.barcode : targetBarcode;
    const longerCode = wine.barcode.length >= targetBarcode.length ? wine.barcode : targetBarcode;
    
    if (longerCode.includes(shorterCode)) {
      // Calculate how much of the shorter code is contained in the longer one
      const containmentScore = (shorterCode.length / longerCode.length) * 100;
      
      containsMatches.push({
        wine,
        similarity: containmentScore
      });
      
      if (containmentScore > highestSimilarity) {
        highestSimilarity = containmentScore;
        bestMatch = wine;
      }
    }
    
    // Digit-by-digit similarity comparison
    let matchingDigits = 0;
    const minLength = Math.min(wine.barcode.length, targetBarcode.length);
    
    for (let i = 0; i < minLength; i++) {
      if (wine.barcode[i] === targetBarcode[i]) {
        matchingDigits++;
      }
    }
    
    const similarityScore = (matchingDigits / minLength) * 100;
    
    similarityMatches.push({
      wine,
      similarity: similarityScore
    });
    
    if (similarityScore > highestSimilarity) {
      highestSimilarity = similarityScore;
      bestMatch = wine;
    }
  }
  
  // Sort matches by similarity for better logging and debugging
  containsMatches.sort((a, b) => b.similarity - a.similarity);
  similarityMatches.sort((a, b) => b.similarity - a.similarity);
  
  // Log the top matches to help with debugging
  if (containsMatches.length > 0) {
    logBarcode('[BARCODE MATCH] Top containment matches:');
    containsMatches.slice(0, 3).forEach((match, i) => {
      logBarcode(`  ${i+1}. "${match.wine.barcode}" (${match.similarity.toFixed(2)}%) - ${match.wine.name}`);
    });
  }
  
  if (similarityMatches.length > 0) {
    logBarcode('[BARCODE MATCH] Top similarity matches:');
    similarityMatches.slice(0, 3).forEach((match, i) => {
      logBarcode(`  ${i+1}. "${match.wine.barcode}" (${match.similarity.toFixed(2)}%) - ${match.wine.name}`);
    });
  }
  
  // Return the best match if it meets our threshold
  if (bestMatch && highestSimilarity >= SIMILARITY_THRESHOLD) {
    logBarcode(`[BARCODE MATCH] ✅ FUZZY MATCH found with ${highestSimilarity.toFixed(2)}% confidence: "${bestMatch.barcode}" ≈ "${targetBarcode}" (Wine: ${bestMatch.name})`);
    return bestMatch;
  }
  
  logBarcode(`[BARCODE MATCH] ❌ NO MATCH found above threshold (${SIMILARITY_THRESHOLD}%). Best match was ${highestSimilarity.toFixed(2)}%`);
  return null;
}