import React, { useEffect, useState } from 'react';
import './MentorJAMTestDashboard.css';

const MentorJAMTestDashboard = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [yearFilter, setYearFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    'https://v6iq49ttb1.execute-api.ap-south-1.amazonaws.com/dev/get-pron-spoken-analysis',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
                const text = await res.text();
                const parsed = JSON.parse(JSON.parse(text).body);
                const sortedStudents = parsed.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
                setStudents(sortedStudents);
                setFilteredStudents(sortedStudents);
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    useEffect(() => {
        let filtered = students.filter(student => {
            const matchesSearch = searchTerm === '' || 
                student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.section?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesYear = yearFilter === 'all' || student.year_of_study === yearFilter;
            const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
            
            return matchesSearch && matchesYear && matchesSection;
        });

        filtered.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.rollNo.localeCompare(b.rollNo);
            } else {
                return b.rollNo.localeCompare(a.rollNo);
            }
        });

        setFilteredStudents(filtered);
    }, [students, searchTerm, sortOrder, yearFilter, sectionFilter]);

    const extractRating = (session) => {
        const convo = session.conversation || [];
        for (let exchange of convo) {
            const scoreMatch = exchange.agent?.match(/Pronunciation Score:\s*(\d+(?:\.\d+)?)\/10/);
            if (scoreMatch) return parseFloat(scoreMatch[1]);
        }
        return null;
    };

    const getAverageRating = (student) => {
        const ratings = student.history?.map(extractRating).filter(r => r !== null) || [];
        return ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
    };



    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setSelectedSession(null);
        setViewMode('history');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedStudent(null);
        setSelectedSession(null);
    };

    if (loading) {
        return (
            <div className="mentor-jam-dashboard">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading student data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mentor-jam-dashboard">
                <div className="error-display">
                    <div className="error-icon">⚠️</div>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mentor-jam-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>🎤 Mentor Pronunciation Test-Spoken Dashboard</h1>
                    <p>Monitor student pronunciation performance and track progress</p><br></br>
                    {/* Back button to /mentor_student_tests*/}
                    <button onClick={() => window.location.href = '/mentor_student_tests'} className="back-button">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Tests</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            {viewMode === 'list' && (
                <div className="filters-section">
                    <div className="filters-container">
                        {/* Search */}
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by name, roll number, branch, section..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Sort Order */}
                        <div className="filter-group">
                            <label className="filter-label">Sort:</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="filter-select"
                            >
                                <option value="asc">Roll No. A-Z</option>
                                <option value="desc">Roll No. Z-A</option>
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Year:</label>
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Years</option>
                                <option value="1st">1st Year</option>
                                <option value="2nd">2nd Year</option>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                            </select>
                        </div>

                        {/* Section Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Section:</label>
                            <select
                                value={sectionFilter}
                                onChange={(e) => setSectionFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Sections</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="C">Section C</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'list' ? (
                /* Student List View */
                <div className="students-container">
                    <div className="students-header">
                        <h2>👥 Students ({filteredStudents.length} of {students.length})</h2>
                    </div>
                    
                    <div className="students-list">
                        {filteredStudents.map((student, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleStudentClick(student)}
                                className="student-item"
                            >
                                <div className="student-info">
                                    <div className="student-avatar">
                                        {student.name?.charAt(0) || student.rollNo?.charAt(0) || '?'}
                                    </div>
                                    <div className="student-details">
                                        <h3>{student.name || 'Unknown'}</h3>
                                        <p>{student.rollNo}</p>
                                        
                                        <div className="student-stats">
                                            <div className="stat-item">
                                                <div className="stat-label">Year</div>
                                                <div className="stat-value">{student.year_of_study}</div>
                                            </div>
                                            <div className="stat-item">
                                                <div className="stat-label">Branch</div>
                                                <div className="stat-value">{student.branch}</div>
                                            </div>
                                            <div className="stat-item">
                                                <div className="stat-label">Section</div>
                                                <div className="stat-value">{student.section || 'N/A'}</div>
                                            </div>
                                            <div className="stat-item">
                                                <div className="stat-label">Total Tests</div>
                                                <div className="stat-value">{student.totalTests}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="rating-display">
                                    <div className="rating-value">
                                        {getAverageRating(student)}
                                    </div>
                                    
                                </div>
                                
                                <div className="arrow-icon">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* History View */
                <div>
                    {/* Back Button */}
                    <button onClick={handleBackToList} className="back-button">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Students</span>
                    </button>

                    <div className="history-container">
                        <div className="history-header">
                            <h2>📚 {selectedStudent?.name} - Pronunciation Session History</h2>
                            <p>{selectedStudent?.rollNo} • {selectedStudent?.totalTests} sessions</p>
                        </div>

                        <div className="split-layout">
                            {/* Sessions Sidebar */}
                            <div className="sessions-sidebar">
                                <h3>📋 Sessions</h3>
                                {selectedStudent?.history?.length > 0 ? (
                                    <div>
                                        {selectedStudent.history.map((session, idx) => (
                                            <div
                                                // add heading to each session as Id
                                                aria-labelledby={`session-${session.sessionId}`}
                                                key={idx}
                                                onClick={() => setSelectedSession(selectedSession?.sessionId === session.sessionId ? null : session)}
                                                className={`session-item ${
                                                    selectedSession?.sessionId === session.sessionId ? 'active' : ''
                                                }`}
                                            >
                                                <div className="session-id">{session.sessionId}</div>
                                                {/* Make date date-month-year */}
                                                <div className="session-time">
                                                    {new Date(session.sessionTime).toLocaleString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: false
                                                    })}
                                                </div>
                                                <div className="session-rating" style={{ color: getScoreCategory(extractRating(session) || 0).color }}>
                                                    Rating: {extractRating(session) || 'N/A'} - {getScoreCategory(extractRating(session) || 0).text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No sessions available</p>
                                )}
                            </div>

                            {/* Conversation Display */}
                            <div className="conversation-display">
                                {selectedSession ? (
                                    <div>
                                        <h3>🎤 Pronunciation Test Details</h3>
                                        <div className="conversation-content">
                                            {selectedSession.conversation?.map((exchange, idx) => (
                                                <div key={idx} className="message-pair">
                                                    <div className="user-message">
                                                        <div className="message-label">
                                                            <span>👨‍🎓</span>Student:
                                                        </div>
                                                        <div className="message-content">{exchange.user}</div>
                                                    </div>
                                                    <div className="agent-message">
                                                        <div className="message-label">
                                                            <span>🎤</span>Pronunciation Agent:
                                                        </div>
                                                        <div className="message-content">{exchange.agent}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-conversation">
                                        <div className="empty-conversation-icon">💬</div>
                                        <p>Select a session to view conversation</p>
                                        <p>Click on any session from the left panel</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default MentorJAMTestDashboard;

