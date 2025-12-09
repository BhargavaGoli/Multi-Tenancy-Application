import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
    const [status, setStatus] = useState('Testing...');
    const [details, setDetails] = useState([]);

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        const tests = [];

        // Test 1: Basic GET request
        try {
            const response = await axios.get('http://localhost:8000/api/check-subdomain/?subdomain=test');
            tests.push({ test: 'GET /api/check-subdomain/', status: 'SUCCESS', data: response.data });
        } catch (error) {
            tests.push({
                test: 'GET /api/check-subdomain/',
                status: 'FAILED',
                error: error.message,
                details: error.response?.data || 'No response data'
            });
        }

        // Test 2: POST request
        try {
            const response = await axios.post('http://localhost:8000/api/signup/', {
                subdomain: 'test123',
                company_name: 'Test Company',
                admin_email: 'test@test.com',
                admin_name: 'Test User'
            });
            tests.push({ test: 'POST /api/signup/', status: 'SUCCESS', data: response.data });
        } catch (error) {
            tests.push({
                test: 'POST /api/signup/',
                status: error.response?.status === 400 ? 'SUCCESS (Validation Error Expected)' : 'FAILED',
                error: error.message,
                details: error.response?.data || 'No response data'
            });
        }

        setDetails(tests);
        const allSuccess = tests.every(t => t.status.includes('SUCCESS'));
        setStatus(allSuccess ? 'All tests passed!' : 'Some tests failed');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
            <div className="card max-w-2xl w-full">
                <h1 className="text-2xl font-bold mb-6">Backend Connection Test</h1>

                <div className="mb-6">
                    <div className="text-lg font-semibold mb-2">Status:</div>
                    <div className={`text-xl ${status.includes('passed') ? 'text-green-400' : status.includes('failed') ? 'text-red-400' : 'text-yellow-400'}`}>
                        {status}
                    </div>
                </div>

                <div className="space-y-4">
                    {details.map((test, index) => (
                        <div key={index} className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-mono text-sm text-gray-400">{test.test}</div>
                                <div className={`px-2 py-1 rounded text-xs font-semibold ${test.status.includes('SUCCESS') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {test.status}
                                </div>
                            </div>

                            {test.error && (
                                <div className="text-sm text-red-400 mb-2">
                                    Error: {test.error}
                                </div>
                            )}

                            <details className="text-xs text-gray-500">
                                <summary className="cursor-pointer hover:text-gray-400">Details</summary>
                                <pre className="mt-2 p-2 bg-gray-950 rounded overflow-auto">
                                    {JSON.stringify(test.data || test.details, null, 2)}
                                </pre>
                            </details>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-sm text-blue-400">
                        <strong>Expected Results:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>GET request should return subdomain availability</li>
                            <li>POST request should fail with validation error (expected)</li>
                        </ul>
                    </div>
                </div>

                <button
                    onClick={testConnection}
                    className="btn btn-primary w-full mt-6"
                >
                    Run Tests Again
                </button>
            </div>
        </div>
    );
};

export default ConnectionTest;
