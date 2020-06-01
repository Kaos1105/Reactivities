import React, { useContext } from 'react';
import { Tab, Grid, Header, Card } from 'semantic-ui-react';
import { RootStoreContext } from '../../app/stores/rootStore';
import ProfileCard from './ProfileCard';

const ProfileFollowings = () => {
  const rootStore = useContext(RootStoreContext);
  const { profile, followings, setMainLoading, activeTab } = rootStore.profileStore;

  return (
    <Tab.Pane loading={setMainLoading}>
      <Grid>
        <Grid.Column width={16}>
          <Header
            floated='left'
            icon='user'
            content={
              activeTab === 3
                ? `People following ${profile!.displayName}`
                : `People ${profile!.displayName} is following`
            }
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Card.Group itemsPerRow={5}>
            {console.log(profile)}
            {followings.map((profile) => (
              <ProfileCard key={profile.userName} profile={profile} />
            ))}
          </Card.Group>
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};

export default ProfileFollowings;
