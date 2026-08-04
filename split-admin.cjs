const fs = require('fs');

let content = fs.readFileSync('src/routes.tsx', 'utf-8');

// Replace standard imports for admin with lazy imports
content = content.replace(/import\s+(Admin[A-Za-z0-9]+)\s+from\s+'(\.\/pages\/admin\/[^']+)';/g, "const $1 = React.lazy(() => import('$2'));");

// We need to import React at the top if it isn't
if (!content.includes('import React')) {
  content = "import React, { Suspense } from 'react';\n" + content;
} else if (!content.includes('Suspense')) {
  content = content.replace("import React", "import React, { Suspense }");
}

// Wrap <Admin...> with Suspense
content = content.replace(/element:\s*<([^>]+)\s*\/>/g, (match, p1) => {
  if (p1.startsWith('Admin')) {
    return `element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><${p1} /></Suspense>`;
  }
  return match;
});

fs.writeFileSync('src/routes.tsx', content);
