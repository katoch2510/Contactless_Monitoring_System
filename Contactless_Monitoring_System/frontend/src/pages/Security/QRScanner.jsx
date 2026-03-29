import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { QrCode, ScanLine, ArrowLeft, Fingerprint, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const QRScanner = () => {
    const playBeep = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime); // Frequency in Hz

            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio beep failed", e);
        }
    };

    const [scanMode, setScanMode] = useState('face'); // 'qr', 'face', 'manual'
    const [qrPayload, setQrPayload] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastScan, setLastScan] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Auto Scan States
    const webcamRef = useRef(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const detectionInterval = useRef(null);
    const lastRecogTime = useRef(0);

    // Manual Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const config = () => {
        const { token } = JSON.parse(localStorage.getItem('userInfo')) || {};
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                setModelsLoaded(true);
            } catch (err) {
                toast.error('Failed to load Face Recognition Models');
            }
        };
        loadModels();

        return () => {
            if (detectionInterval.current) clearInterval(detectionInterval.current);
        };
    }, []);

    // Seamless Continuous Verification
    useEffect(() => {
        if (scanMode === 'face' && modelsLoaded) {
            startSeamlessDetection();
        } else {
            if (detectionInterval.current) clearInterval(detectionInterval.current);
            setIsDetecting(false);
        }
    }, [scanMode, modelsLoaded]);

    const startSeamlessDetection = () => {
        if (detectionInterval.current) clearInterval(detectionInterval.current);
        setIsDetecting(true);

        detectionInterval.current = setInterval(async () => {
            // Prevent spamming API if we just verified someone in the last 4 seconds
            if (Date.now() - lastRecogTime.current < 4000) return;
            if (!webcamRef.current) return;

            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) return;

            const img = new Image();
            img.src = imageSrc;

            img.onload = async () => {
                const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

                if (detection) {
                    const descriptorArray = Array.from(detection.descriptor);
                    try {
                        const { data } = await axios.post('/api/students/match', { descriptor: descriptorArray, gate_location: 'Main Gate Camera' }, config());
                        setLastScan({ success: true, message: data.message, data: data.log });
                        toast.success(data.message);
                        playBeep();
                        lastRecogTime.current = Date.now(); // Cooldown
                    } catch (apiErr) {
                        // Silent fail for background scanning until a match is found to avoid spamming errors, 
                        // unless we want to show it. Let's just log it locally.
                        console.log('No match found this frame.');
                    }
                }
            };
        }, 1500); // Check every 1.5 seconds
    };

    const handleQRScan = async (e) => {
        e.preventDefault();
        if (!qrPayload) return;
        try {
            setLoading(true);
            const { data } = await axios.post('/api/qr/scan', { qr_payload: qrPayload, gate_location: 'Main Gate' }, config());
            setLastScan({ success: true, message: data.message, data: data.log });
            toast.success(data.message);
            playBeep();
            setQrPayload('');
        } catch (err) {
            setLastScan({ success: false, message: err.response?.data?.message || 'Invalid QR Code' });
            toast.error(err.response?.data?.message || 'Scan Failed');
        } finally {
            setLoading(false);
        }
    };

    // Manual Search & Log
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 2) {
                const { data } = await axios.get(`/api/students/search?q=${searchQuery}`, config());
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleManualLog = async (studentId) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/students/manual-log', { studentId, gate_location: 'Main Gate (Manual)' }, config());
            setLastScan({ success: true, message: data.message, data: data.log });
            toast.success(data.message);
            playBeep();
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            setLastScan({ success: false, message: err.response?.data?.message || 'Manual Log Failed' });
            toast.error(err.response?.data?.message || 'Action Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 py-12 mb-20">
            <div className="w-full justify-start max-w-2xl mb-4">
                <Link to="/admin" className="text-gray-400 hover:text-white flex items-center transition">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </Link>
            </div>

            <div className="max-w-2xl w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-8 text-center bg-gray-800 border-b border-gray-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-900/50 text-indigo-400 mb-6 relative">
                        {isDetecting && (
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-75"></div>
                        )}
                        <ScanLine className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Gate Security Terminal</h2>
                    <p className="text-gray-400">Select entry verification method</p>

                    <div className="mt-6 flex justify-center flex-wrap gap-4">
                        <button
                            onClick={() => setScanMode('face')}
                            className={`px-6 py-2 rounded-full font-medium transition ${scanMode === 'face' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <Fingerprint className="w-4 h-4 inline mr-2" /> Auto Face Match
                        </button>
                        <button
                            onClick={() => setScanMode('manual')}
                            className={`px-6 py-2 rounded-full font-medium transition ${scanMode === 'manual' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <Search className="w-4 h-4 inline mr-2" /> Manual Bypass
                        </button>
                    </div>
                </div>

                <div className="p-8 bg-gray-800/50">
                    {/* Auto Face Match Mode */}
                    {scanMode === 'face' && (
                        <div className="space-y-4 flex flex-col items-center">
                            {!modelsLoaded ? (
                                <div className="py-20 flex flex-col items-center text-gray-400">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
                                    Loading AI Models...
                                </div>
                            ) : (
                                <>
                                    <div className="w-full relative bg-black rounded-xl overflow-hidden shadow-inner border-2 border-indigo-500/30">
                                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full object-cover min-h-[300px]" />
                                        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div> Seamless Edge Scan Active
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm text-center">Stand in front of the camera to automatically log Entry or Exit.</p>
                                    <button onClick={() => setScanMode('manual')} className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 transition">
                                        Camera failing? Use Manual Bypass.
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Manual Search Mode */}
                    {scanMode === 'manual' && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Search Registered Students</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by Name or Student ID..."
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="mt-4 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden divide-y divide-gray-800">
                                    {searchResults.map(student => (
                                        <div key={student._id} className="p-4 flex items-center justify-between hover:bg-gray-800 transition">
                                            <div>
                                                <h4 className="font-semibold text-white">{student.name}</h4>
                                                <p className="text-xs text-gray-400">{student.student_id} • {student.email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleManualLog(student._id)}
                                                disabled={loading}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:bg-gray-600"
                                            >
                                                Log Bypass
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchQuery.length > 2 && searchResults.length === 0 && (
                                <p className="text-center text-gray-500 mt-4 text-sm">No students found.</p>
                            )}
                        </div>
                    )}

                    {/* Scan Result Alert */}
                    {lastScan && (
                        <div className={`mt-8 p-4 rounded-xl flex items-start ${lastScan.success ? 'bg-green-900/40 border border-green-800' : 'bg-red-900/40 border border-red-800'}`}>
                            <div className="ml-3">
                                <h3 className={`text-lg font-bold ${lastScan.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {lastScan.success ? 'Access Logged' : 'Access Denied'}
                                </h3>
                                <p className="text-gray-300 mt-1">{lastScan.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
