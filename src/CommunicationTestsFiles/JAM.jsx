import React from 'react';
import BaseComponent from './BaseComponent';

export default function JAM() {
    return (
        <BaseComponent
            testType="jam"
            testTitle="JAM Test"
            testDescription="JAM speaking sessions to improve spontaneous communication"
            testLevel="basic"
            testDuration={180}
            apiEndpoint="https://ibxdsy0e40.execute-api.ap-south-1.amazonaws.com/dev/jamagent-test"
            recordingMode="long"
            autoStartMessage="hi"
        />
    );
}
