// JSON Comparison Utility for API Testing
// Supports dynamic field exclusion and nested object comparison

export interface ComparisonOptions {
  ignoreFields?: string[];
  ignoreDynamicFields?: boolean;
  customIgnorePatterns?: RegExp[];
  strictMode?: boolean;
  allowExtraFields?: boolean;
}

export interface ComparisonResult {
  isEqual: boolean;
  differences: Difference[];
  summary: string;
}

export interface Difference {
  path: string;
  expected: any;
  actual: any;
  type: 'missing' | 'extra' | 'different' | 'type_mismatch';
}

export class JSONComparator {
  private defaultIgnoreFields = [
    'id', 'uuid', 'createdAt', 'updatedAt', 'timestamp', 
    'createdDate', 'modifiedDate', 'lastModified',
    '_id', 'guid', 'etag', 'version'
  ];

  private dynamicFieldPatterns = [
    /.*[Ii]d$/,           // Fields ending with 'id' or 'Id'
    /.*[Uu]uid$/,         // UUID fields
    /.*[Tt]imestamp$/,    // Timestamp fields
    /.*[Dd]ate$/,         // Date fields
    /^created.*/,         // Fields starting with 'created'
    /^updated.*/,         // Fields starting with 'updated'
    /^modified.*/,        // Fields starting with 'modified'
    /.*[Tt]oken$/,        // Token fields
    /.*[Hh]ash$/          // Hash fields
  ];

  compare(expected: any, actual: any, options: ComparisonOptions = {}): ComparisonResult {
    const opts = this.mergeOptions(options);
    const differences: Difference[] = [];
    
    this.compareRecursive(expected, actual, '', differences, opts);
    
    return {
      isEqual: differences.length === 0,
      differences,
      summary: this.generateSummary(differences)
    };
  }

  private mergeOptions(options: ComparisonOptions): Required<ComparisonOptions> {
    return {
      ignoreFields: [...this.defaultIgnoreFields, ...(options.ignoreFields || [])],
      ignoreDynamicFields: options.ignoreDynamicFields ?? true,
      customIgnorePatterns: [...this.dynamicFieldPatterns, ...(options.customIgnorePatterns || [])],
      strictMode: options.strictMode ?? false,
      allowExtraFields: options.allowExtraFields ?? false
    };
  }

  private compareRecursive(
    expected: any, 
    actual: any, 
    path: string, 
    differences: Difference[], 
    options: Required<ComparisonOptions>
  ): void {
    // Handle null/undefined cases
    if (expected === null || expected === undefined) {
      if (actual !== expected) {
        differences.push({
          path,
          expected,
          actual,
          type: 'different'
        });
      }
      return;
    }

    // Check if actual is missing
    if (actual === null || actual === undefined) {
      differences.push({
        path,
        expected,
        actual,
        type: 'missing'
      });
      return;
    }

    // Type mismatch check
    if (typeof expected !== typeof actual) {
      differences.push({
        path,
        expected,
        actual,
        type: 'type_mismatch'
      });
      return;
    }

    // Handle arrays
    if (Array.isArray(expected)) {
      if (!Array.isArray(actual)) {
        differences.push({
          path,
          expected,
          actual,
          type: 'type_mismatch'
        });
        return;
      }
      
      this.compareArrays(expected, actual, path, differences, options);
      return;
    }

    // Handle objects
    if (typeof expected === 'object') {
      this.compareObjects(expected, actual, path, differences, options);
      return;
    }

    // Compare primitive values
    if (expected !== actual) {
      differences.push({
        path,
        expected,
        actual,
        type: 'different'
      });
    }
  }

  private compareArrays(
    expected: any[], 
    actual: any[], 
    path: string, 
    differences: Difference[], 
    options: Required<ComparisonOptions>
  ): void {
    const maxLength = Math.max(expected.length, actual.length);
    
    for (let i = 0; i < maxLength; i++) {
      const currentPath = `${path}[${i}]`;
      
      if (i >= expected.length) {
        if (!options.allowExtraFields) {
          differences.push({
            path: currentPath,
            expected: undefined,
            actual: actual[i],
            type: 'extra'
          });
        }
      } else if (i >= actual.length) {
        differences.push({
          path: currentPath,
          expected: expected[i],
          actual: undefined,
          type: 'missing'
        });
      } else {
        this.compareRecursive(expected[i], actual[i], currentPath, differences, options);
      }
    }
  }

  private compareObjects(
    expected: any, 
    actual: any, 
    path: string, 
    differences: Difference[], 
    options: Required<ComparisonOptions>
  ): void {
    const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Check if field should be ignored
      if (this.shouldIgnoreField(key, options)) {
        continue;
      }
      
      if (!(key in expected)) {
        if (!options.allowExtraFields) {
          differences.push({
            path: currentPath,
            expected: undefined,
            actual: actual[key],
            type: 'extra'
          });
        }
      } else if (!(key in actual)) {
        differences.push({
          path: currentPath,
          expected: expected[key],
          actual: undefined,
          type: 'missing'
        });
      } else {
        this.compareRecursive(expected[key], actual[key], currentPath, differences, options);
      }
    }
  }

  private shouldIgnoreField(fieldName: string, options: Required<ComparisonOptions>): boolean {
    // Check explicit ignore list
    if (options.ignoreFields.includes(fieldName)) {
      return true;
    }
    
    // Check dynamic field patterns
    if (options.ignoreDynamicFields) {
      return options.customIgnorePatterns.some(pattern => pattern.test(fieldName));
    }
    
    return false;
  }

  private generateSummary(differences: Difference[]): string {
    if (differences.length === 0) {
      return '✅ Objects are identical (ignoring dynamic fields)';
    }
    
    const counts = {
      missing: differences.filter(d => d.type === 'missing').length,
      extra: differences.filter(d => d.type === 'extra').length,
      different: differences.filter(d => d.type === 'different').length,
      type_mismatch: differences.filter(d => d.type === 'type_mismatch').length
    };
    
    const summary = [];
    if (counts.missing > 0) summary.push(`${counts.missing} missing field(s)`);
    if (counts.extra > 0) summary.push(`${counts.extra} extra field(s)`);
    if (counts.different > 0) summary.push(`${counts.different} different value(s)`);
    if (counts.type_mismatch > 0) summary.push(`${counts.type_mismatch} type mismatch(es)`);
    
    return `❌ Found ${differences.length} difference(s): ${summary.join(', ')}`;
  }

  // Utility methods for test frameworks
  
  /**
   * Cypress-specific assertion helper
   */
  static cypressAssert(expected: any, actual: any, options?: ComparisonOptions): void {
    const comparator = new JSONComparator();
    const result = comparator.compare(expected, actual, options);
    
    if (!result.isEqual) {
      const errorMessage = `JSON comparison failed:\n${result.summary}\n\nDifferences:\n${
        result.differences.map(d => `  ${d.path}: expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}`).join('\n')
      }`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Playwright-specific assertion helper
   */
  static playwrightExpect(expected: any, actual: any, options?: ComparisonOptions): void {
    const comparator = new JSONComparator();
    const result = comparator.compare(expected, actual, options);
    
    if (!result.isEqual) {
      const errorMessage = `JSON comparison failed:\n${result.summary}\n\nDifferences:\n${
        result.differences.map(d => `  ${d.path}: expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}`).join('\n')
      }`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Schema validation helper
   */
  validateSchema(data: any, schema: any, options?: ComparisonOptions): ComparisonResult {
    return this.compare(schema, data, {
      ...options,
      allowExtraFields: true, // Allow extra fields in data that aren't in schema
      ignoreDynamicFields: true
    });
  }

  /**
   * API response validation helper
   */
  validateAPIResponse(expectedResponse: any, actualResponse: any, options?: ComparisonOptions): ComparisonResult {
    const opts = {
      ignoreDynamicFields: true,
      allowExtraFields: false,
      ...options
    };
    
    return this.compare(expectedResponse, actualResponse, opts);
  }
}

// Export for both CommonJS and ES modules
export default JSONComparator;