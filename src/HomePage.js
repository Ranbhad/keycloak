import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { httpClient } from './HttpClient';
import Keycloak from 'keycloak-js';

const HomePage = () => {
  const [infoMessage, setInfoMessage] = useState('');
  const [kc, setKc] = useState(null);

    let initOptions = {
        url: 'https://kc2.ehrn.ehr.network/',
      realm: 'ehrn-v2-sbx-ayushehr',
      clientId: 'Ayushehr',
      };
      const keycloak = Keycloak(initOptions);

    keycloak.init({
      onLoad: 'check-sso', 
      checkLoginIframe: true,
      pkceMethod: 'S256'
    }).then((auth) => {
      if (!auth) {
        keycloak.init({ onLoad: 'login-required' }); // If not authenticated, require login
      } else {
        console.info("Authenticated");
        console.log('auth', auth)
        console.log('Keycloak', keycloak)
        console.log('Access Token', keycloak.token)
        httpClient.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
        keycloak.onTokenExpired = () => {
          console.log('token expired')
        }
      }
    }, () => {
      console.error("Authentication Failed");
    });
    
    function App() {
    
      const [infoMessage, setInfoMessage] = useState('');
      const [isCreateAccountDialogVisible, setIsCreateAccountDialogVisible] = useState(false);
      const [newAccountName, setNewAccountName] = useState('');
      const [accounts, setAccounts] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
    
      useEffect(() => {
        loadUserInfo(); 
      }, []); 
    
      const loadUserInfo = () => {
        keycloak.loadUserInfo().then(userInfo => {
          httpClient.get(`{{keycloak}}/realms/:realm/orgs`) // Using relative path
            .then(response => {
              setAccounts(response.data);
              setIsLoading(false);
            })
            .catch(error => {
              console.error('Error fetching accounts:', error);
              setIsLoading(false); 
            });
        });
      };
    
      const handleCreateAccount = () => {
        console.log("Creating new account:", newAccountName);
        setIsCreateAccountDialogVisible(false);
        setInfoMessage(`New account "${newAccountName}" created successfully.`);
        setNewAccountName(''); 
      };
    

  return (
    <div className="App">
    <div className='grid'>
      <div className='col-12'>
        <h1> Manage Customer Account</h1>
      </div>
    </div>
    <div className="grid"></div>
    <div className='grid'>
      <div className='col-1'></div>
      <div className='col-2'>
        <div className="col">
          <Button onClick={() => setIsCreateAccountDialogVisible(true)}
            className="m-1 custom-btn-style"
            label='Account+'
            severity="success" />
            <Button onClick={() => { keycloak.logout() }}
                className="m-1 custom-btn-style"
                label='Logout'
                severity="danger" />
        </div>
      </div>
      <div className='col-6'>
         <Card>
           {isLoading ? (
            <p>Loading...</p>
          ) : (
            <DataTable value={accounts}>
              <Column field="accountId" header="Account ID"></Column>
            </DataTable>
          )}
        </Card>
      </div>
      <div className='col-2'></div>
    </div>
    <Dialog style={{width: '100%'}} open={isCreateAccountDialogVisible} onClose={() => setIsCreateAccountDialogVisible(false)} > 
      <DialogTitle>Add Test Results</DialogTitle>
      <DialogContent>
        <div className="p-fluid">
          <div className="p-field" style={{ width: '100%' }}> 
            <label htmlFor="newAccountName">Account Name</label>
            <InputText id="newAccountName" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} />
          </div>
          <div className="p-mt-2">
            <Button label="Create" onClick={handleCreateAccount} style={{ width: '100px' }} /> 
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
}
}
export default HomePage;