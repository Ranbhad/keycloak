import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export function ConfirmDeleteDialog({ open, onClose, onConfirm, org }) {
  useEffect(() => {
    console.log(org); 
  }, [org]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        {org && <p>Are you sure you want to delete the organization: {org.name}?</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={() => onConfirm(org.id)} color="primary">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export function DeleteRole({ open, onClose, onConfirm, client }) {
  useEffect(() => {
    console.log('Client details in delete role dialog:', client);
  }, [client]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        {client && <p>Are you sure you want to delete the role for client: {client.name}?</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={() => onConfirm(client)} color="primary">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export function ConfirmDeleteUser({ open, onClose, onConfirm, user }) {
  useEffect(() => {
    console.log('org details in delete user dialog:', user); 
  }, [user]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        {user && <p>Are you sure you want to delete the organization: {user.username}?</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={() => onConfirm(user.id)} color="primary">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}