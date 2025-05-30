import React, { useState } from 'react';
import {
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { ActionType } from '../types/types';

interface ActionMenuProps {
  onAction: (action: ActionType) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onAction }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: ActionType) => {
    onAction(action);
    handleClose();
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleAction('ADD_CATEGORY')}>
          <ListItemIcon>
            <CategoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nouvelle catégorie</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('ADD_BUDGET')}>
          <ListItemIcon>
            <AccountBalanceIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nouveau budget</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('ADD_EXPENSE')}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nouvelle dépense</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ActionMenu; 