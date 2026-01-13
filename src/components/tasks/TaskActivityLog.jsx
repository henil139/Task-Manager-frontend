import { Timeline, Card, Spin, Empty } from 'antd';
import { useTaskAuditLogs } from '../../hooks/useAuditLogs.js';
import dayjs from 'dayjs';

export default function TaskActivityLog({ taskId }) {
  const { data: logs, isLoading } = useTaskAuditLogs(taskId);

  if (isLoading) return <Card title="Activity History"><Spin /></Card>;
  if (!logs || logs.length === 0) return <Card title="Activity History"><Empty description="No activity yet" /></Card>;

  // Format change for display
  const formatChange = (log) => {
    const changes = [];
    const oldVals = log.old_values || {};
    const newVals = log.new_values || {};

    // Status change
    if (oldVals.status !== newVals.status) {
      changes.push({
        type: 'Status',
        from: oldVals.status?.replace(/_/g, ' ') || '-',
        to: newVals.status?.replace(/_/g, ' ') || '-',
      });
    }

    // Assignee change
    if (oldVals.assigned_to !== newVals.assigned_to) {
      const oldName = log.old_assignee?.full_name || log.old_assignee?.email || 'Unassigned';
      const newName = log.new_assignee?.full_name || log.new_assignee?.email || 'Unassigned';
      changes.push({
        type: 'Assignee',
        from: oldVals.assigned_to ? oldName : 'Unassigned',
        to: newVals.assigned_to ? newName : 'Unassigned',
      });
    }

    // Due date change
    if (oldVals.due_date !== newVals.due_date) {
      changes.push({
        type: 'Due Date',
        from: oldVals.due_date ? dayjs(oldVals.due_date).format('MMM D, YYYY') : 'None',
        to: newVals.due_date ? dayjs(newVals.due_date).format('MMM D, YYYY') : 'None',
      });
    }

    return changes;
  };

  const timelineItems = logs.map((log) => {
    const changes = formatChange(log);
    const userName = log.user?.full_name || log.user?.email || 'System';
    const time = dayjs(log.created_at).format('MMM D, YYYY h:mm A');

    return {
      key: log.id,
      children: (
        <div>
          <div style={{ fontSize: 12, color: '#888' }}>{time} by {userName}</div>
          {changes.map((change, idx) => (
            <div key={idx} style={{ marginTop: 4 }}>
              <strong>{change.type}:</strong> {change.from} → {change.to}
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <Card title="Activity History" style={{ marginTop: 16 }}>
      <Timeline items={timelineItems} />
    </Card>
  );
}
