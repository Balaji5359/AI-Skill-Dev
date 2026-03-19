import React from 'react';
import BaseComponent from './BaseComponent';

const AGENT_API = import.meta.env.VITE_COMM_TEST_AGENT_API;

export default function SituationSpeak() {
    return (
        <BaseComponent
            testType="situation"
            testTitle="Situational Speaking"
            testDescription={<span>Practice real-life scenarios to build confidence with <strong>Tara AI</strong></span>}
            testLevel="basic"
            testDuration={180}
            apiEndpoint={AGENT_API}
            recordingMode="long"
            autoStartMessage="hi"
        />
    );
}
