import React from 'react';

interface StatusColorProps {
  status: string;
}

const statusColor: React.FC<StatusColorProps> = ({ status }) => {

  let color: string;
  switch (status) {
    case 'Completed':
      color = 'blue';
      break;
    case 'Incomplete':
      color = 'red';
      break;
    case 'Feedback':
      color = 'orange';
      status = 'Waiting for Feedback' 
      break;
    case 'Editing':
      color = 'gray';
      break;
    case 'Shooting':
      color = 'brown';
      break;
    default:
      color = 'black';
  }

  return (
    <td style={{ color }}>
      {status}
    </td>
  );
};

export default statusColor;
