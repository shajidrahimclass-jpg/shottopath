const fs = require('fs');

// Fix ImageUpload.tsx
let uploadCode = fs.readFileSync('src/components/ImageUpload.tsx', 'utf8');
uploadCode = uploadCode.replace(
  'interface ImageUploadProps {',
  'interface ImageUploadProps {\n  clearAfterUpload?: boolean;'
);
uploadCode = uploadCode.replace(
  'className = \'\',\n}: ImageUploadProps) {',
  'className = \'\',\n  clearAfterUpload = false,\n}: ImageUploadProps) {'
);
uploadCode = uploadCode.replace(
  '// Call the callback with the uploaded URL\n      onUploadComplete(url);\n      \n      // Keep the preview - it will be managed by currentImage prop\n      setProgress(0);',
  '// Call the callback with the uploaded URL\n      onUploadComplete(url);\n      \n      if (clearAfterUpload) {\n        setPreview(null);\n      }\n      setProgress(0);'
);
fs.writeFileSync('src/components/ImageUpload.tsx', uploadCode);

// Fix AdminProductEditor.tsx
let editorCode = fs.readFileSync('src/pages/admin/AdminProductEditor.tsx', 'utf8');
editorCode = editorCode.replace(
  'folder="products/gallery"\n                    label="Upload Gallery Image"\n                  />',
  'folder="products/gallery"\n                    label="Upload Gallery Image"\n                    clearAfterUpload\n                  />'
);
// Fix empty url bug for pc_images
editorCode = editorCode.replace(
  'onUploadComplete={(url) => {\n                    setFormData(prev => ({\n                      ...prev,\n                      pc_images: [...prev.pc_images, url],\n                      mobile_images: [...prev.mobile_images, url],\n                    }));\n                  }}',
  'onUploadComplete={(url) => {\n                    if (!url) return;\n                    setFormData(prev => ({\n                      ...prev,\n                      pc_images: [...prev.pc_images, url],\n                      mobile_images: [...prev.mobile_images, url],\n                    }));\n                  }}'
);
fs.writeFileSync('src/pages/admin/AdminProductEditor.tsx', editorCode);
console.log('Fixed ImageUpload and AdminProductEditor');
