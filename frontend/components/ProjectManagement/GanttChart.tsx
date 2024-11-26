'use client';

import { useState } from 'react';
import Paper from '@mui/material/Paper';
import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentTooltip,
  Resources,
  DragDropProvider,
} from '@devexpress/dx-react-scheduler-material-ui';
import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from '@devexpress/dx-react-scheduler';
import { format } from 'date-fns';

interface Task {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  assigneeId: number;
  status: string;
}

interface Resource {
  id: number;
  text: string;
  color: string;
}

const resources = [
  {
    fieldName: 'assigneeId',
    title: 'Assignee',
    instances: [
      { id: 1, text: 'John Doe', color: '#FFA726' },
      { id: 2, text: 'Jane Smith', color: '#AB47BC' },
      { id: 3, text: 'Bob Johnson', color: '#7E57C2' },
    ],
  },
  {
    fieldName: 'status',
    title: 'Status',
    instances: [
      { id: 'planned', text: 'Planned', color: '#64B5F6' },
      { id: 'in-progress', text: 'In Progress', color: '#81C784' },
      { id: 'completed', text: 'Completed', color: '#4DB6AC' },
    ],
  },
];

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Project Planning',
    startDate: new Date(2024, 2, 1, 9, 0),
    endDate: new Date(2024, 2, 3, 17, 0),
    assigneeId: 1,
    status: 'in-progress',
  },
  {
    id: 2,
    title: 'Design Phase',
    startDate: new Date(2024, 2, 4, 9, 0),
    endDate: new Date(2024, 2, 8, 17, 0),
    assigneeId: 2,
    status: 'planned',
  },
];

const Appointment = ({
  children,
  style,
  ...restProps
}: any) => (
  <Appointments.Appointment
    {...restProps}
    style={{
      ...style,
      backgroundColor: resources[0].instances.find(
        resource => resource.id === restProps.data.assigneeId
      )?.color,
    }}
  >
    {children}
  </Appointments.Appointment>
);

export default function GanttChart() {
  const [data, setData] = useState<Task[]>(initialTasks);

  const commitChanges = ({ added, changed, deleted }: any) => {
    if (added) {
      const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
      setData([...data, { id: startingAddedId, ...added }]);
    }
    if (changed) {
      setData(data.map(appointment => (
        changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment
      )));
    }
    if (deleted !== undefined) {
      setData(data.filter(appointment => appointment.id !== deleted));
    }
  };

  return (
    <Paper>
      <Scheduler
        data={data}
        height={660}
      >
        <ViewState />
        <EditingState
          onCommitChanges={commitChanges}
        />
        <IntegratedEditing />
        <WeekView
          startDayHour={9}
          endDayHour={19}
        />
        <Appointments
          appointmentComponent={Appointment}
        />
        <AppointmentTooltip
          showCloseButton
          showDeleteButton
        />
        <Resources
          data={resources}
        />
        <DragDropProvider />
      </Scheduler>
    </Paper>
  );
}
