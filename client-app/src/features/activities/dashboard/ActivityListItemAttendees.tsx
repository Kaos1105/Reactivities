import React from 'react';
import { List, Image, Popup } from 'semantic-ui-react';
import { IAttendee } from '../../../app/models/activity';

interface IProps {
  attendees: IAttendee[];
}

const style = {
  borderColor: 'orange',
  borderWidth: '2px',
};

const ActivityListItemAttendees: React.FC<IProps> = ({ attendees }) => {
  return (
    <List horizontal>
      {attendees.map((attendee, index) => (
        <List.Item key={attendee.userName}>
          <Popup
            header={attendee.displayName}
            trigger={
              <Image
                size='mini'
                circular
                src={attendee.image || '/assets/user.png'}
                bordered
                style={attendee.following ? style : null}
              />
            }
          />
        </List.Item>
      ))}
    </List>
  );
};

export default ActivityListItemAttendees;
