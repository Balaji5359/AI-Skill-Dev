import React from "react";
import { useNavigate } from "react-router-dom";
import "./activities.css";

function Activities() {
    const navigate = useNavigate();

    // Navigation handlers
    const handleStartJamTest = () => {
        navigate("/jam-test-data");
    };
    const handleStartPronunciationTestS = () => {
        navigate("/pronunciation-test-s-data");
    };
    const handleStartPronunciationTestL = () => {
        navigate("/pronunciation-test-l-data");
    };
    const handleStartRoleBasedInterview = () => {
        navigate("/role-based-interview-data");
    };

    // Updated ActivityButton to accept onStart prop
    const ActivityButton = ({ path, title, icon, startButton, onStart }) => {
        return (
            <div className="relative group w-full p-6 rounded-xl border-2 transition-all duration-300 bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg">
                <div className="flex items-center justify-between">
                    <div 
                        onClick={() => navigate(path)}
                        className="cursor-pointer flex items-center space-x-4"
                    >
                        <div className="text-2xl text-blue-600">
                            {icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-800">
                                {title}
                            </h3>
                        </div>
                    </div>
                    {startButton && (
                        <button
                            onClick={onStart}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-black font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-green-400"
                        >
                            {startButton}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8" style={{marginTop: '100px'}}>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Gen-AI Agent Activities
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Enhance your communication, technical, interview and other
                        placement related skills with AI-powered activities
                    </p>
                </div>
                <h3 className="text-4xl font-bold text-gray-600 mb-4">
                        Gen-AI Agent Tests
                </h3>
                {/* Activity Test Boxes */}
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <ActivityButton
                        path="/activities"
                        title="JAM Test with GenAI Agent"
                        icon="🎤"
                        startButton="Start JAM Test"
                        onStart={handleStartJamTest}
                    />
                    <ActivityButton
                        path="/activities"
                        title="Pronunciation Test - Spoken with GenAI Agent"
                        icon="🗣️"
                        startButton="Start Pronunciation Test - Spoken"
                        onStart={handleStartPronunciationTestS}
                    />
                    <ActivityButton
                        path="/activities"
                        title="Pronunciation Test - Listening with GenAI Agent"
                        icon="👂"
                        startButton="Start Pronunciation Test - Listening"
                        onStart={handleStartPronunciationTestL}
                    />
                    <ActivityButton
                        path="/activities"
                        title="Role Based Interview with GenAI Agent"
                        icon="🎭"
                        startButton="Start Role Based Interview"
                        onStart={handleStartRoleBasedInterview}
                    />
                </div>

                <h3 className="text-4xl font-bold text-gray-600 mb-4">
                        Pratice with Gen-AI Agent
                </h3>
                {/* Activity Practice Boxes */}
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <ActivityButton
                        path="/activities"
                        title="Practice JAM with GenAI Agent"
                        icon="📄"
                    />
                    <ActivityButton
                        path="/activities"
                        title="Practice Pronunciation - Spoken with GenAI Agent"
                        icon="📚"
                    />
                    <ActivityButton
                        path="/activities"
                        title="Practice Pronunciation - Listening with GenAI Agent"
                        icon="📄"
                    />
                </div>
                
                {/* Back Button */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/profiledata')}
                        className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                        ← Back to Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Activities;
