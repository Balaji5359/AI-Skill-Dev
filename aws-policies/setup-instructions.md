# AWS Lambda Policies Setup for getPronunciationSentencesFunction

## Step 1: Create Lambda Execution Role
```bash
aws iam create-role \
  --role-name getPronunciationSentencesRole \
  --assume-role-policy-document file://trust-policy.json
```

## Step 2: Attach Basic Lambda Execution Policy
```bash
aws iam attach-role-policy \
  --role-name getPronunciationSentencesRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

## Step 3: Add Resource-Based Policy to Lambda Function
```bash
aws lambda add-permission \
  --function-name getPronunciationSentencesFunction \
  --statement-id bedrock-invoke \
  --action lambda:InvokeFunction \
  --principal bedrock.amazonaws.com
```

## Alternative: Use AWS Console
1. Go to Lambda Console → getPronunciationSentencesFunction
2. Configuration → Permissions → Resource-based policy statements
3. Add statement:
   - Statement ID: bedrock-invoke
   - Principal: bedrock.amazonaws.com
   - Action: lambda:InvokeFunction

## Verify Permissions
```bash
aws lambda get-policy --function-name getPronunciationSentencesFunction
```