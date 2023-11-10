
const generatePolicy = (principalId, resource, effect = 'Allow') => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};

const decodeBase64 = (encodedString) => {
  return Buffer.from(encodedString, 'base64').toString('utf-8');
};

module.exports.basicAuthorizer = (event, _context, callback) => {
  console.log({ event });

  const { headers } = event;
  const authorizationHeader = headers && headers.authorization;

  if (event.type !== 'REQUEST' || !authorizationHeader) {
    callback('Unauthorized');
  }

  const encodedCredentials = authorizationHeader.replace('Basic ', '');

  if (!encodedCredentials) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: 'Token parameter is missing' }),
    });
  }

  try {
    const decodedCredentials = decodeBase64(encodedCredentials);
    console.log({decodedCredentials})
    const [providedUsername, providedPassword] = decodedCredentials.split('=');
    const expectedPassword = process.env[providedUsername];

    const effect = (expectedPassword && expectedPassword === providedPassword) ? 'Allow' : 'Deny';
    const policy = generatePolicy(encodedCredentials, event.routeArn, effect);

    callback(null, policy);
  } catch(err) {
    callback(`Unauthorized ${err?.message}`);
  }
};