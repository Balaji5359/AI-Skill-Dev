import React from 'react';
import BaseComponent2 from './BaseComponent2';

export default function Listening() {
    return (
        <BaseComponent2
            testType="listening"
            testTitle="Listening Test"
            testDescription="Test your listening skills by listen and speaking of 5 sentences"
            testLevel="basic"
            testDuration={180}
            apiEndpoint="https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/jamagent-test"
            recordingMode="short"
            autoStartMessage="hi"
        />
    );
}
