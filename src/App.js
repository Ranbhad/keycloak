import React, { useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';
import Dashboard from './Classes/Dashboard';
import { httpClient } from './HttpClient';
import { keycloakUrl } from './setUpProxy';
import 'bootstrap/dist/css/bootstrap.min.css';

function App(data) {
  const [orgs, setOrgs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [keycloakInstance, setKeycloakInstance] = useState(null); // State to hold the keycloak instance

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        const keycloakInstance = Keycloak({
          url: 'https://kc2.ehrn.ehr.network/',
          realm: 'ehrn-v2-sbx-ayushehr',
          clientId: 'Ayushehr-management',
          onLoad: 'check-sso',
        });
        const authenticated = await keycloakInstance.init({
          checkLoginIframe: true,
          pkceMethod: 'S256',
        });

        if (!authenticated) {
          keycloakInstance.login();
        } else {
          setIsLoggedIn(true);
          setKeycloakInstance(keycloakInstance); // Set the keycloak instance
          httpClient.defaults.headers.common['Authorization'] = `Bearer ${keycloakInstance.token}`;
          keycloakInstance.onTokenExpired = () => {
            console.log('Token expired');
            // Handle token expiration if needed
          };

          fetchUserDetails(keycloakInstance);
          fetchOrgs(keycloakInstance);
        }
      } catch (error) {
        console.error("Keycloak initialization failed", error);
        setError(error); // Update state with the error
      }
    };

    initializeKeycloak();
  }, []);

  const fetchOrgs = async (keycloak) => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/realms/${keycloak.realm}/orgs`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          Accept: 'application/json'
        }
      });
      setOrgs(response.data);
      setIsLoading(false); // Update loading state once data is fetched
      console.info('Organizations:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError(error); // Update state with the error
    }
  };
  const fetchUserDetails = async (keycloak) => {
    try {
      if (keycloak.tokenParsed && keycloak.tokenParsed.sub) {
        const url = `${keycloak.authServerUrl}admin/realms/${keycloak.realm}/users/${keycloak.tokenParsed.sub}`;
        const response = await httpClient.get(url);
        console.info('User info', response.data);
      } else {
        console.error('Unable to fetch user details: User ID not found');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(error); // Update state with the error
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      {isLoggedIn && !isLoading && <Dashboard orgs={orgs} orgUsers={orgUsers} keycloakInstance={keycloakInstance} />}
    </>
  );
}

export default App;
