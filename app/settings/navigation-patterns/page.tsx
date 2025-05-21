export default function NavigationPatternsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Navigation Patterns</h1>
      <p className="text-gray-500 mb-4">Loading navigation patterns data...</p>
      <div className="border rounded p-4">
        <p>Please enable JavaScript to view navigation patterns.</p>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const container = document.querySelector('.container');
              if (container) {
                // Replace static content with dynamic content
                const script = document.createElement('script');
                script.src = '/navigation-patterns.js';
                document.body.appendChild(script);
              }
            });
          `,
        }}
      />
    </div>
  )
}
