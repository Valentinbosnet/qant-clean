"use client"

function Error({ statusCode }) {
  return (
    <div className="container">
      <h1>{statusCode ? `An error ${statusCode} occurred on server` : "An error occurred on client"}</h1>
      <p>Please try refreshing the page or go back to the home page.</p>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          padding: 0 20px;
        }
        
        h1 {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
