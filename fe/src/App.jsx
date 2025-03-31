import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [code, setCode] = useState('');
    const [fileName, setFileName] = useState('');
    const [validationMessage, setValidationMessage] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [codeScore, setcodeScore] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handle text input change
    const handleCodeChange = (e) => {
        setCode(e.target.value);
        setFileName(''); // Reset file name when typing manually
    };

    // Handle file input
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCode(event.target.result);
                setFileName(file.name);
            };
            reader.readAsText(file);
        }
    };

    // Validate code (basic example)
    const validateCode = () => {
        if (!code.trim()) {
            setValidationMessage('Code cannot be empty!');
            return false;
        }
        setValidationMessage('Code is valid!');
        return true;
    };
    const codeScoreGenerate  = async () => {
        if (!code.trim()) {
            setValidationMessage('Code cannot be empty!');
            return false;
        }
        try {
            const response = await axios.post('http://127.0.0.1:8080/api/codeScore', { code });

            // Check if there is no response or no data in the response
            if (!response || !response.data) {
                throw new Error('No response from the server');
            }
            console.log(response.data);
            setcodeScore(response.data.result);
        } catch (error) {
            console.error('Error:', error);
            setcodeScore(error.message || 'Something went wrong. Please try again.');
        } finally {
            //setIsLoading(false);
        }
        return true;
    };

    // Send code to backend for analysis
    const handleAnalyze = async () => {
        if (!validateCode()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8080/api/analyze', { code });

            // Check if there is no response or no data in the response
            if (!response || !response.data) {
                throw new Error('No response from the server');
            }

            setAnalysisResult(response.data.result);
            setValidationMessage('Analysis complete!');
        } catch (error) {
            console.error('Analysis error:', error);
            setValidationMessage(error.message || 'Analysis failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container-wrapper">
            <div className="app-container">
                <h1>Refactorio - Code Improvement Assistant</h1>

                <div className="input-section">
                    <div className="code-input">
          <textarea
              value={code}
              onChange={handleCodeChange}
              placeholder="Paste your code here..."
              rows={15}
          />
                    </div>

                    <div className="upload-section">
                        <div className="file-upload">
                            <input
                                type="file"
                                accept=".txt,.js"
                                onChange={handleFileUpload}
                                id="fileInput"
                            />
                            <label htmlFor="fileInput">
                                {fileName || 'Choose a file'}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="validation-message">
                    {validationMessage}
                </div>

                <div className="action-buttons">
                    <button onClick={validateCode}>
                        Validate Code
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !code}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Code'}
                    </button>
                </div>

                {analysisResult && (
                    <div className="result-section">
                        <h2>Analysis Results</h2>
                        <pre>{analysisResult}</pre>
                    </div>
                )}
            </div>
            <div className="sidebar">
                <h2>Extra Tools</h2>
                <div className="sidebar-container">
                    <button onClick={codeScoreGenerate} >Kodo kokybės įvertinimas(0-10)</button>
                    <button>Dummy1</button>
                    <button>Dummy2</button>
                </div>
            </div>

                <dialog open={codeScore!=""}>
                    <p>{codeScore}</p>
                    <form method="dialog">
                        <button onClick={() => setcodeScore("")}>OK</button>

                    </form>
                </dialog>

        </div>
    );
}

export default App;