import json
import boto3
from datetime import datetime, timezone, timedelta

# DynamoDB table
dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
table = dynamodb.Table('CarrerGuideAI_DB')

# Bedrock Agent client
bedrock_client = boto3.client('bedrock-agent-runtime', region_name='ap-south-1')

def lambda_handler(event, context):
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})

        message = body.get('message', '').strip()
        session_id = body.get('sessionId', 'default-session')  # Fixed: use sessionId not id
        lang = body.get('lang', 'en-US')
        email = body.get('email', '')

        if not message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Message cannot be empty'})
            }

        print(f"Incoming message: {message}, session: {session_id}, lang: {lang}")

        # Send request to Bedrock Agent with sessionId
        response = bedrock_client.invoke_agent(
            agentId='DHFHEXWIGL',
            agentAliasId='IHDDWCSGOB',
            sessionId=session_id,  # This ensures separate conversations
            inputText=message
        )

        # Collect agent response from stream
        completion = ""
        for event_chunk in response['completion']:
            if 'chunk' in event_chunk and 'bytes' in event_chunk['chunk']:
                completion += event_chunk['chunk']['bytes'].decode('utf-8')

        print(f"Agent response: {completion}")

        # Get existing conversation history for this specific sessionId
        existing = table.get_item(Key={'sessionId': session_id})  # Fixed: use sessionId as key
        history = existing.get('Item', {}).get('conversationHistory', [])

        if not isinstance(history, list):
            history = []

        # Add new interaction
        chennai_tz = timezone(timedelta(hours=5, minutes=30))
        current_time = datetime.now(chennai_tz).strftime('%Y-%m-%d %H:%M:%S')

        history.append({
            'timestamp': current_time,
            'user': message,
            'agent': completion,
            'language': lang
        })

        # Save back to DynamoDB with sessionId as primary key
        table.put_item(
            Item={
                'sessionId': session_id,  # Primary key
                'conversationHistory': history,
                'email': email,
                'lastUpdated': current_time,
                'language': lang
            }
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'response': completion,
                'sessionId': session_id
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }