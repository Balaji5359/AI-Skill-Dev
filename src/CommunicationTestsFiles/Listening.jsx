import React from 'react';
import BaseComponent2 from './BaseComponent2';

const AGENT_API = import.meta.env.VITE_COMM_TEST_AGENT_API;

export default function Listening() {
    return (
        <BaseComponent2
            testType="listening"
            testTitle="Listening Test"
            testDescription={<span>Test your listening skills by listening and speaking of 5 sentences from <strong>Tara AI</strong></span>}
            testLevel="basic"
            testDuration={180}
            apiEndpoint={AGENT_API}
            recordingMode="short"
            autoStartMessage="hi"
        />
    );
}
