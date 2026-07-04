export function sanitizeInput(value: string): string {
  if (!value) return value;
  
  let sanitized = value;
  
  // Remove <script> tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove inline event handlers (e.g., onload=, onerror=, onclick=)
  sanitized = sanitized.replace(/\bon\w+\s*=\s*(['"])(?:(?!\1).)*\1/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*[^>\s]+/gi, '');
  
  // Remove javascript: URIs
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  
  // Basic SQLi pattern removal (as defense-in-depth, though Prisma/ORMs handle this)
  sanitized = sanitized.replace(/--\s*$/g, ''); // End of line comments
  
  return sanitized;
}
