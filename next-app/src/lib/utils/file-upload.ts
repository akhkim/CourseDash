
/**
 * Handles file validation before upload
 * @param file File to validate
 * @param allowedTypes Array of allowed MIME types
 * @param maxSizeMB Maximum file size in MB
 * @returns Boolean indicating if file is valid
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = [],
  maxSizeMB: number = 10
): { valid: boolean; message?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `File size exceeds the maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  // Check file type if allowedTypes is provided
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
} 