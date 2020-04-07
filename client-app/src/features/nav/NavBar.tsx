import React from 'react';
import { Menu, Container, MenuItem, Button } from 'semantic-ui-react';

interface IProps {
  openCreateForm: () => void;
}

const NavBar: React.FC<IProps> = ({ openCreateForm }) => {
  return (
    <Menu inverted fixed='top'>
      <Container>
        <MenuItem>
          <img src='/assets/logo.png' alt='logo' style={{ marginRight: '10px' }}></img>
          Reactivities
        </MenuItem>
        <Menu.Item name='Activities' />
        <Menu.Item>
          <Button onClick={openCreateForm} positive content='Create Activity' />
        </Menu.Item>
      </Container>
    </Menu>
  );
};

export default NavBar;
