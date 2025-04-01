import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import {deserializeLineColors} from "./utils/deserializeLineColors.js";

function App() {
    const [code, setCode] = useState('');
    const [fileName, setFileName] = useState('');
    const [validationMessage, setValidationMessage] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [codeScore, setcodeScore] = useState('');
    const [colorRanges, setColorRanges] = useState([]);
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

    const codeLinesQualityEvaluate  = async () => {
        if (!code.trim()) {
            setValidationMessage('Code cannot be empty!');
            return false;
        }
        try {
            const response = await axios.post('http://127.0.0.1:8080/api/codeLinesQuality', { code });

            if (!response || !response.data) {
                throw new Error('No response from the server');
            }
            console.log(response.data);
            const ranges = deserializeLineColors(response.data.result);
            console.log(ranges);
            setColorRanges(ranges);
        } catch (error) {
            console.error('Error:', error);
            setcodeScore(error.message || 'Something went wrong. Please try again.');
        } finally {
            //setIsLoading(false);
        }
        return true;
    };

    function coloredCodeLinesViewer() {
        const lines = (code.split('\n'));

        const getColorForLine = (lineIndex) => {
            for (let range of colorRanges) {
                if (lineIndex >= range.start - 1 && lineIndex <= range.end - 1) {
                    return range.color;
                }
            }
            return null;
        };

        return (
            <div>
                {lines.map((line, index) => {
                    const lineColor = getColorForLine(index);
                    return (
                        <div
                            key={index}
                            style={{minHeight: '1em',backgroundColor: lineColor ? lineColor : 'transparent'}}
                        >
                            {line}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Send code to backend for analysis
    const handleAnalyze = async () => {
        if (!validateCode()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8080/api/analyze', {code});

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
            <div>

            {analysisResult && (
                <div className="result-section">
                    <h2>Analysis Results</h2>
                    {typeof analysisResult === 'object' ? (
                        <>
                            <div>
                                <h3>Suggestions:</h3>
                                <ul>
                                    {analysisResult.suggestions && analysisResult.suggestions.map((suggestion, idx) => (
                                        <li key={idx}>
                                            {typeof suggestion === 'object'
                                                ? JSON.stringify(suggestion, null, 2)
                                                : String(suggestion)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Code samples are ready, however the current AI model generates very poor examples  
                            <div>
                                <h3>Code Samples:</h3>
                                {analysisResult.codeSamples && analysisResult.codeSamples.map((codeSample, idx) => (
                                    <pre key={idx}>
                                        {typeof codeSample === 'object'
                                            ? JSON.stringify(codeSample, null, 2)
                                            : String(codeSample)}
                                    </pre>
                                ))}
                            </div>
                            */}
                        </>
                    ) : (
                        <pre>{typeof analysisResult === 'object' ? JSON.stringify(analysisResult, null, 2) : analysisResult}</pre>
                    )}
                    </div>)}
            
            
            <dialog open={codeScore != ""}>
                <p>{codeScore}</p>
                <form method="dialog">
                    <button onClick={() => setcodeScore("")}>OK</button>
                </form>
            </dialog>
            <dialog open={colorRanges.length != 0} className="fixedDialog">
                <div>{coloredCodeLinesViewer()}</div>
                <form method="dialog">
                    <button onClick={() => setColorRanges([])}>OK</button>
                </form>
            </dialog>
                </div>
            </div>
        </div>
    )
}
export default App;
