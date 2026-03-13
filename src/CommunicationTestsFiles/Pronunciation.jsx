import React from 'react';
import BaseComponent2 from './BaseComponent2';

export default function Pronunciation() {
    return (
        <BaseComponent2
            testType="pronunciation"
            testTitle="Pronunciation Test"
            testDescription="Test your pronunciation accuracy with 5 sentences"
            testLevel="basic"
            testDuration={180}
            apiEndpoint="https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/jamagent-test"
            recordingMode="short"
            autoStartMessage="hi"
        />
    );
}
