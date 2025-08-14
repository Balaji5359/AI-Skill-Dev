import json
import random

SENTENCES = {
    "basic": [
        "The quick brown fox jumps over the lazy dog.",
        "She sells seashells by the seashore.",
        "Peter Piper picked a peck of pickled peppers.",
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        "Red leather, yellow leather, red leather, yellow leather.",
        "A big black bug bit a big black bear.",
        "Six sick slick slim sycamore saplings.",
        "Betty Botter bought some butter but the butter was bitter.",
        "Unique New York, you know you need unique New York.",
        "The thirty-three thieves thought they thrilled the throne.",
        "Toy boat, toy boat, toy boat.",
        "Fresh fried fish, fish fresh fried.",
        "Good blood, bad blood.",
        "A proper copper coffee pot.",
        "Can you can a can as a canner can can a can?",
        "I saw Susie sitting in a shoeshine shop.",
        "How can a clam cram in a clean cream can?"
    ],
    "medium": [
        "The sophisticated entrepreneur successfully established extraordinary enterprises.",
        "International organizations coordinate collaborative environmental initiatives worldwide.",
        "Professional photographers capture breathtaking landscapes with precision and creativity.",
        "Educational institutions implement innovative pedagogical approaches for development.",
        "Technological advancements revolutionize communication systems across global networks.",
        "Archaeological expeditions uncover fascinating historical artifacts from ancient civilizations.",
        "Pharmaceutical companies develop therapeutic treatments through rigorous clinical trials.",
        "Meteorological phenomena influence agricultural productivity and economic stability.",
        "Architectural masterpieces demonstrate exceptional engineering and aesthetic principles.",
        "Conscientious scientists consistently conduct comprehensive research methodologies.",
        "Manufacturing industries utilize sophisticated automation technologies for efficiency.",
        "Environmental conservation requires collaborative international cooperation and commitment.",
        "Financial institutions provide comprehensive investment advisory services globally.",
        "Transportation infrastructure development requires substantial governmental investment.",
        "Healthcare professionals demonstrate exceptional dedication to patient care.",
        "Academic researchers publish groundbreaking discoveries in scientific journals."
    ],
    "hard": [
        "The inexorable proliferation of technological innovations necessitates comprehensive regulatory frameworks.",
        "Multidisciplinary collaboration facilitates unprecedented breakthroughs in biomedical research paradigms.",
        "Socioeconomic disparities exacerbate systemic inequalities within contemporary democratic institutions.",
        "Epistemological considerations regarding consciousness remain fundamentally contentious among philosophers.",
        "Neuroplasticity research demonstrates remarkable adaptability within human cognitive architectures.",
        "Geopolitical ramifications of climate change require multilateral diplomatic negotiations.",
        "Quantum mechanical phenomena challenge conventional understanding of deterministic processes.",
        "Psycholinguistic studies reveal intricate relationships between language acquisition and cognition.",
        "Biotechnological applications in agriculture raise ethical questions about genetic modification.",
        "Phenomenological approaches to consciousness studies emphasize subjective experiential dimensions.",
        "Macroeconomic fluctuations significantly influence microeconomic decision-making processes.",
        "Interdisciplinary methodologies enhance comprehensive understanding of complex phenomena.",
        "Constitutional jurisprudence establishes fundamental principles governing democratic societies.",
        "Anthropological investigations illuminate cultural diversity across human civilizations.",
        "Philosophical epistemology examines fundamental questions about knowledge and reality.",
        "Computational linguistics advances natural language processing capabilities significantly.",
        "Biochemical processes regulate physiological functions within living organisms."
    ]
}

def getPronunciationSentences():
    """Returns 5 random pronunciation sentences: 2 basic, 2 medium, 1 hard."""
    basic_sentences = random.sample(SENTENCES["basic"], 2)
    medium_sentences = random.sample(SENTENCES["medium"], 2)
    hard_sentences = random.sample(SENTENCES["hard"], 1)
    
    selected_sentences = basic_sentences + medium_sentences + hard_sentences
    random.shuffle(selected_sentences)
    
    return {
        "sentence1": selected_sentences[0],
        "sentence2": selected_sentences[1],
        "sentence3": selected_sentences[2],
        "sentence4": selected_sentences[3],
        "sentence5": selected_sentences[4]
    }

def lambda_handler(event, context):
    """AWS Lambda handler for pronunciation sentence generation."""
    function = event.get('function', '')
    
    if function == 'getPronunciationSentences':
        result = getPronunciationSentences()
        return {
            'messageVersion': '1.0',
            'response': {
                'actionGroup': event.get('actionGroup', ''),
                'function': function,
                'functionResponse': {
                    'responseBody': {
                        'TEXT': {
                            'body': f"Here are your pronunciation sentences:\nSentence 1: {result['sentence1']}\nSentence 2: {result['sentence2']}\nSentence 3: {result['sentence3']}\nSentence 4: {result['sentence4']}\nSentence 5: {result['sentence5']}"
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