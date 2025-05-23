export const dynamic = "force-dynamic"

export default function FavoritesStaticPage() {
  return (
    <html>
      <head>
        <title>My Favorites</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.5;
            padding: 0;
            margin: 0;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 48px 24px;
          }
          .title {
            font-size: 30px;
            font-weight: bold;
            margin-bottom: 32px;
          }
          .auth-box {
            background-color: #f4f4f5;
            padding: 32px;
            border-radius: 8px;
            text-align: center;
          }
          .subtitle {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          .message {
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
          }
        `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <h1 className="title">My Favorites</h1>
          <div className="auth-box">
            <h2 className="subtitle">Authentication Required</h2>
            <p className="message">Please sign in to view your favorite stocks.</p>
            <a href="/auth" className="button">
              Sign In
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
