import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, UserPlus, Fingerprint } from 'lucide-react';

const StudentRegistration = () => {
    const webcamRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [loading, setLoading] = useState(false);

    // Heirarchy States
    const [colleges, setColleges] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);

    const [formData, setFormData] = useState({
        student_id: '',
        name: '',
        email: '',
        college: '',
        department: '',
        course: '',
        section: ''
    });

    const config = () => {
        const { token } = JSON.parse(localStorage.getItem('userInfo')) || {};
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        const loadDependencies = async () => {
            try {
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                setModelsLoaded(true);

                // Fetch initial Colleges
                const { data } = await axios.get('/api/institutions/colleges', config());
                setColleges(data);
            } catch (err) {
                toast.error('Failed to load dependencies');
            }
        };
        loadDependencies();
    }, []);

    const handleEntityChange = async (e, type) => {
        const val = e.target.value;
        setFormData({ ...formData, [type]: val });

        if (!val) return;

        try {
            if (type === 'college') {
                const { data } = await axios.get(`/api/institutions/departments/${val}`, config());
                setDepartments(data);
                setCourses([]); setSections([]);
                setFormData(f => ({ ...f, department: '', course: '', section: '' }));
            } else if (type === 'department') {
                const { data } = await axios.get(`/api/institutions/courses/${val}`, config());
                setCourses(data);
                setSections([]);
                setFormData(f => ({ ...f, course: '', section: '' }));
            } else if (type === 'course') {
                const { data } = await axios.get(`/api/institutions/sections/${val}`, config());
                setSections(data);
                setFormData(f => ({ ...f, section: '' }));
            }
        } catch (err) {
            toast.error(`Failed to fetch ${type} children`);
        }
    };

    const captureFace = async () => {
        if (!webcamRef.current) return;
        setScanning(true);

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            setScanning(false);
            return toast.error('Failed to access camera');
        }

        try {
            const img = new Image();
            img.src = imageSrc;

            img.onload = async () => {
                const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

                if (detection) {
                    setFaceDescriptor(Array.from(detection.descriptor));
                    toast.success('Face scanned successfully!');
                } else {
                    toast.error('No human face detected. Please try again.');
                }
                setScanning(false);
            };
        } catch (err) {
            setScanning(false);
            toast.error('Error processing image');
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!faceDescriptor) {
            return toast.warning('Please scan the student face first.');
        }

        try {
            setLoading(true);
            await axios.post('/api/students/register', { ...formData, face_encoding: faceDescriptor }, config());

            toast.success('Student Registered Successfully!');
            setFormData({ student_id: '', name: '', email: '', college: '', department: '', course: '', section: '' });
            setFaceDescriptor(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register student');
        } finally {
            setLoading(false);
        }
    };

    if (!modelsLoaded) {
        return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 mb-20">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Register Student Face Profile</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Create a secure profile for contactless gate entry</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Camera Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center"><Camera className="w-5 h-5 mr-2" /> Live Camera Feed</h3>
                    <div className="w-full relative bg-black rounded-lg overflow-hidden flex items-center justify-center border-4 border-gray-200 dark:border-gray-700 h-64 lg:h-96">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        onClick={captureFace}
                        disabled={scanning}
                        type="button"
                        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center w-full shadow-md disabled:bg-indigo-400"
                    >
                        {scanning ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <Fingerprint className="w-5 h-5 mr-2" />}
                        {scanning ? 'Scanning Face...' : 'Capture biometric descriptor'}
                    </button>
                    {faceDescriptor && (
                        <p className="text-green-500 text-sm font-semibold mt-4 flex items-center">✓ Biometric Descriptor Captured</p>
                    )}
                </div>

                {/* Form Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Student Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student ID</label>
                            <input type="text" name="student_id" required value={formData.student_id} onChange={handleChange} className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. S-1001" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="john@student.edu" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">College</label>
                                <select name="college" required value={formData.college} onChange={(e) => handleEntityChange(e, 'college')} className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                                    <option value="">Select College</option>
                                    {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                                <select name="department" required disabled={!formData.college} value={formData.department} onChange={(e) => handleEntityChange(e, 'department')} className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                                <select name="course" required disabled={!formData.department} value={formData.course} onChange={(e) => handleEntityChange(e, 'course')} className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                                    <option value="">Select Course</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section</label>
                                <select name="section" required disabled={!formData.course} value={formData.section} onChange={(e) => handleEntityChange(e, 'section')} className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                                    <option value="">Select Section</option>
                                    {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !faceDescriptor}
                            className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors mt-6 shadow-md"
                        >
                            {loading ? 'Saving Profile...' : 'Complete Registration'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentRegistration;
