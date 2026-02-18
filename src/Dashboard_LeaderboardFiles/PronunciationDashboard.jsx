import React from 'react';
import BaseDashboard from './BaseDashboard';

const PronunciationContent = () => {
  return <div />;
};

function PronunciationDashboard() {
  return (
    <BaseDashboard
      testType="pronunciation"
      testTitle="Pronunciation"
      testDescription="Perfect your pronunciation with AI-powered feedback"
      apiTestType="PRONUNCIATION"
    >
      <PronunciationContent />
    </BaseDashboard>
  );
}

export default PronunciationDashboard;
