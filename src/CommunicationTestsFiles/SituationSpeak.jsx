import React from 'react';
import BaseComponent from './BaseComponent';

export default function SituationSpeak() {
    return (
        <BaseComponent
            testType="situation"
            testTitle="Situational Speaking"
            testDescription="Practice real-life scenarios to build confidence"
            testLevel="basic"
            testDuration={600}
            apiEndpoint="https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/comm-test-ai-agent"
            recordingMode="long"
            autoStartMessage="hi"
        />
    );
}
