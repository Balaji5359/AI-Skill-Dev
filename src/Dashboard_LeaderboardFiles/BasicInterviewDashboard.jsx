import React, { useState } from "react";
import BaseInterviewResultsDashboard from "./BaseInterviewResultsDashboard";

const BasicInterviewDashboard = () => {
  const [activeMode, setActiveMode] = useState("practice");

  return (
    <div>
      <BaseInterviewResultsDashboard
        mode={activeMode}
        title="Basic Interview Dashboard"
        onModeChange={setActiveMode}
      />
    </div>
  );
};

export default BasicInterviewDashboard;
