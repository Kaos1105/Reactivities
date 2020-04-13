import React from 'react';
import { Item, Button, Label, Segment, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
//import ActivityStore from '../../../app/stores/activityStore';
import { IActivity } from '../../../app/models/activity';

const ActivityListItem: React.FC<{ activity: IActivity }> = ({ activity }) => {
  //const activityStore = useContext(ActivityStore);
  // const { deleteActivity, submitting, targetDelete } = activityStore;

  return (
    <Segment.Group>
      <Segment>
        <Item.Group>
          <Item>
            <Item.Image size='tiny' circular src='/assets/user.png' />
            <Item.Content>
              <Item.Header as='a'>{activity.title}</Item.Header>
              <Item.Description>Hosted by chaos</Item.Description>
              <Item.Extra>
                {/* <Button
            name={activity.id}
            loading={targetDelete === activity.id && submitting}
            onClick={(e) => deleteActivity(e, activity.id)}
            floated='right'
            content='Delete'
            color='red'
          /> */}
                <Label basic content={activity.category}></Label>
              </Item.Extra>
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
      <Segment>
        <Icon name='clock' />
        {activity.date}
        <Icon name='marker' />
        {activity.venue}, {activity.city}
      </Segment>
      <Segment secondary>Attendees will go here</Segment>
      <Segment clearing>
        <span>{activity.description}</span>
        <Button
          // onClick={() => selectActivity(activity.id)}
          as={Link}
          to={`/activities/${activity.id}`}
          floated='right'
          content='View'
          color='blue'
        />
      </Segment>
    </Segment.Group>
  );
};

export default ActivityListItem;
