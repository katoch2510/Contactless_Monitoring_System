import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, User, Phone, Mail, FileText, CheckCircle, Camera, RefreshCcw } from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const VisitorRegistration = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        purpose: '',
        visit_date: '',
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Face capture states
    const webcamRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);

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
                console.error(err);
                toast.error('Failed to load face detection models. Please refresh.');
            }
        };
        loadModels();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCapture = async (e) => {
        e.preventDefault();
        if (!webcamRef.current) return;

        setIsDetecting(true);
        const imageSrc = webcamRef.current.getScreenshot();

        if (imageSrc) {
            const img = new Image();
            img.src = imageSrc;
            img.onload = async () => {
                try {
                    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

                    if (detection) {
                        setCapturedImage(imageSrc);
                        setFaceDescriptor(Array.from(detection.descriptor));
                        toast.success('Face captured successfully!');
                    } else {
                        toast.error('No face detected. Please ensure your face is clearly visible.');
                    }
                } catch (err) {
                    toast.error('Face detection error.');
                } finally {
                    setIsDetecting(false);
                }
            };
        }
    };

    const resetCapture = () => {
        setCapturedImage(null);
        setFaceDescriptor(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!faceDescriptor) {
            toast.warning('Please capture your face before submitting.');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                face_encoding: faceDescriptor,
                photo_base64: capturedImage
            };
            await axios.post('/api/visitors/register', payload);
            setSubmitted(true);
            toast.success('Registration Request Sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border-t-4 border-green-500">
                    <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Your visit request has been sent for approval. Upon approval, you can enter the campus directly via Face Entry.</p>
                    <button
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({ name: '', phone: '', email: '', purpose: '', visit_date: '' });
                            resetCapture();
                        }}
                        className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Submit Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Form Section */}
                <div>
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Visitor Pre-Registration</h2>
                        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Request access to the campus securely.</p>
                    </div>

                    <form className="space-y-5">
                        <div className="relative">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="John Doe" />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="john@example.com" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="relative">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date of Visit</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="datetime-local" name="visit_date" required value={formData.visit_date} onChange={handleChange} className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 py-3" />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Purpose of Visit</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea name="purpose" rows="1" required value={formData.purpose} onChange={handleChange} className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="Meeting, Event, etc." />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Webcam Section */}
                <div className="flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                            <Camera className="mr-2" /> Facial Recognition Scan
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Capture your face for contactless campus entry.</p>
                    </div>

                    <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 relative min-h-[250px]">
                        {!modelsLoaded ? (
                            <div className="text-gray-500 flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
                                Loading Models...
                            </div>
                        ) : capturedImage ? (
                            <div className="relative w-full h-full">
                                <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-between items-center">
                                    <span className="text-white text-sm font-medium"><CheckCircle className="inline w-4 h-4 mr-1 text-green-400" /> Face Enrolled</span>
                                    <button onClick={resetCapture} className="text-white hover:text-red-400 transition bg-black/40 px-3 py-1 rounded-full text-xs flex items-center">
                                        <RefreshCcw className="w-3 h-3 mr-1" /> Retake
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 inset-x-0 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={handleCapture}
                                        disabled={isDetecting}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition disabled:bg-gray-500"
                                    >
                                        {isDetecting ? 'Analyzing Face...' : 'Capture Face'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !faceDescriptor}
                        className="mt-6 w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisitorRegistration;
