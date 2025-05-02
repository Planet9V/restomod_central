// Import fonts to ensure they're available throughout the application
// This is a side-effect import that will be executed when imported

// Load Playfair Display and Roboto fonts
const fontLinks = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
`;

// Insert font links into the document head
document.head.insertAdjacentHTML('beforeend', fontLinks);

// Set page title
document.title = "McKenney & Skinny's Bespoke Restomods";

// Add viewport meta tag if not already present
if (!document.querySelector('meta[name="viewport"]')) {
  const metaViewport = document.createElement('meta');
  metaViewport.name = 'viewport';
  metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1';
  document.head.appendChild(metaViewport);
}
