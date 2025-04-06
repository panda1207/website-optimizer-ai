import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      console.log("Response data:", data);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Website Optimizer AI</h1>
      <input
        type="text"
        placeholder="Enter your website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ padding: 8, width: '300px'}}
      />
      <button onClick={analyze} style={{ padding: "8px 12px", marginLeft: 10 }}>
        { loading ? 'Analyzing...' : 'Analyze' }
      </button>

      { result && (
        <div style={{ marginTop: 20 }}>
          <h2>Top 5 Suggestions</h2>
          {result.suggestions.map((suggestion, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
              <h3>{suggestion?.title}</h3>
              <p>{suggestion?.description}</p>
              {suggestion?.updatedHtml && (
                <><strong>HTML:</strong><pre>{suggestion.updatedHtml}</pre></>
              )}
              {suggestion?.updatedCss && (
                <><strong>CSS:</strong><pre>{suggestion.updatedCss}</pre></>
              )}
              {suggestion?.generatedImage && (
                <>
                  <strong>Image:</strong><pre>{suggestion?.imageDescription}</pre>
                  <img src={suggestion?.generatedImage} alt="Generated Improvement" style={{ maxWidth: '100%'}} />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default App;
