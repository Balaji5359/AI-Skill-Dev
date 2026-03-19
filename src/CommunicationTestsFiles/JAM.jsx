import React from 'react';
import BaseComponent from './BaseComponent';

const AGENT_API = import.meta.env.VITE_COMM_TEST_AGENT_API;

export default function JAM() {
    return (
        <BaseComponent
            testType="jam"
            testTitle="JAM Test"
            testDescription={<span>JAM speaking sessions to improve spontaneous communication with <strong>Tara AI</strong></span>}
            testLevel="basic"
            testDuration={180}
            apiEndpoint={AGENT_API}
            recordingMode="long"
            autoStartMessage="hi"
        />
    );
}
