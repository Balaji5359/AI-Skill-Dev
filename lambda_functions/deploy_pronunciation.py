#!/usr/bin/env python3
"""Deploy script for pronunciation Lambda function"""

import zipfile
import os
import json

def create_deployment_package():
    """Create a deployment package for the pronunciation Lambda function"""
    
    # Files to include in the deployment package
    files_to_include = [
        'pronunciation_action_group.py',
        'requirements.txt'
    ]
    
    # Create deployment package
    with zipfile.ZipFile('pronunciation_function.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file in files_to_include:
            if os.path.exists(file):
                zipf.write(file)
                print(f"✅ Added {file} to deployment package")
            else:
                print(f"❌ Warning: {file} not found")
    
    print(f"\n📦 Deployment package created: pronunciation_function.zip")
    print(f"📏 Package size: {os.path.getsize('pronunciation_function.zip')} bytes")

def print_lambda_config():
    """Print recommended Lambda configuration"""
    config = {
        "FunctionName": "getPronunciationSentencesFunction",
        "Runtime": "python3.9",
        "Handler": "pronunciation_action_group.lambda_handler",
        "Timeout": 30,
        "MemorySize": 128,
        "Environment": {
            "Variables": {}
        }
    }
    
    print("\n🔧 Recommended Lambda Configuration:")
    print(json.dumps(config, indent=2))

if __name__ == "__main__":
    print("Creating deployment package for pronunciation Lambda function...")
    create_deployment_package()
    print_lambda_config()
    
    print("\n📋 Deployment Steps:")
    print("1. Upload pronunciation_function.zip to your Lambda function")
    print("2. Set Handler to: pronunciation_action_group.lambda_handler")
    print("3. Set Runtime to: python3.9 (or python3.8)")
    print("4. Set Timeout to: 30 seconds")
    print("5. Set Memory to: 128 MB")
    print("6. Test the function with the test event from test_pronunciation.py")