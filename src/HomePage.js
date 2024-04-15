import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { httpClient } from './HttpClient';
import Keycloak from 'keycloak-js';

const HomePage = () => {
  const [infoMessage, setInfoMessage] = useState('');
  const [kc, setKc] = useState(null);

  useEffect(() => {
    let initOptions = {
    //   url: 'https://kc2.ehrn.ehr.network/',
    //   realm: 'ehrn-v2-sbx-ayushehr',
    //   clientId: 'Ayushehr',
        url: 'http://localhost:8080/',
  realm: 'myRealm',
  clientId: 'react',      
      pkceMethod: 'S256'
    };

    let keycloak = new Keycloak(initOptions);

    keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: true,
        pkceMethod: 'S256'
      })
      .then(auth => {
        if (!auth) {
          window.location.reload();
        } else {
          setKc(keycloak);
          httpClient.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${keycloak.token}`;

          keycloak.onTokenExpired = () => {
            console.log('token expired');
          };
        }
      })
      .catch(() => {
        console.error('Authentication Failed');
      });

    // Cleanup function
    return () => {
      if (kc) {
        kc.logout();
      }
    };
  }, []);

  const callBackend = () => {
    httpClient.get('https://mockbin.com/request');
  };

  return (
    <div className="App">
      <div className="grid">
        <div className="col-12">
          <h1>My Secured React App</h1>
        </div>
      </div>
      <div className="grid"></div>
      <div className="grid">
        <div className="col-1"></div>
        <div className="col-2">
          <div className="col">
            <Button
              onClick={() =>
                setInfoMessage(
                  kc && kc.authenticated
                    ? 'Authenticated: TRUE'
                    : 'Authenticated: FALSE'
                )
              }
              className="m-1 custom-btn-style"
              label="Is Authenticated"
            />

<Button onClick={() => { kc.login() }}
              className='m-1 custom-btn-style'
              label='Login'
              severity="success" />

            <Button onClick={() => { setInfoMessage(kc.token) }}
              className="m-1 custom-btn-style"
              label='Show Access Token'
              severity="info" />

            <Button onClick={() => { setInfoMessage(JSON.stringify(kc.tokenParsed)) }}
              className="m-1 custom-btn-style"
              label='Show Parsed Access token'
              severity="warning" />

            <Button onClick={() => { setInfoMessage(kc.isTokenExpired(5).toString()) }}
              className="m-1 custom-btn-style"
              label='Check Token expired'
              severity="info" />

            <Button onClick={() => { kc.updateToken(10).then((refreshed) => { setInfoMessage('Token Refreshed: ' + refreshed.toString()) }, (e) => { setInfoMessage('Refresh Error') }) }}
              className="m-1 custom-btn-style"
              label='Update Token (if about to expire)' />  {/** 10 seconds */}

            <Button onClick={callBackend}
              className='m-1 custom-btn-style'
              label='Send HTTP Request'
              severity="success" />

            <Button onClick={() => { kc.logout() }}
              className="m-1 custom-btn-style"
              label='Logout'
              severity="danger" />

            <Button onClick={() => { setInfoMessage(kc.hasRealmRole('admin').toString()) }}
              className="m-1 custom-btn-style"
              label='has realm role "Admin"'
              severity="info" />

            <Button onClick={() => { setInfoMessage(kc.hasResourceRole('test').toString()) }}
              className="m-1 custom-btn-style"
              label='has client role "test"'
              severity="info" />

          </div>
        </div>
        <div className='col-6'>
          <Card>
            <p style={{ wordBreak: 'break-all' }} id="infoPanel">
              {infoMessage}
            </p>
          </Card>
        </div>
        <div className="col-2"></div>
      </div>
    </div>
  );
};

export default HomePage;



