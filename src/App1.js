import React, { useState, useEffect } from 'react';
import { IconButton, Table, Stack,TableContainer, Paper, TableBody, TableCell, TableHead, TableRow, Card, Typography, Button, Popover, List, ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from '@mui/material';
import { httpClient } from './HttpClient';
import { keycloakUrl } from './setUpProxy';
import Keycloak from 'keycloak-js';
import { Delete as DeleteIcon, Person as PersonIcon, Add as AddIcon, Assessment, Report, ListAlt, ReportOff } from '@material-ui/icons';
import LogoutIcon from '@mui/icons-material/Logout';
import UpdateIcon from '@mui/icons-material/Update';
import axios from 'axios';
import { Remove, RollerShades, Search, Verified } from '@mui/icons-material';

function App( data ) {
  const [newValue, setNewValue] = useState('');
  const [orgsWithRoles, setOrgsWithRoles] = useState([]);
  const [orgUsers, setOrgUsers] = useState([]);
  const [openOrgDialog, setOpenOrgDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApiResponseDialog, setOpenApiResponseDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [openSearchUserDialog, setOpenSearchUserDialog] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [kc, setKc] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createOrg, setCreateOrg] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [displayName, SetDisplayName] = useState('');
  const [openApiDialog, setOpenApiDialog] = useState(false); 
const [apiData, setApiData] = useState(null); 
const [rolesData, setRolesData] = useState(null); 
const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);
const [clientId, setClientId] = useState(null);
const [searchParam, setSearchParam] = useState('');
const [searchedClientId, setSearchedClientId] = useState('');
const [clientIdMessage, setClientIdMessage] = useState('');
const [searchName, setSearchName] = useState('');
const [searchedUserId, setSearchedUserId] = useState('');
const [userIdMessage, setUserIdMessage] = useState('');
const BoldKey = ({ children }) => <span style={{ fontWeight: 'bold' }}>{children}</span>;
const handlePopoverOpen = (event, userId) => {
  setPopoverAnchorEl(event.currentTarget);
  setSelectedUser(userId);
};

const handlePopoverClose = () => {
  setPopoverAnchorEl(null);
};

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        const keycloak = Keycloak({
          url: 'https://kc2.ehrn.ehr.network/', 
          realm: 'ehrn-v2-sbx-ayushehr',
          clientId: 'Ayushehr-management',
          onLoad: 'check-sso',
        });
        const auth = await keycloak.init({
          checkLoginIframe: true,
          pkceMethod: 'S256',
        });
        console.log('Keycloak initialization started');
        if (!auth) {
          console.log('Authentication check failed, redirecting to login page...');
          keycloak.login(); 
        } else {
          console.log('Authentication successful');
          console.log('Auth object:', auth);
          console.log('Access Token:', keycloak.token);
          if (keycloak.token) {
            console.log('Access Token', keycloak.token);
          } else {
            console.error('Access token not obtained'); 
          }
          httpClient.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
          keycloak.onTokenExpired = () => {
            console.log('Token expired');
          }
          setKc(keycloak); 
          fetchUserDetails(keycloak);
          fetchOrgs(keycloak);
        }
      } catch (error) {
        console.error("Keycloak initialization Failed", error);
      }
    };

    initializeKeycloak();
  }, []);

  const fetchUserDetails = async (keycloak) => {
    try {
      console.log('Token parsed:', JSON.stringify(keycloak.tokenParsed));
      if (keycloak.tokenParsed && keycloak.tokenParsed.sub) {
        const url = `${keycloak.authServerUrl}admin/realms/${keycloak.realm}/users/${keycloak.tokenParsed.sub}`;
        console.log('URL:', url); 
        const response = await httpClient.get(url);
        setUserDetails(response.data);
        console.info('User info', response.data)
      } else {
        console.error('Unable to fetch user details: User ID not found');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchOrgs = async (keycloak) => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/realms/${keycloak.realm}/orgs`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          Accept: 'application/json'
        }
      });
      setOrgs(response.data);
      console.info('Organizations:', response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const createUser = async (keycloak, userData) => {
    try {
      const url = `${keycloak.authServerUrl}admin/realms/${keycloak.realm}/users`;
      const response = await httpClient.post(url, userData, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          Accept: '*/*',
          'Content-Type': 'application/json'
        }
      });
      console.info('User created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };
 
  const handleCreateUser = async () => {
    const userData = {
      enabled: true,
      username: username,
      email: email,
      firstName: firstName,
      lastName: lastName,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false
        }
      ],
      requiredActions: [
        "UPDATE_PASSWORD",
        "UPDATE_PROFILE",
        "VERIFY_EMAIL",
        "TERMS_AND_CONDITIONS"
    ],
    attributes: {
        "ehrnId": [
            "Practitioner/2345"
        ]
      }
    };
    try {
      await createUser(kc, userData);
      alert('User created successfully. Click Okay to search UserId');
      handleSearchUserDialogOpen();
      setCreateDialogOpen(false);
      setOpenDialog(false)
    } catch (error) {
      console.error('Error creating user:', error);
    }
};
const handleSearchUserId = () => {
  const headers = {
    Authorization: `Bearer ${kc.token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  axios.get(`${keycloakUrl}/admin/realms/${kc.realm}/users?username=${searchName}`, { headers })
    .then(response => {
      const responseData = response.data;
      if (Array.isArray(responseData) && responseData.length > 0) {
        const userNameId = responseData[0].id; 
        setUserIdMessage(`Your User ID is: ${userNameId}. Click OK to add the user to the organization.`);
        setSearchedUserId(userNameId);
      } else {
        setUserIdMessage('Client ID not found.');
        setSearchedUserId('');
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setUserIdMessage('Error fetching user ID.');
      setSearchedUserId('');
    });
};

const handleSearchUserDialogOpen = () => {
  setOpenSearchUserDialog(true);
};

const handleSearchUserDialogClose = () => {
  setOpenSearchUserDialog(false);
};

const handleClickUserId = (orgId) => {
  if (searchedUserId) {
    handleAddUser(orgId, searchedUserId);
    setOpenSearchUserDialog(false);
  } else {
    console.error('Searched user ID is not set.');
  }
};

  const createOrganization = async (keycloak, userData) => {
    try {
      const url = `${keycloakUrl}/realms/${keycloak.realm}/orgs`;
      const response = await httpClient.post(url, userData, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          Accept: '*/*',
          'Content-Type': 'application/json'
        }
      });
      console.info('Organization created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };
  const handleCreateOrg = async () => {
    const userData = {
      name: orgName,
      displayName: displayName,
    };

    createOrganization(kc, userData);
    setCreateOrg(false);
};

  const handleActionClick = (event, org) => {
    setSelectedOrg(org);
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleDelete = async (orgId) => {
    try {
      await httpClient.delete(`${keycloakUrl}/realms/${kc.realm}/orgs/${orgId}`, {
        headers: {
          Authorization: `Bearer ${kc.token}`
        }
      });
      console.log('Organization deleted successfully');
      setOrgs(orgs.filter(org => org.id !== orgId));
    } catch (error) {
      console.error('Error deleting organization:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    }
    setAnchorEl(null);
  };
  const handleViewUsers = async (orgId) => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/realms/${kc.realm}/orgs/${orgId}/members`, {
        headers: {
          Authorization: `Bearer ${kc.token}`,
          Accept: 'application/json'
        }
      });
      console.log('Users for organization with ID:', orgId, response.data);
      setOrgUsers(response.data);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching users for organization:', error);
    }
  };
  const handleApiCall = async (userId) => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/admin/realms/${kc.realm}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${kc.token}`,
          Accept: 'application/json'
        }
      });
      console.log('API Response:', response.data);
      setOpenApiDialog(true); 
      setApiData(response.data); 
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };
  const handleViewRoles = async (orgId, userId) => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/realms/${kc.realm}/users/${userId}/orgs/${orgId}/roles`, {
        headers: {
            Authorization: `Bearer ${kc.token}`,
            Accept: 'application/json'
          }
        });
        console.log('API Response:', response.data);
        setOpenApiDialog(true);
        setApiData(response.data); 
      } catch (error) {
        console.error('Error calling API:', error);
      }
    };
    const handleAddUser = async (orgId, searchedUserId) => {
      try {
        const response = await httpClient.put(`${keycloakUrl}/realms/${kc.realm}/orgs/${orgId}/members/${searchedUserId}`, {
          headers: {
              Authorization: `Bearer ${kc.token}`,
              Accept: 'application/json'
            }
          });
          console.log('API Response:', response.data);
          setOpenApiDialog(true); 
          setApiData(response.data); 
        } catch (error) {
          console.error('Error calling API:', error);
        }
      };
      const handleDeleteUserFromOrg = async (orgId, userId) => {
        try {
          const response = await httpClient.delete(`${keycloakUrl}/realms/${kc.realm}/orgs/${orgId}/members/${userId}`, {
            headers: {
                Authorization: `Bearer ${kc.token}`,
                Accept: 'application/json'
              }
            });
            console.log('API Response:', response.data);
          } catch (error) {
            console.error('Error calling API:', error);
          }
        };
        const handleDeleteUser = async (userId) => {
          try {
            const response = await httpClient.delete(`${keycloakUrl}/admin/realms/${kc.realm}/users/${userId}`, {
              headers: {
                  Authorization: `Bearer ${kc.token}`,
                  Accept: 'application/json'
                }
              });
              console.log('API Response:', response.data);
            } catch (error) {
              console.error('Error calling API:', error);
            }
          };
          const handleListOrgForUser = async ( userId) => {
            try {
              const response = await httpClient.get(`${keycloakUrl}/realms/${kc.realm}/users/${userId}/orgs`, {
                headers: {
                    Authorization: `Bearer ${kc.token}`,
                    Accept: 'application/json'
                  }
                });
                console.log('API Response:', response.data);
                setOpenApiDialog(true);
                setApiData(response.data); 
              } catch (error) {
                console.error('Error calling API:', error);
              }
            };
      const handleGetUserRoles = async (userId) => {
        try {
          const response = await httpClient.get(`${keycloakUrl}/admin/realms/${kc.realm}/users/${userId}/role-mappings`, {
            headers: {
              Authorization: `Bearer ${kc.token}`,
              Accept: 'application/json'
            }
          });
          console.log('API Response:', response.data);
          if (response.data && response.data.clientMappings) {
            const clientMappings = response.data.clientMappings['Ayushehr-management'];
            if (clientMappings) {
              const clientIds = clientMappings.id;
              setClientId(clientIds);
            } else {
              console.error('Client mapping not found');
            }
          } else {
            console.error('Client mappings not found in the API response');
          }
          setRolesData(response.data);
          setOpenApiResponseDialog(true);
        } catch (error) {
          console.error('Error calling API:', error);
        }
      };      
      const handleGrantUser = async (orgId, userId) => {
        try {
          const response = await httpClient.put(`${keycloakUrl}/realms/${kc.realm}/orgs/${orgId}/roles/view-members/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${kc.token}`,
                Accept: 'application/json'
              }
            });
            console.log('API Response:', response.data);
            setOpenApiDialog(true); 
            setApiData(response.data); 
          } catch (error) {
            console.error('Error calling API:', error);
          }
        };
        const handleGetRoles = async (orgId) => {
          try {
            const response = await httpClient.get(`${keycloakUrl}/realms/${kc.realm}/orgs/${orgId}/roles`, {
              headers: {
                  Authorization: `Bearer ${kc.token}`,
                  Accept: 'application/json'
                }
              });
              console.log('API Response:', response.data);
              setOpenOrgDialog(true);
              setOrgsWithRoles(response.data); 
            } catch (error) {
              console.error('Error calling API:', error);
            }
          };
      const handleGetClients = async (userId, clientId ) => {
        try {
          const response = await httpClient.get(`${keycloakUrl}/admin/realms/${kc.realm}/users/${userId}/role-mappings/clients/${clientId}/available`, {
            headers: {
                Authorization: `Bearer ${kc.token}`,
                Accept: 'application/json'
              }
            });
            console.log('API Response:', response.data);
            setOpenApiDialog(true); 
            setApiData(response.data); 
          } catch (error) {
            console.error('Error calling API:', error);
          }
        };
        const handleClickGetClientRoles = (userId) => {
          if (clientId) {
            handleGetClients(userId, clientId);
          } else {
            console.error('Client ID not available');
          }
        };
        const handleUpdateUser = async (userId, value) => {
          try {
            const response = await axios.put(
              `${keycloakUrl}/admin/realms/${kc.realm}/users/${userId}`,
              {
                credentials: [
                  {
                    type: 'password',
                    value: value,
                    temporary: false
                  }
                ],
                requiredActions: []
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${kc.token}`
                }
              }
            );
            console.log('User updated successfully:', response.data);
          } catch (error) {
            console.error('Error updating user:', error);
          }
        };
      
        const handleUpdateDialogOpen = () => {
          setOpenUpdateDialog(true);
        };
      
        const handleUpdateDialogClose = () => {
          setOpenUpdateDialog(false);
        };

        const handleSearchClientId = () => {
          const headers = {
            Authorization: `Bearer ${kc.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          };
        
          axios.get(`${keycloakUrl}/admin/realms/${kc.realm}/clients?clientId=${searchParam}&search=true`, { headers })
            .then(response => {
              const responseData = response.data;
              if (Array.isArray(responseData) && responseData.length > 0) {
                const clientId = responseData[0].id; 
                setClientIdMessage(`Your client ID is: ${clientId}. Click OK to add the client to the user.`);
                setSearchedClientId(clientId);
              } else {
                setClientIdMessage('Client ID not found.');
                setSearchedClientId('');
              }
            })
            .catch(error => {
              console.error('Error fetching data:', error);
              setClientIdMessage('Error fetching client ID.');
              setSearchedClientId('');
            });
        };
        
        const handleSearchDialogOpen = () => {
          setOpenSearchDialog(true);
        };
      
        const handleSearchDialogClose = () => {
          setOpenSearchDialog(false);
        };
      
        const handleOKButtonClick = (userId) => {
          if (searchedClientId) {
            handleAddRolesClient(userId, searchedClientId);
            setOpenSearchDialog(false);
          } else {
            console.error('Searched client ID is not set.');
          }
        };
        
        const handleConfirmUpdate = () => {
          handleUpdateUser(selectedUser, newValue);
          handleUpdateDialogClose();
        };
        const handleAddClientRoles = async (keycloak, userData, userId, searchedClientId) => {
          try {
            const url = `${keycloakUrl}/admin/realms/${keycloak.realm}/users/${userId}/role-mappings/clients/${searchedClientId}`;
            const response = await httpClient.post(url, userData, {
              headers: {
                Authorization: `Bearer ${keycloak.token}`,
                Accept: '*/*',
                'Content-Type': 'application/json'
              }
            });
            console.info('Organization created:', response.data);
            return response.data;
          } catch (error) {
            console.error('Error creating organization:', error);
            throw error;
          }
        };
        
        const handleAddRolesClient = async (userId) => {
          try {
            const userData = [
              {
                "id": "d46f2b44-2315-4247-9c67-cb05c52b6c3d",
                "name": "OrgAdmin"
              }
            ];
            await handleAddClientRoles(kc, userData, userId, searchedClientId);
          } catch (error) {
            console.error('Error adding client roles:', error);
          }
        };
        const handleDeleteClientRoles = async (keycloak, userData, userId, clientId) => {
          try {
            const url = `${keycloakUrl}/admin/realms/${keycloak.realm}/users/${userId}/role-mappings/clients/${clientId}`;
            const response = await httpClient.delete(url, userData, {
              headers: {
                Authorization: `Bearer ${keycloak.token}`,
                Accept: '*/*',
                'Content-Type': 'application/json'
              }
            });
            console.info('Organization created:', response.data);
            return response.data;
          } catch (error) {
            console.error('Error creating organization:', error);
            throw error;
          }
        };
        
        const handleDeleteClientRole = async (userId) => {
          try {
            const userData = [
              {
                "id": "d46f2b44-2315-4247-9c67-cb05c52b6c3d",
                "name": "OrgAdmin"
              }
            ];
            await handleDeleteClientRoles(kc, userData, userId, clientId);
          } catch (error) {
            console.error('Error adding client roles:', error);
          }
        };
          const handleRevokeOrgRole = async (orgId, userId) => {
            try {
              const response = await httpClient.delete(`${keycloakUrl}/realms/${kc.realm}/orgs/${orgId}/roles/OrgAdmin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${kc.token}`,
                    Accept: 'application/json'
                  }
                });
                console.log('API Response:', response.data);
              } catch (error) {
                console.error('Error calling API:', error);
              }
            };
  const handleLogout = () => {
    kc && kc.logout(); 
  };

  const open = Boolean(anchorEl);
  const id = open ? 'actions-popover' : undefined;
 
  return (
    <>
      <Typography align='center' variant="h4">Manage Customer Accounts</Typography>
      <IconButton sx={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleLogout}>
        <LogoutIcon />
      </IconButton>
      <div style={{display:'flex',flexDirection:'row',width:'100%'}}>
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create Account</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter your details:</DialogContentText>
          <Stack flexDirection={'row'} justifyContent={'left'} width={'90%'}>
          <TextField autoFocus margin="dense" label="First Name" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} />&nbsp;&nbsp;
          <TextField margin="dense" label="Last Name" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} />&nbsp;&nbsp;
          <TextField margin="dense" label="Username" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} />&nbsp;&nbsp;
          </Stack>
          <Stack flexDirection={'row'} justifyContent={'left'} width={'90%'}>
          <TextField margin="dense" label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />&nbsp;&nbsp;
          <TextField margin="dense" label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />&nbsp;&nbsp;
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" color="primary">Create</Button>
        </DialogActions>
      </Dialog>
      </div>
      <Dialog open={openUpdateDialog} onClose={handleUpdateDialogClose}>
        <DialogTitle>Update User</DialogTitle>
        <DialogContent>
          <TextField label="New Value" variant="outlined" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmUpdate}>Update</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openSearchDialog} onClose={handleSearchDialogClose}>
        <DialogTitle>Search Client Id</DialogTitle>
        <DialogContent>
          <TextField label="Search" variant="outlined" value={searchParam} onChange={(e) => setSearchParam(e.target.value)} />
          <p>{clientIdMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSearchDialogClose}>Cancel</Button>
          <Button onClick={handleSearchClientId}>Search</Button>
          {searchedClientId && <Button onClick={() => handleOKButtonClick(selectedUser)} autoFocus>OK</Button>}
        </DialogActions>
      </Dialog>
      <Dialog open={openSearchUserDialog} onClose={handleSearchUserDialogClose}>
        <DialogTitle>Search User Id</DialogTitle>
        <DialogContent>
          <TextField label="User Name" variant="outlined" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
          <p>{userIdMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSearchUserDialogClose}>Cancel</Button>
          <Button onClick={handleSearchUserId}>Search</Button>
          {searchedUserId && <Button onClick={() => handleClickUserId(selectedOrg.id)} autoFocus>OK</Button>}
        </DialogActions>
      </Dialog>
      <Button sx={{ position: 'absolute', top: '10px', right: '60px' }} variant="contained" color="primary" onClick={() => setCreateOrg(true)}>Create Organization</Button>
      <div style={{display:'flex',flexDirection:'row',width:'100%'}}>
      <Dialog open={createOrg} onClose={() => setCreateOrg(false)}>
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter your details:</DialogContentText>
          <Stack flexDirection={'row'} justifyContent={'left'} width={'90%'}>
          <TextField margin="dense" label="Name" fullWidth value={orgName} onChange={(e) => setOrgName(e.target.value)} />&nbsp;&nbsp;
          <TextField margin="dense" label="Display Name" fullWidth value={displayName} onChange={(e) => SetDisplayName(e.target.value)} />&nbsp;&nbsp;
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOrg(false)}>Cancel</Button>
          <Button onClick={handleCreateOrg} variant="contained" color="primary">Create</Button>          
        </DialogActions>
      </Dialog>
      </div>
      <Dialog open={openApiDialog} onClose={() => setOpenApiDialog(false)}>
        <DialogTitle>API Response</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {apiData && Object.entries(apiData).map(([key, value]) => (
              <div key={key}>
                <BoldKey>{key}: </BoldKey>
                {JSON.stringify(value)}
              </div>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
        <Button onClick={() => setOpenApiDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openApiResponseDialog} onClose={() => setOpenApiResponseDialog(false)}>
        <DialogTitle>Roles Data</DialogTitle>
        <DialogContent>
        <DialogContentText>
        {rolesData && Object.entries(rolesData).map(([key, value]) => (
          <div key={key}>
            <BoldKey>{key}: </BoldKey>
            {JSON.stringify(value)}
          </div>
        ))}
      </DialogContentText>
    </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApiResponseDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Card sx={{ maxWidth: '800px', margin: 'auto', marginTop: '40px', marginBottom: '20px' }}>
        <Table sx={{ minWidth: '400px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Organization Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell>{org.name}</TableCell>
                <TableCell align="right"><IconButton onClick={(event) => handleActionClick(event, org)}>Action</IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={openOrgDialog} onClose={() => setOpenOrgDialog(false)} fullScreen>
        <DialogTitle>
          <Typography variant="h6">List of Organizations with Roles</Typography>
          <Typography variant="body1">Selected Organization ID: {orgs.name}</Typography>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role ID</TableCell>
                  <TableCell>Role Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orgsWithRoles.map((role, index) => (
                  <TableRow key={index}>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>{role.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List>
          <ListItem button onClick={() => handleDelete(selectedOrg.id)}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </ListItem>
          <ListItem button onClick={() => handleViewUsers(selectedOrg.id)}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="View Users" />
          </ListItem>
        </List>
      </Popover>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
      <DialogTitle>Users in Organization</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
            {/* <TableCell>UserId</TableCell> */}
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orgUsers.map((user) => (
              <TableRow key={user.id}>
                {/* <TableCell>{user.id}</TableCell> */}
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                <Button onClick={(event) => handlePopoverOpen(event, user.id)}>Actions</Button>
                  <Popover
                    open={Boolean(popoverAnchorEl)}
                    anchorEl={popoverAnchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <List>
                    <ListItem button onClick={() => handleApiCall(selectedUser)}>
                      <ListItemIcon>
                        <Report />
                      </ListItemIcon>
                      <ListItemText primary="User Representation" />
                    </ListItem>
                    <ListItem button onClick={() => handleGrantUser(selectedOrg.id, selectedUser)}>
                      <ListItemIcon>
                        <Verified />
                      </ListItemIcon>
                      <ListItemText primary="Grant User to Org" />
                    </ListItem>
                    <ListItem button onClick={() => handleViewRoles(selectedOrg.id, selectedUser)}>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary="List Of Roles" />
                    </ListItem>                 
                    <ListItem button onClick={() => handleGetUserRoles(selectedUser)}>
                      <ListItemIcon>
                        <RollerShades />
                      </ListItemIcon>
                      <ListItemText primary="Get Roles for user" />
                    </ListItem>
                    <ListItem button onClick={handleSearchDialogOpen}>
                      <ListItemIcon>
                        <Search />
                      </ListItemIcon>
                      <ListItemText primary="Search ClientId" />
                    </ListItem>
                    <ListItem button onClick={() => handleClickGetClientRoles(selectedUser)}>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary="Get All Aail clients for user" />
                    </ListItem>
                    <ListItem button onClick={() => handleDeleteClientRole(selectedUser)}>
                      <ListItemIcon>
                        <DeleteIcon />
                      </ListItemIcon>
                      <ListItemText primary="Delete client role" />
                    </ListItem>
                    <ListItem button onClick={() => handleRevokeOrgRole(selectedOrg.id, selectedUser)}>
                      <ListItemIcon>
                        <Remove />
                      </ListItemIcon>
                      <ListItemText primary="Revoke client role" />
                    </ListItem>                       
                    <ListItem button onClick={handleUpdateDialogOpen}>
                      <ListItemIcon>
                        <UpdateIcon />
                      </ListItemIcon>
                      <ListItemText primary="Update User Password" />
                    </ListItem>
                    <ListItem button onClick={() => handleDeleteUserFromOrg(selectedOrg.id, selectedUser)}>
                      <ListItemIcon>
                        <DeleteIcon />
                      </ListItemIcon>
                      <ListItemText primary="Delete User From Org" />
                    </ListItem>
                    <ListItem button onClick={() => handleListOrgForUser(selectedUser)}>
                      <ListItemIcon>
                        <Assessment />
                      </ListItemIcon>
                      <ListItemText primary="List of Org for User" />
                    </ListItem>
                    <ListItem button onClick={() => handleDeleteUser(selectedUser)}>
                      <ListItemIcon>
                        <DeleteIcon />
                      </ListItemIcon>
                      <ListItemText primary="Delete User" />
                    </ListItem>
                    </List>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>        
        <Button variant="contained" color="primary" onClick={() => setCreateDialogOpen(true)}>Create User</Button>
        <Button onClick={() => setOpenDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

export default App;
