#!/usr/bin/env python3
"""Test script for pronunciation_action_group.py"""

import json
from pronunciation_action_group import lambda_handler

def test_pronunciation_function():
    """Test the getPronunciationSentences function"""
    
    # Test event that mimics Bedrock Agent call
    test_event = {
        'function': 'getPronunciationSentences',
        'actionGroup': 'PronunciationActionGroup'
    }
    
    # Test context (minimal for testing)
    test_context = {}
    
    try:
        result = lambda_handler(test_event, test_context)
        print("✅ Function executed successfully!")
        print(json.dumps(result, indent=2))
        return True
    except Exception as e:
        print(f"❌ Function failed with error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing pronunciation Lambda function...")
    success = test_pronunciation_function()
    if success:
        print("\n✅ Local test passed - the issue is likely with Lambda configuration")
    else:
        print("\n❌ Local test failed - there's an issue with the code")