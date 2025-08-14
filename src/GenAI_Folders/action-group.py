import json
import random

# Pre-define topics to avoid repeated dictionary creation
TOPICS = {
    "easy": [
        "My favorite hobby",
        "A day in my life", 
        "My best friend",
        "My favorite food",
        "A memorable vacation"
    ],
    "medium": [
        "Social media impact on youth",
        "Online education vs traditional education",
        "Climate change solutions",
        "Work-life balance",
        "Technology in healthcare"
    ],
    "advanced": [
        "Artificial intelligence ethics",
        "Cryptocurrency and future economy",
        "Space exploration priorities",
        "Genetic engineering implications",
        "Quantum computing revolution"
    ]
}

def getJamTopics():
    """Returns 2 random JAM topics from different difficulty levels."""
    levels = list(TOPICS.keys())
    selected_levels = random.sample(levels, 2)
    
    return {
        "topic1": random.choice(TOPICS[selected_levels[0]]),
        "topic2": random.choice(TOPICS[selected_levels[1]])
    }

def lambda_handler(event, context):
    """AWS Lambda handler for JAM topic generation action group."""
    function = event.get('function', '')
    
    if function == 'getJamTopics':
        result = getJamTopics()
        return {
            'messageVersion': '1.0',
            'response': {
                'actionGroup': event.get('actionGroup', ''),
                'function': function,
                'functionResponse': {
                    'responseBody': {
                        'TEXT': {
                            'body': f"Here are your JAM topics:\nTopic 1: {result['topic1']}\nTopic 2: {result['topic2']}"
                        }
                    }
                }
            }
        }
    
    return {
        'messageVersion': '1.0',
        'response': {
            'actionGroup': event.get('actionGroup', ''),
            'function': function,
            'functionResponse': {
                'responseBody': {
                    'TEXT': {
                        'body': 'Function not found'
                    }
                }
            }
        }
    }