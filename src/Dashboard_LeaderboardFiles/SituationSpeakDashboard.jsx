import React from 'react';
import BaseDashboard from './BaseDashboard';

const SituationSpeakContent = () => {
  return <div />;
};

function SituationSpeakDashboard() {
  return (
    <BaseDashboard
      testType="situational"
      testTitle="Situation Speak"
      testDescription="Practice speaking in different scenarios"
      apiTestType="SITUATIONSPEAK"
    >
      <SituationSpeakContent />
    </BaseDashboard>
  );
}

export default SituationSpeakDashboard;
