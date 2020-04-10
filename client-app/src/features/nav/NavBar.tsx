import React, { useContext } from 'react';
import { Menu, Container, MenuItem, Button } from 'semantic-ui-react';
import ActivityStore from '../../app/stores/activityStore';
import { observer } from 'mobx-react-lite';

const NavBar: React.FC = () => {
  const activityStore = useContext(ActivityStore);
  return (
    <Menu inverted fixed='top'>
      <Container>
        <MenuItem>
          <img src='/assets/logo.png' alt='logo' style={{ marginRight: '10px' }}></img>
          Reactivities
        </MenuItem>
        <Menu.Item name='Activities' />
        <Menu.Item>
          <Button onClick={activityStore.openCreateForm} positive content='Create Activity' />
        </Menu.Item>
      </Container>
    </Menu>
  );
};

export default observer(NavBar);
