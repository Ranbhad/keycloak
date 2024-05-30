import React, { useState, useEffect } from 'react';
import Link from '@mui/material/Link';
import {Paper, Button, ButtonGroup,Grid,Container,Divider,Table,IconButton,TableBody,TableCell,TableHead,TableRow,CssBaseline,Drawer as MuiDrawer,Box,AppBar as MuiAppBar,Toolbar,List,Typography, TextField, Stack,
 ListItemIcon, ListItemButton, ListItemText } from '@mui/material';
import Title from './Title';
import { Delete, Menu, ChevronLeft, Cancel, CorporateFare, AddCircleRounded, RecentActorsRounded, CheckCircle, Logout } from '@mui/icons-material';
import axios from 'axios';
import { httpClient } from '../HttpClient';
import { keycloakUrl } from '../setUpProxy';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { ConfirmDeleteDialog, DeleteRole, ConfirmDeleteUser } from './DeleteConfirmation';
import Alerts from './Alerts';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://ehr.network/">
        https://ehr.network/
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: '#214029', 
  color: '#fff',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const defaultTheme = createTheme();

export default function Dashboard({ keycloakInstance }) {
  const [open, setOpen] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const [orgUsers, setOrgUsers] = useState([]);
  const [clickedOrgName, setClickedOrgName] = useState('');
  const [apiData, setApiData] = useState(null);
  const [openApiDialog, setOpenApiDialog] = useState(false);
  const [viewRolesData, setViewRolesData] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [showAddOrgGrid, setShowAddOrgGrid] = useState(false);
  const [showAddUserGrid, setShowAddUserGrid] = useState(false);
  const [showAddRoleGrid, setShowAddRoleGrid] = useState(false);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [successAlertMessage, setSuccessAlertMessage] = useState('');
  const [errorAlertMessage, setErrorAlertMessage] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteDialogUser, setDeleteDialogUser] = useState(false);
  const [clientData, setClientData] = useState('');
  const [showAddClientGrid, setShowAddClientGrid] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showOrganizationGrid, setShowOrganizationGrid] = useState(false);

  const handleOpenDeleteDialog = (client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedClient(null);
  };

const handleShowAddRoleGrid = () => {
  setShowAddRoleGrid(true);
};
const handleShowAddClientGrid = () => {
  setShowAddClientGrid(true);
};
  const openSuccessAlert = (message) => {
    setSuccessAlertMessage(message);
    setIsSuccessAlertOpen(true);
  };
  
  const openErrorAlert = (message) => {
    setErrorAlertMessage(message);
    setIsErrorAlertOpen(true);
  };
  const closeAlerts = () => {
    setIsSuccessAlertOpen(false);
    setIsErrorAlertOpen(false);
  };
  useEffect(() => {
    fetchOrgs();
    setShowOrganizationGrid(true);
  }, []);

  const fetchOrgs = async () => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/realms/${keycloakInstance.realm}/orgs`, {
        headers: {
          Authorization: `Bearer ${keycloakInstance.token}`,
          Accept: 'application/json'
        }
      });
      setOrgs(response.data);
      openSuccessAlert("List of organizations");
    } catch (error) {
      console.error('Error fetching organizations:', error);
      openErrorAlert("Error fetching organizations");
    }
  };

  const handleDelete = async (orgId) => {
    try {
      await httpClient.delete(`${keycloakUrl}/realms/${keycloakInstance.realm}/orgs/${orgId}`, {
        headers: {
          Authorization: `Bearer ${keycloakInstance.token}`
        }
      });
      console.log('Organization deleted successfully');
      fetchOrgs();
      setDeleteDialog(false);
      openSuccessAlert('Organization deleted successfully')
    } catch (error) {
      console.error('Error deleting organization:', error);
      openErrorAlert('Error while deleting Organization. Please try again later')
    }
  };

  const handleDeleteClick = (event, org) => {
    console.log('Delete clicked for organization:', org);
    setOrgToDelete(org);
    setDeleteDialog(true);
  };

  const handleDeleteConfirmationClose = () => {
    setDeleteDialog(false);
    setOrgToDelete(null);
  };
  const handleDeleteUserFromOrg = async (orgId, userId) => {
    try {
      const response = await httpClient.delete(`${keycloakUrl}/realms/${keycloakInstance.realm}/orgs/${orgId}/members/${userId}`, {
        headers: {
            Authorization: `Bearer ${keycloakInstance.token}`,
            Accept: 'application/json'
          }
        });
        console.log('API Response:', response.data);
        handleViewUsers();
        setDeleteDialogUser(false);
        openSuccessAlert('User deleted successfully from Org ')
      } catch (error) {
        console.error('Error calling API:', error);
        openErrorAlert('Error while deleting User from Org')
      }
    };
  const handleDeleteUserOrg = (event, user) => {
    console.log('Delete clicked for organization:', user);
    setUserToDelete(user);
    setDeleteDialogUser(true);
  };

  const handleDeleteUserClose = () => {
    setDeleteDialogUser(false);
    setUserToDelete(null);
  };

  const handleViewUsers = async (orgId) => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/realms/${keycloakInstance.realm}/orgs/${orgId}/members`, {
        headers: {
          Authorization: `Bearer ${keycloakInstance.token}`,
          Accept: 'application/json'
        }
      });
      console.log('Users for organization with ID:', orgId, response.data);
      setOrgUsers(response.data);
      setOpenApiDialog(false);
      setShowAddOrgGrid(false);
      setShowAddUserGrid(false);
    } catch (error) {
      console.error('Error fetching users for organization:', error);
      openErrorAlert('Error while listing user. Please try again later')
    }
  };

  const handleViewClick = (event, org) => {
    console.log('View clicked for organization:', org);
    setSelectedOrgId(org.id);
    
    handleViewUsers(org.id);
    setClickedOrgName(org.name);
  };

  useEffect(() => {
    console.log("Selected org Id", selectedOrgId);
  }, [selectedOrgId]);

  const handleApiCall = async (userId) => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/admin/realms/${keycloakInstance.realm}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${keycloakInstance.token}`,
          Accept: 'application/json'
        }
      });
      console.log('API Response:', response.data);
      setOpenApiDialog(true);
      setApiData(response.data);
      setSelectedTab(0);
        setSelectedUserId(userId);
        console.info("User id found", userId);
    } catch (error) {
      console.error('Error calling API:', error);
      openErrorAlert('Error while fetching user details. Please try again later')
    }
  };

  const handleViewRoles = async (orgId, userId) => {
    console.log('Selected Org ID:', selectedOrgId);
    console.log('Selected User ID:', selectedUserId);
    try {
      const response = await httpClient.get(`${keycloakUrl}/realms/${keycloakInstance.realm}/users/${userId}/orgs/${orgId}/roles`, {
        headers: {
          Authorization: `Bearer ${keycloakInstance.token}`,
          Accept: 'application/json'
        }
      });
      console.log('API Response:', response.data);
      setViewRolesData(response.data); 
      setShowAddClientGrid(false);
      setShowAddRoleGrid(false);
      setSelectedTab(2);
      setShowAddUserGrid(false);
    } catch (error) {
      console.error('Error calling API:', error);
      openErrorAlert('Error while fetching Org roles. Please try again later')
    }
  };
  
  const handleGrantUser = async (orgId, userId, role) => {
    try {
      const response = await httpClient.put(`${keycloakUrl}/realms/${keycloakInstance.realm}/orgs/${orgId}/roles/${role}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${keycloakInstance.token}`,
            Accept: 'application/json'
          }
        });
        console.log('API Response:', response.data);
        openSuccessAlert('Org role assigned successfully.')
      } catch (error) {
        console.error('Error calling API:', error);
        openErrorAlert('Error while assigning Org roles. Please try again later.')
      }
    };
    const handleRoleSelection = (role) => {
      setShowAddRoleGrid(false);
      handleGrantUser(selectedOrgId, selectedUserId, role);
      handleViewRoles(selectedOrgId, selectedUserId);
    };
    const handleClientRoleClick = (client) => {
      setShowAddRoleGrid(false);
      setShowAddUserGrid(false);
      setShowAddOrgGrid(false);
      handleAddRolesClient(selectedUserId, client);
    };
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleAddOrgGrid = () => {
    setShowAddOrgGrid(!showAddOrgGrid);
    setShowAddUserGrid(false);
    setShowAddRoleGrid(false);
    setOpenApiDialog(false);
    setClickedOrgName(false);
  };

  const handleOrgNameChange = (event) => {
    setNewOrgName(event.target.value);
  };

  const handleOrgDescriptionChange = (event) => {
    setNewOrgDescription(event.target.value);
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
      openSuccessAlert('Organization created successfully.')
      console.info('Organization created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating organization:', error);
      openErrorAlert('Error while creating organization.')
      throw error;
    }
  };
  
  const handleCreateOrganization = async () => {
    const userData = {
      name: newOrgName,
      displayName: newOrgDescription,
    };

    try {
      const createdOrg = await createOrganization(keycloakInstance, userData);
      console.log('New organization created:', createdOrg);
      setNewOrgName(''); 
      setNewOrgDescription('');
      fetchOrgs();
    } catch (error) {
      console.error('Error creating organization:', error);
    }

    setShowAddOrgGrid(false);
  };

  const handleCancelCreateOrganization = () => {
    setShowAddOrgGrid(false);
    setNewOrgName(''); 
    setNewOrgDescription('');
  };

  const addOrgGrid = (
    <Grid item xs={12} md={12} lg={12}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: 5, marginBottom: '20px' }}>
        <Title>Add Organization</Title>
        <div style={{ display: 'flex'}} >
          <TextField size='small' label="Organization Name" value={newOrgName} onChange={handleOrgNameChange} fullWidth margin="normal" variant="outlined" />&nbsp;&nbsp;
          <TextField size='small' label="Display Name" value={newOrgDescription} onChange={handleOrgDescriptionChange} fullWidth margin="normal" variant="outlined" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <IconButton onClick={handleCreateOrganization}>
            <CheckCircle />
          </IconButton>
          <IconButton onClick={handleCancelCreateOrganization}>
            <Cancel />
          </IconButton>
        </div>
      </Paper>
    </Grid>
  );
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setShowAddRoleGrid(false);
    setShowAddClientGrid(false);
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
      openSuccessAlert('User created successfully.')
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      openErrorAlert('Error while creating user.')
      throw error;
    }
  };
 
  const handleCreateUser = async (selectedOrgId) => {
    console.log("Selected org ID in handleCreateUser:", selectedOrgId);
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
    ]
    };
    try {
      await createUser(keycloakInstance, userData);
      handleSearchUserId(selectedOrgId.toString(), userData.username);
      setShowAddUserGrid(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
};
const handleSearchUserId = (selectedOrgId, username) => {
  console.log("Selected org ID in handleSearchUserId:", selectedOrgId);
  const headers = {
    Authorization: `Bearer ${keycloakInstance.token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  axios.get(`${keycloakUrl}/admin/realms/${keycloakInstance.realm}/users?username=${username}`, { headers })
    .then(response => {
      const responseData = response.data;
      if (Array.isArray(responseData) && responseData.length > 0) {
        const userNameId = responseData[0].id; 
        handleAddUser(selectedOrgId, userNameId);
        console.log("Selected organization id in handleSearchUserId:", selectedOrgId);
        console.info("User id found", userNameId);
      } else {
        console.log("User Id not found")
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
};
const handleAddUser = async (selectedOrgId, searchedUserId) => {
  console.log("Selected org ID in handleAddUser:", selectedOrgId);
  try {
    const response = await httpClient.put(`${keycloakUrl}/realms/${keycloakInstance.realm}/orgs/${selectedOrgId}/members/${searchedUserId}`, {
      headers: {
          Authorization: `Bearer ${keycloakInstance.token}`,
          Accept: 'application/json'
        }
      });
      console.log('API Response:', response.data);
      setOpenApiDialog(true); 
      setApiData(response.data); 
      handleViewUsers(selectedOrgId);
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const handleShowAddUserGrid = ()=>{
    setShowAddUserGrid(true);
    setOpenApiDialog(false);
  }

  const allRoles = [
    'view-members',
    'view-organization',
    'manage-organization',
    'manage-members',
    'view-roles',
    'manage-roles',
    'view-invitations',
    'view-identity-providers',
    'manage-identity-providers'
  ];

  const safeViewRolesData = viewRolesData || [];
  const availableRoles = allRoles.filter(role => !safeViewRolesData.some(viewRole => viewRole.name === role));

  const allClients = [
    { id: 'b78fd0c5-c4b9-4154-a7fa-025e975a4b1c', name: 'EHRNAdmin' },
    // { id: 'b7362630-83f7-45a8-af95-b8dea0aa2c47', name: 'manage-client' },
    // { id: 'b404e7f7-5104-4802-ae9f-c3d7a328f2f1', name: 'uma_protection' },
    // { id: '1821526f-2376-4a0b-b21f-0158060beae1', name: 'view-client' },
    { id: 'd46f2b44-2315-4247-9c67-cb05c52b6c3d', name: 'OrgAdmin' },
  ];

  const safeViewClientsData = clientData || [];
  const availableClients = allClients.filter(client => !safeViewClientsData.some(viewClient => viewClient.name === client.name));

  const handleGetClients = async (userId) => {
    try {
      const response = await httpClient.get(`${keycloakUrl}/admin/realms/${keycloakInstance.realm}/users/${userId}/role-mappings/clients/85eb830b-c214-4ba4-bdae-2fb3d370697c/available`, {
        headers: {
            Authorization: `Bearer ${keycloakInstance.token}`,
            Accept: 'application/json'
          }
        });
        console.log('API Response:', response.data);
        setClientData(response.data);
        setSelectedTab(1); 
        setShowAddClientGrid(false);
        setShowAddRoleGrid(false);
      } catch (error) {
        console.error('Error calling API:', error);
        openErrorAlert('Error while fetching roles. Please try again later.')
      }
    };
    const handleAddClientRoles = async (userData, selectedUserId) => {
      try {
        const url = `${keycloakUrl}/admin/realms/${keycloakInstance.realm}/users/${selectedUserId}/role-mappings/clients/85eb830b-c214-4ba4-bdae-2fb3d370697c`;
        const response = await httpClient.post(url, userData, {
          headers: {
            Authorization: `Bearer ${keycloakInstance.token}`,
            Accept: '*/*',
            'Content-Type': 'application/json'
          }
        });
        console.info('Roles assigned successfully:', response.data);
        openSuccessAlert('Roles assigned successfully')
        return response.data;
      } catch (error) {
        console.error('Error while assigning roles:', error);
        openErrorAlert('Error while assigning roles')
        throw error;
      }
    };
    
    const handleAddRolesClient = async (selectedUserId, client) => {
      try {
        const userData = [{
          id: client.id,
          name: client.name
        }];
        await handleAddClientRoles(userData, selectedUserId);
      } catch (error) {
        console.error('Error adding client roles:', error);
      }
    };
    const handleDeleteClientRoles = async (userData, selectedUserId) => {
      try {
        const url = `${keycloakUrl}/admin/realms/${keycloakInstance.realm}/users/${selectedUserId}/role-mappings/clients/85eb830b-c214-4ba4-bdae-2fb3d370697c`;
        console.log("Payload for delete client role", userData);
        const response = await httpClient.delete(url, { data: userData }, {
          headers: {
            Authorization: `Bearer ${keycloakInstance.token}`,
            Accept: '*/*',
            'Content-Type': 'application/json'
          }
        });
        console.info('Role deleted:', response.data);
        openSuccessAlert('Role deleted successfully')
        return response.data;
      } catch (error) {
        openErrorAlert('Error while deleting role')
        console.error('Error deleting role:', error);
        throw error;
      }
    };

    const handleConfirmDelete = async (client) => {
      try {
        console.log('Confirming delete for client:', client);
        await handleDeleteClientRole(apiData.id, client);
        setDeleteDialogOpen(false);
        handleGetClients(selectedUserId);
      } catch (error) {
        console.error('Error deleting client role:', error);
      }
    };
    
    const handleDeleteClientRole = async (selectedUserId, client) => {
      try {
        const userData = [
          {
            id: client.id,
            name: client.name
          }
        ];
        console.log("Deleting client", userData);
        await handleDeleteClientRoles(userData, selectedUserId);
      } catch (error) {
        console.error('Error deleting client role:', error);
      }
    };

    const handleOrganizationClick = () => {
      setShowOrganizationGrid(true);
      setShowAddOrgGrid(false);
      setClickedOrgName('');
      setSelectedOrgId('');
      setShowAddUserGrid(false);
      setOpenApiDialog(false);
    };

    const handleLogout = () => {
      keycloakInstance && keycloakInstance.logout(); 
    };
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar sx={{ pr: '24px', borderRadius: 3 }}>
            <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={toggleDrawer} sx={{ marginRight: '36px', ...(open && { display: 'none' }) }}>
              <Menu />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1] }}>
            <IconButton onClick={toggleDrawer}>
              <ChevronLeft />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <React.Fragment>
              <ListItemButton onClick={handleOrganizationClick}>
                <ListItemIcon>
                  <CorporateFare />
                </ListItemIcon>
                <ListItemText primary="Organization" />
              </ListItemButton>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </React.Fragment>
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{ backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900], flexGrow: 1, height: '100vh', overflow: 'auto',}}>
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}> 
            <Grid item xs={12} md={5} lg={5}>
                {showOrganizationGrid && (
                  <div style={{ position: 'relative' }}>
                    <Paper
                      sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'auto', overflow: 'auto', borderRadius: 5,marginBottom: '20px',}}>
                      <IconButton sx={{ position: 'absolute', top: '5px', right: '8px' }} onClick={toggleAddOrgGrid}>
                        <AddCircleRounded />
                      </IconButton>
                      <Title color="midnightblue">Organizations</Title>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: '#b5b4b3' }}>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Hapi Tenant</TableCell>
                            <TableCell>CCS Tenant</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orgs.map((org) => (
                            <TableRow key={org.id}>
                              <TableCell>{org.name}</TableCell>
                              <TableCell>{org.attributes.hapiTenant ? org.attributes.hapiTenant[0] : ''}</TableCell>
                              <TableCell>{org.attributes.ccsTenant ? org.attributes.ccsTenant[0] : ''}</TableCell>
                              <TableCell>
                                <div style={{ display: 'flex' }}>
                                  <IconButton size="small" onClick={(event) => handleDeleteClick(event, org)}>
                                    <Delete />
                                  </IconButton>&nbsp;&nbsp;
                                  <IconButton size="small" onClick={(event) => handleViewClick(event, org)}>
                                    <RecentActorsRounded />
                                  </IconButton>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </div>
                )}
                {showAddOrgGrid && addOrgGrid}
              </Grid>
                
                <Grid item xs={12} md={7} lg={7}>
                {clickedOrgName && (
                  <div style={{ position: 'relative' }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'auto', overflow: 'auto', borderRadius: 5, marginBottom: '20px', }}>
                      <IconButton sx={{ position: 'absolute', top: '5px', right: '8px' }}onClick={handleShowAddUserGrid}>
                        <AddCircleRounded />
                      </IconButton>
                      <Title color={'firebrick'}>{clickedOrgName} users list</Title>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: '#b5b4b3' }}>
                          <TableRow>
                            <TableCell>User Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orgUsers.map((user) => (
                            <TableRow key={user.id} onClick={() => handleApiCall(user.id)}>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <div style={{ display: 'flex' }}>
                                  <IconButton size="small" onClick={(event) => handleDeleteUserOrg(event, user)}>
                                    <Delete />
                                  </IconButton>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </div>
                )}
                <br/><br/>
                {showAddUserGrid && (
                  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: 5, marginBottom: '20px' }}>
                    <Title color={'midnightblue'}>Add User</Title>
                    <div>
                      <Stack flexDirection={'row'} justifyContent={'left'} width={'90%'}>
                        <TextField size="small" autoFocus margin="dense" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />&nbsp;&nbsp;
                        <TextField size="small" margin="dense" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)}/> &nbsp;&nbsp;
                        <TextField size="small" margin="dense" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />&nbsp;&nbsp;
                      </Stack><br />
                      <Stack flexDirection={'row'} justifyContent={'left'} width={'90%'}>
                        <TextField size="small" margin="dense" label="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>&nbsp;&nbsp;
                        <TextField size="small" margin="dense" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/> &nbsp;&nbsp;
                        <IconButton size="small" onClick={() => setShowAddUserGrid(false)} variant="outlined">
                          <Cancel />
                        </IconButton>
                        &nbsp;&nbsp;
                        <IconButton size="small" onClick={() => handleCreateUser(selectedOrgId)}variant="contained">
                          <CheckCircle />
                        </IconButton>
                        &nbsp;&nbsp;
                      </Stack>
                    </div>
                  </Paper>
                )}
                {openApiDialog && apiData && (
                  <Paper
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'auto', overflow: 'auto', borderRadius: 5, marginBottom: '20px' }}
                  >
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                      <Button
                        onClick={(event) => handleTabChange(event, 0)}
                        sx={{ backgroundColor: '#4caf50', color: '#fff' }}
                      >
                        User Details
                      </Button>
                      &nbsp;&nbsp;
                      <Button
                        onClick={(event) => handleGetClients(selectedUserId)}
                        sx={{ backgroundColor: '#ff9800', color: '#fff' }}
                      >
                        Roles
                      </Button>
                      &nbsp;&nbsp;
                      <Button
                        onClick={(event) => handleViewRoles(selectedOrgId, selectedUserId)}
                        sx={{ backgroundColor: '#2196f3', color: '#fff' }}
                      >
                        Org Roles
                      </Button>
                      &nbsp;&nbsp;
                    </ButtonGroup>
                    {selectedTab === 0 && (
                      <>
                        <Paper sx={{marginTop: '20px',p: 2,display: 'flex',flexDirection: 'column',height: 'auto',overflow: 'auto',borderRadius: 5,marginBottom: '20px',}}>
                          <Typography variant="h6" component="div" sx={{ marginBottom: '3px' }}>
                            User: {apiData.username}
                          </Typography>
                          <Table size="small">
                            <TableHead sx={{ backgroundColor: '#b5b4b3' }}>
                              <TableRow>
                                <TableCell>User Name</TableCell>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow key={apiData.id}>
                                <TableCell>{apiData.username}</TableCell>
                                <TableCell>{apiData.firstName}</TableCell>
                                <TableCell>{apiData.lastName}</TableCell>
                                <TableCell>{apiData.email}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Paper>
                      </>
                    )}
                    {selectedTab === 2 && (
                      <div style={{ position: 'relative' }}>
                        <Paper
                          sx={{
                            marginTop: '20px',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 'auto',
                            overflow: 'auto',
                            borderRadius: 5,
                            marginBottom: '20px',
                          }}
                        >
                          <Typography variant="h6" component="div" sx={{ marginBottom: '3px' }}>
                            User: {apiData.username}
                          </Typography>
                          <Table size="small">
                            <TableHead sx={{ backgroundColor: '#b5b4b3' }}>
                              <TableRow>
                                <TableCell>Id</TableCell>
                                <TableCell>Name</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {viewRolesData.map((role) => (
                                <TableRow key={role.id}>
                                  <TableCell>{role.id}</TableCell>
                                  <TableCell>{role.name}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            <Button sx={{ marginLeft: '8px' }} onClick={handleShowAddRoleGrid}>
                              Add
                            </Button>
                          </Box>
                        </Paper>
                      </div>
                    )}
                    {showAddRoleGrid && (
                      <Paper sx={{marginTop: '20px',p: 2,display: 'flex',flexDirection: 'column',height: 'auto',overflow: 'auto',borderRadius: 5,marginBottom: '20px',}}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#b5b4b3' }}>
                            <TableRow>
                              <TableCell>Role Name</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {availableRoles.map((role) => (
                              <TableRow key={role} onClick={() => handleRoleSelection(role)} style={{ cursor: 'pointer' }}>
                                <TableCell>{role}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Paper>
                    )}
                    {selectedTab === 1 && (
                      <div style={{ position: 'relative' }}>
                        <Paper sx={{marginTop: '20px',p: 2,display: 'flex',flexDirection: 'column',height: 'auto',overflow: 'auto',borderRadius: 5,marginBottom: '20px',}}>
                          <Typography variant="h6" component="div" sx={{ marginBottom: '3px' }}>
                            User: {apiData.username}
                          </Typography>
                          <Table size="small">
                            <TableHead sx={{ backgroundColor: '#b5b4b3' }}>
                              <TableRow>
                                <TableCell>Id</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {clientData.map((client) => (
                                <TableRow key={client.id}>
                                  <TableCell>{client.id}</TableCell>
                                  <TableCell>{client.name}</TableCell>
                                  <TableCell>
                                    <div style={{ display: 'flex' }}>
                                      <IconButton size="small" onClick={() => handleOpenDeleteDialog(client)}>
                                        <Delete />
                                      </IconButton>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            <Button sx={{ marginLeft: '8px' }} onClick={handleShowAddClientGrid}>
                              Add
                            </Button>
                          </Box>
                        </Paper>
                      </div>
                    )}
                    {showAddClientGrid && (
                      <Paper
                        sx={{marginTop: '20px',p: 2,display: 'flex',flexDirection: 'column',height: 'auto',overflow: 'auto',borderRadius: 5,marginBottom: '20px',}}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#b5b4b3' }}>
                            <TableRow>
                              <TableCell>Client Name</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {availableClients.map((client) => (
                              <TableRow key={client.id} onClick={() => handleClientRoleClick(client)} style={{ cursor: 'pointer' }}>
                                <TableCell>{client.name}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Paper>
                    )}
                  </Paper>
                )}
              </Grid>
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
      <ConfirmDeleteDialog open={deleteDialog} onClose={handleDeleteConfirmationClose} onConfirm={handleDelete} org={orgToDelete} />
      <DeleteRole open={deleteDialogOpen} onClose={handleCloseDeleteDialog} onConfirm={handleConfirmDelete} client={selectedClient} />
      <ConfirmDeleteUser open={deleteDialogUser} onClose={handleDeleteUserClose} onConfirm={(userId) => handleDeleteUserFromOrg(selectedOrgId, userId)} user={userToDelete} org={orgs} />
      <Alerts open={isSuccessAlertOpen} message={successAlertMessage} severity="success" onClose={closeAlerts} />
      <Alerts open={isErrorAlertOpen} message={errorAlertMessage} severity="error" onClose={closeAlerts} />
    </ThemeProvider>
  );
  
}
