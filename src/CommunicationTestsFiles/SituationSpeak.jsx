import React from 'react';
import BaseComponent from './BaseComponent';

export default function SituationSpeak() {
    return (
        <BaseComponent
            testType="situation"
            testTitle="Situational Speaking"
            testDescription={<span>Practice real-life scenarios to build confidence with <strong>Tara AI</strong></span>}
            testLevel="basic"
            testDuration={180}
            apiEndpoint="https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/jamagent-test"
            recordingMode="long"
            autoStartMessage="hi"
        />
    );
}
