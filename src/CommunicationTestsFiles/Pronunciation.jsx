import React from 'react';
import BaseComponent2 from './BaseComponent2';

const AGENT_API = import.meta.env.VITE_COMM_TEST_AGENT_API;

export default function Pronunciation() {
    return (
        <BaseComponent2
            testType="pronunciation"
            testTitle="Pronunciation Test"
            testDescription={<span>Test your pronunciation accuracy with 5 sentences from <strong>Tara AI</strong></span>}
            testLevel="basic"
            testDuration={180}
            apiEndpoint={AGENT_API}
            recordingMode="short"
            autoStartMessage="hi"
        />
    );
}
