import React from 'react';
import BaseDashboard from './BaseDashboard';
import './dashboard-styles.css';

const JAMContent = ({ activeSection, userType, testType, userEmail }) => {
  return <div></div>;
};

function JAMDashboard() {
  return (
    <BaseDashboard
      testType="jam"
      testTitle="JAM Sessions"
      testDescription="Self-analyze your Just A Minute sessions"
      apiTestType="jam"
    >
      <JAMContent />
    </BaseDashboard>
  );
}

export default JAMDashboard;