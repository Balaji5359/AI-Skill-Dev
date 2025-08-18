import React from "react";
import { useNavigate } from "react-router-dom";

function MentorStudentTests() {
    const navigate = useNavigate();

    const testCategories = [
        {
            title: "JAM Test Data",
            description: "View student performance in Just A Minute sessions",
            icon: "🎤",
            route: "/mentor_student_tests_jam",
            color: "from-purple-500 to-indigo-600",
            hoverColor: "hover:from-purple-600 hover:to-indigo-700"
        },
        {
            title: "Spoken Test Data",
            description: "Analyze student speaking skills and pronunciation",
            icon: "🗣️",
            route: "/mentor_student_tests_pron_s",
            color: "from-blue-500 to-cyan-600",
            hoverColor: "hover:from-blue-600 hover:to-cyan-700"
        },
        {
            title: "Listening Test Data",
            description: "Review student listening comprehension results",
            icon: "👂",
            route: "/mentor_student_tests",
            color: "from-emerald-500 to-teal-500",
            hoverColor: "hover:from-emerald-600 hover:to-teal-700"
        },
        {
            title: "Role-Based-Interview-Data",
            description: "Review student role based interview results",
            icon: "👂",
            route: "/mentor_student_tests_role_based_interview",
            color: "from-purple-500 to-teal-500",
            hoverColor: "hover:from-red-600 hover:to-teal-600"

        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <br></br>
                    <br></br>
                    <br></br>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Student Test Reports
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Access comprehensive analytics and performance data for all student assessments
                    </p>
                </div>

                {/* Test Categories Grid */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {testCategories.map((category, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(category.route)}
                                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                            >
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                    <div className={`h-32 bg-gradient-to-br ${category.color} ${category.hoverColor} transition-all duration-300 flex items-center justify-center`}>
                                        <span className="text-5xl filter drop-shadow-lg">
                                            {category.icon}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {category.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {category.description}
                                        </p>
                                        <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors">
                                            <span>View Reports</span>
                                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Overview */}
                

                {/* Back Button */}
                <div className="text-center">
                    <button
                        onClick={() => navigate("/mentor_profile")}
                        className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 border border-gray-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Mentor Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MentorStudentTests;
