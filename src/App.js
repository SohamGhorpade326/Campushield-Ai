import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, onSnapshot, updateDoc, query, Timestamp, orderBy, where } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig'; // <-- IMPORT FROM THE NEW FILE

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper Functions & Constants ---
const REPORT_CATEGORIES = ["Harassment", "Ragging", "Maintenance", "Safety Hazard", "Theft", "Academic", "Emergency", "Other"];
const REPORT_STATUSES = ["Submitted", "In Review", "Action Taken", "Resolved", "Rejected"];
const MAX_FILE_SIZE_MB = 0.7;
const YOUR_CAMPUS_COORDINATES = [19.0760, 72.8777]; // Default: Mumbai. Replace with your campus's [latitude, longitude]

// --- SVG Icons ---
const ShieldIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22a12.02 12.02 0 009-1.056A11.955 11.955 0 0121 12c0-2.62-.72-5.034-2.02-7.016L18.98 4.984" /></svg> );
const CheckCircleIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const InfoIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const LocationMarkerIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const PhotographIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> );
const ArrowLeftIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> );
const AlertTriangleIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> );

// --- Component Definitions ---

function HomePage({ onEnterPortal }) {
    return (
        <div className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white p-4" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80')" }}>
            <div className="text-center max-w-4xl">
                <div className="flex justify-center items-center mb-4"><ShieldIcon className="h-16 w-16 text-cyan-400" /></div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>CampusShield AI</h1>
                <p className="text-lg md:text-xl mb-8 text-gray-200" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>Your Voice Matters. Your Safety is Our Priority. <br/> An intelligent, anonymous platform for a safer campus.</p>
                <button onClick={onEnterPortal} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg">Enter Reporting Portal</button>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"><h3 className="font-semibold text-cyan-300">100% Anonymous</h3><p className="text-sm text-gray-300">Submit reports without revealing your identity.</p></div>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"><h3 className="font-semibold text-cyan-300">AI-Powered Triage</h3><p className="text-sm text-gray-300">Urgent issues are flagged instantly for fast action.</p></div>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"><h3 className="font-semibold text-cyan-300">Community Heatmap</h3><p className="text-sm text-gray-300">View a live map of campus safety reports.</p></div>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"><h3 className="font-semibold text-cyan-300">Emergency Alerts</h3><p className="text-sm text-gray-300">Instant alerts for high-priority incidents.</p></div>
                </div>
            </div>
        </div>
    );
}

function Header({ view, setView, user }) {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setView('student');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <ShieldIcon className="h-8 w-8 text-cyan-500" />
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-white">CampusShield AI</h1>
                </div>
                <nav className="flex items-center space-x-2 md:space-x-4">
                    <button onClick={() => setView('student')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'student' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        Student Portal
                    </button>
                    {user ? (
                        <button onClick={handleSignOut} className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Admin Logout
                        </button>
                    ) : (
                        <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'admin' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            Admin Login
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}

function Footer() {
    return (
        <footer className="text-center py-5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-8">
            <p>CampusShield AI &copy; {new Date().getFullYear()}. An Intelligent Campus Safety Platform.</p>
        </footer>
    );
}

function SubmissionSuccess({ reportId }) {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(reportId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-md mx-auto bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-lg">
            <div className="flex">
                <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3">
                    <h3 className="text-md font-medium text-green-800 dark:text-green-200">Report Submitted Successfully!</h3>
                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                        <p className="font-semibold">Please save this Report ID. It is the ONLY way to track your report.</p>
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-md flex items-center justify-between">
                            <span className="font-mono text-green-900 dark:text-green-100 text-sm">{reportId}</span>
                            <button onClick={copyToClipboard} className="ml-4 px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubmitReportForm() {
    const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [fileDataURI, setFileDataURI] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState('');
    const [submittedReportId, setSubmittedReportId] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`File is too large. Please upload an image under ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setFileDataURI(loadEvent.target.result);
            setFileName(file.name);
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            setStatusMessage("Fetching location...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    setStatusMessage("Location captured!");
                    setTimeout(() => setStatusMessage(''), 2000);
                },
                () => {
                    setError("Unable to retrieve location. Please check browser permissions.");
                    setStatusMessage("");
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    const simulateGeminiAPI = async (text) => {
        setStatusMessage("Analyzing report with AI...");
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        const lowerCaseText = text.toLowerCase();
        let urgency = "Low";
        let sentiment = "Negative";
        let suggestedCategory = "Other";

        if (/\b(emergency|fire|gun|weapon|threat|threatening|hurt|unsafe|danger)\b/.test(lowerCaseText)) {
            urgency = "High";
            suggestedCategory = "Emergency";
        } else if (/\b(harassment|harassing|ragging|teasing|bullying|stole|theft)\b/.test(lowerCaseText)) {
            urgency = "High";
            if (lowerCaseText.includes("theft") || lowerCaseText.includes("stole")) {
               suggestedCategory = "Theft";
           } else {
               suggestedCategory = "Harassment";
           }
        } else if (/\b(broken|leak|maintenance|dirty|clean)\b/.test(lowerCaseText)) {
            urgency = "Low";
            suggestedCategory = "Maintenance";
        }

        if (/\b(good|great|thanks|helpful)\b/.test(lowerCaseText)) {
            sentiment = "Positive";
        }

        return { urgency, sentiment, suggestedCategory };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (description.trim() === '') {
            setError('Description cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError('');
        setStatusMessage('Starting submission...');
        try {
            const aiAnalysis = await simulateGeminiAPI(description);
            setStatusMessage("Saving report...");
            const reportData = { category, description, location, fileDataURI, status: 'Submitted', createdAt: Timestamp.now(), updates: [], aiAnalysis };
            const docRef = await addDoc(collection(db, "reports"), reportData);
            setSubmittedReportId(docRef.id);
        } catch (err) {
            console.error("Error submitting report: ", err);
            setError('Failed to submit report. Please try again later.');
        } finally {
            setIsLoading(false);
            setStatusMessage('');
        }
    };

    if (submittedReportId) return <SubmissionSuccess reportId={submittedReportId} />;

    return (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-lg">
                        {REPORT_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
                    <textarea id="description" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" placeholder="Please provide as much detail as possible." required></textarea>
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Add Evidence (Optional)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button type="button" onClick={handleLocation} className="flex items-center justify-center space-x-2 w-full text-sm px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <LocationMarkerIcon className="h-5 w-5 text-slate-500" />
                            <span>{location ? "Location Added!" : "Add Current Location"}</span>
                        </button>
                        <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" accept="image/*"/>
                        <label htmlFor="file-upload" className="flex items-center justify-center space-x-2 w-full cursor-pointer text-sm px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                           <PhotographIcon className="h-5 w-5 text-slate-500" />
                           <span className="truncate">{fileName ? fileName : "Upload Photo"}</span>
                        </label>
                    </div>
                </div>
                {statusMessage && <p className="text-center text-sm text-cyan-500 animate-pulse">{statusMessage}</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-300 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                        {isLoading ? 'Processing...' : 'Submit Anonymously'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ReportStatusDetails({ report }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Submitted': return 'bg-slate-200 text-slate-800';
            case 'In Review': return 'bg-yellow-200 text-yellow-800';
            case 'Action Taken': return 'bg-blue-200 text-blue-800';
            case 'Resolved': return 'bg-green-200 text-green-800';
            case 'Rejected': return 'bg-red-200 text-red-800';
            default: return 'bg-slate-200 text-slate-800';
        }
    };
    
    const getUrgencyColor = (urgency) => {
        if (urgency === 'High') return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        if (urgency === 'Medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        if (urgency === 'Low') return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    };

    return (
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Report Details</h3>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">ID: {report.id}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                    </span>
                </div>
                 <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                    {report.aiAnalysis && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">AI Analysis</h4>
                            <div className="flex items-center space-x-4 text-xs">
                                <div>
                                    <span className="font-medium text-slate-500 dark:text-slate-400">Urgency: </span>
                                    <span className={`font-bold px-2 py-0.5 rounded-full ${getUrgencyColor(report.aiAnalysis.urgency)}`}>{report.aiAnalysis.urgency || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-slate-500 dark:text-slate-400">Sentiment: </span>
                                    <span className="font-semibold">{report.aiAnalysis.sentiment || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <p><strong className="font-medium text-slate-500 dark:text-slate-400">Category:</strong> {report.category}</p>
                    <p><strong className="font-medium text-slate-500 dark:text-slate-400">Submitted On:</strong> {report.createdAt.toDate().toLocaleString()}</p>
                    <p className="whitespace-pre-wrap"><strong className="font-medium text-slate-500 dark:text-slate-400">Description:</strong><br/>{report.description}</p>
                    {report.location && (
                        <p><strong className="font-medium text-slate-500 dark:text-slate-400">Location:</strong> <a href={`https://maps.google.com/?q=${report.location.lat},${report.location.lng}`} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">View on Map</a></p>
                    )}
                    {report.fileDataURI && (
                        <div>
                            <strong className="font-medium text-slate-500 dark:text-slate-400">Evidence:</strong>
                            <img src={report.fileDataURI} alt="Evidence" className="mt-2 rounded-lg max-w-full h-auto shadow-md border border-slate-200 dark:border-slate-700" />
                        </div>
                    )}
                 </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6">
                <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-4">Updates from Administration</h4>
                {report.updates && report.updates.length > 0 ? (
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {report.updates.slice().reverse().map((update, index) => (
                                <li key={index}>
                                    <div className="relative pb-8">
                                        {index !== report.updates.length - 1 && <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></span>}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center ring-8 ring-slate-50 dark:ring-slate-800/50">
                                                    <InfoIcon className="h-5 w-5 text-white" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">{update.message}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status changed to: <strong className="font-semibold">{update.newStatus}</strong></p>
                                                </div>
                                                <div className="text-right text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
                                                    <time dateTime={new Date(update.timestamp.seconds * 1000).toISOString()}>
                                                        {new Date(update.timestamp.seconds * 1000).toLocaleDateString()}
                                                    </time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No updates yet. The administration will post updates here.</p>
                )}
            </div>
        </div>
    );
}

function TrackReportView() {
    const [reportId, setReportId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (reportId.trim() === '') {
            setError('Please enter a Report ID.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReportData(null);
        try {
            const reportRef = doc(db, "reports", reportId.trim());
            const reportSnap = await getDoc(reportRef);
            if (reportSnap.exists()) {
                setReportData({ id: reportSnap.id, ...reportSnap.data() });
            } else {
                setError('No report found with this ID. Please check the ID and try again.');
            }
        } catch (err) {
            console.error("Error tracking report: ", err);
            setError('An error occurred while fetching the report.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-md mx-auto">
                <form onSubmit={handleTrack} className="flex space-x-3">
                    <input type="text" value={reportId} onChange={(e) => setReportId(e.target.value)} className="block w-full shadow-sm sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" placeholder="Enter your Report ID" />
                    <button type="submit" disabled={isLoading} className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-300">
                        {isLoading ? '...' : 'Track'}
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </div>
            {reportData && <ReportStatusDetails report={reportData} />}
        </div>
    );
}

function SafetyHeatmap() {
    const mapContainerRef = useRef(null);
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "reports"), where("location", "!=", null));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const reportsData = querySnapshot.docs.map(doc => doc.data());
            setReports(reportsData);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (mapContainerRef.current && !mapContainerRef.current._leaflet_id) {
            const map = window.L.map(mapContainerRef.current).setView(YOUR_CAMPUS_COORDINATES, 15);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            reports.forEach(report => {
                if (report.location && !['Harassment', 'Ragging', 'Academic', 'Emergency'].includes(report.category)) {
                    let color = report.aiAnalysis?.urgency === 'High' ? 'red' : report.aiAnalysis?.urgency === 'Medium' ? 'orange' : 'green';
                    window.L.circle([report.location.lat, report.location.lng], {
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.5,
                        radius: 50
                    }).addTo(map).bindPopup(`<b>${report.category}</b><br>${report.description.substring(0, 50)}...`);
                }
            });
        }
    }, [reports]);

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Campus Safety Hotspots</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">This map shows generalized locations of recent non-sensitive reports like maintenance or safety hazards to promote community awareness.</p>
            <div ref={mapContainerRef} className="h-[500px] w-full rounded-lg z-0"></div>
        </div>
    );
}

function StudentView() {
    const [activeTab, setActiveTab] = useState('submit');
    return (
        <div className="container mx-auto max-w-4xl animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Student Reporting Portal</h2>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">A safe, anonymous, and effective way to voice your concerns.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-md max-w-lg mx-auto mb-8">
                <div className="flex">
                    <button onClick={() => setActiveTab('submit')} className={`w-1/3 p-3 font-semibold rounded-lg transition-all ${activeTab === 'submit' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Submit</button>
                    <button onClick={() => setActiveTab('track')} className={`w-1/3 p-3 font-semibold rounded-lg transition-all ${activeTab === 'track' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Track</button>
                    <button onClick={() => setActiveTab('map')} className={`w-1/3 p-3 font-semibold rounded-lg transition-all ${activeTab === 'map' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Safety Map</button>
                </div>
            </div>
            {activeTab === 'submit' && <SubmitReportForm />}
            {activeTab === 'track' && <TrackReportView />}
            {activeTab === 'map' && <SafetyHeatmap />}
        </div>
    );
}

function EmergencyAlertModal({ report, onAction, onDismiss }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-fade-in">
            <div className="bg-slate-800 border-4 border-red-500 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-white text-center">
                <div className="animate-pulse flex justify-center mb-4">
                    <AlertTriangleIcon className="h-16 w-16 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-red-500 mb-2">EMERGENCY ALERT</h2>
                <p className="text-lg mb-4">High-urgency "Emergency" report submitted!</p>
                <div className="bg-slate-700 p-4 rounded-lg text-left mb-6">
                    <p><strong>Description:</strong> {report.description}</p>
                    {report.location && <p><strong>Location:</strong> Near coordinates {report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}</p>}
                </div>
                <div className="flex space-x-4">
                    <button onClick={onAction} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">INITIATE CAMPUS PROTOCOL</button>
                    <button onClick={onDismiss} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Dismiss</button>
                </div>
            </div>
        </div>
    );
}

function AdminReportDetail({ report, onBack }) {
    const [newStatus, setNewStatus] = useState(report.status);
    const [updateMessage, setUpdateMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (updateMessage.trim() === '' && newStatus === report.status) {
            setError('Please add an update message or change the status.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const reportRef = doc(db, "reports", report.id);
            const newUpdate = { message: updateMessage, newStatus: newStatus, timestamp: Timestamp.now() };
            const existingUpdates = report.updates ? [...report.updates] : [];
            await updateDoc(reportRef, { status: newStatus, updates: [...existingUpdates, newUpdate] });
            onBack();
        } catch (err) {
            console.error("Error updating report: ", err);
            setError('Failed to update report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-5xl">
            <button onClick={onBack} className="mb-4 text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-2">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Dashboard</span>
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ReportStatusDetails report={report} />
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sticky top-24">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Manage Report</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Update Status</label>
                                <select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-lg">
                                    {REPORT_STATUSES.map(stat => <option key={stat}>{stat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="updateMessage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Add Update Message</label>
                                <textarea id="updateMessage" rows="4" value={updateMessage} onChange={(e) => setUpdateMessage(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 'We are investigating this issue.'"></textarea>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-300">
                                {isLoading ? 'Updating...' : 'Save Update'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminDashboard({ reports }) {
    const [selectedReport, setSelectedReport] = useState(null);

    const getUrgencyColor = (urgency) => {
        if (urgency === 'High') return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        if (urgency === 'Medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    };

    if (selectedReport) return <AdminReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">AI Urgency</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Submitted</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {reports.map(report => (
                            <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(report.aiAnalysis?.urgency)}`}>
                                        {report.aiAnalysis?.urgency || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-200">{report.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{report.createdAt.toDate().toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedReport(report)} className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300">
                                        View / Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AnalyticsDashboard({ reports }) {
    const categoryCanvas = useRef(null);
    const statusCanvas = useRef(null);

    const highUrgencyCount = reports.filter(r => r.aiAnalysis?.urgency === 'High').length;
    const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

    useEffect(() => {
        if (!window.Chart) return; 
        window.Chart.defaults.color = '#9ca3af';
        window.Chart.defaults.font.family = "'Poppins', sans-serif";
        
        let categoryChartInstance, statusChartInstance;

        const categoryCounts = reports.reduce((acc, report) => {
            acc[report.category] = (acc[report.category] || 0) + 1;
            return acc;
        }, {});

        const statusCounts = reports.reduce((acc, report) => {
            acc[report.status] = (acc[report.status] || 0) + 1;
            return acc;
        }, {});

        if (categoryCanvas.current) {
            categoryChartInstance = new window.Chart(categoryCanvas.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categoryCounts),
                    datasets: [{
                        data: Object.values(categoryCounts),
                        backgroundColor: ['#14b8a6', '#f59e0b', '#3b82f6', '#ef4444', '#6b7280', '#8b5cf6', '#06b6d4'],
                        borderColor: '#1e293b',
                    }]
                },
                options: { responsive: true, plugins: { legend: { position: 'top', labels: { color: '#d1d5db' } } } }
            });
        }

        if (statusCanvas.current) {
            statusChartInstance = new window.Chart(statusCanvas.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(statusCounts),
                    datasets: [{
                        label: 'Report Count',
                        data: Object.values(statusCounts),
                        backgroundColor: '#06b6d4',
                        borderColor: '#0891b2',
                        borderWidth: 1,
                        borderRadius: 5
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: '#334155'} }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#334155'} } } }
            });
        }

        return () => {
            if (categoryChartInstance) categoryChartInstance.destroy();
            if (statusChartInstance) statusChartInstance.destroy();
        };
    }, [reports]);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Reports</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{reports.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">High-Urgency Alerts</p>
                    <p className="text-4xl font-bold text-red-500 mt-1">{highUrgencyCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Issues Resolved</p>
                    <p className="text-4xl font-bold text-green-500 mt-1">{resolvedCount}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl"><canvas ref={categoryCanvas}></canvas></div>
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl"><canvas ref={statusCanvas}></canvas></div>
            </div>
        </div>
    );
}

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
            console.error("Login error: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-10 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                    <ShieldIcon className="h-12 w-12 text-cyan-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Admin Login</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2.5 shadow-sm sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2.5 shadow-sm sm:text-sm border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-300">
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AdminPortal() {
    const [adminView, setAdminView] = useState('dashboard');
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [emergency, setEmergency] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReports(reportsData);
            setIsLoading(false);

            const newEmergency = reportsData.find(r => r.category === 'Emergency' && r.status === 'Submitted' && r.aiAnalysis?.urgency === 'High');
            if (newEmergency) {
                setEmergency(newEmergency);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleEmergencyAction = async () => {
        if (emergency) {
            const reportRef = doc(db, "reports", emergency.id);
            await updateDoc(reportRef, { status: "Action Taken" });
            setEmergency(null);
        }
    };

    return (
        <div className="container mx-auto animate-fade-in">
            {emergency && <EmergencyAlertModal report={emergency} onAction={handleEmergencyAction} onDismiss={() => setEmergency(null)} />}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                <button onClick={() => setAdminView('dashboard')} className={`px-4 py-3 text-sm font-medium transition-colors ${adminView === 'dashboard' ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
                <button onClick={() => setAdminView('analytics')} className={`px-4 py-3 text-sm font-medium transition-colors ${adminView === 'analytics' ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-700'}`}>Analytics</button>
            </div>
            {isLoading && <div className="text-center p-10">Loading reports...</div>}
            {!isLoading && adminView === 'dashboard' && <AdminDashboard reports={reports} />}
            {!isLoading && adminView === 'analytics' && <AnalyticsDashboard reports={reports} />}
        </div>
    );
}

function PortalView() {
    const [view, setView] = useState('student');
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    if (loadingAuth) return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">Loading Authentication...</div>;
    
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}>
            <Header view={view} setView={setView} user={user} />
            <main className="p-4 md:p-8">
                {view === 'student' && <StudentView />}
                {view === 'admin' && (user ? <AdminPortal /> : <AdminLogin />)}
            </main>
            <Footer />
        </div>
    );
}

// --- The Top-Level App Component ---
function App() {
    const [currentView, setCurrentView] = useState('homepage');
    
    if (currentView === 'homepage') {
        return <HomePage onEnterPortal={() => setCurrentView('portal')} />;
    }
    
    return <PortalView />;
}

export default App;
