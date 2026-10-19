import { AWS_CONFIG } from '../constants/config';

export async function loginCognito(username: string, password: string): Promise<string> {
  const response = await fetch(AWS_CONFIG.COGNITO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
    },
    body: JSON.stringify({
      ClientId: AWS_CONFIG.COGNITO_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error autenticando en Cognito');
  }

  return data.AuthenticationResult.AccessToken;
}