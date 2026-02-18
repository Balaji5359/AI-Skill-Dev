import React from 'react';
import BaseDashboard from './BaseDashboard';

const ListeningContent = () => {
  return <div />;
};

function ListeningDashboard() {
  return (
    <BaseDashboard
      testType="listening"
      testTitle="Listening"
      testDescription="Enhance your listening comprehension skills"
      apiTestType="LISTENING"
    >
      <ListeningContent />
    </BaseDashboard>
  );
}

export default ListeningDashboard;
