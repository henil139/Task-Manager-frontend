import { Card, Table, Tag, Spin } from 'antd';
import { useAuditLogs } from '../../hooks/useAuditLogs.js';
import dayjs from 'dayjs';

export default function ActivityLogs() {
  const { data: logs, isLoading } = useAuditLogs(100);

  // Format the changes for display
  const formatChange = (oldValues, newValues) => {
    if (!oldValues && newValues) return 'Task created';
    if (oldValues && !newValues) return 'Task deleted';
    const changes = [];
    if (oldValues?.status !== newValues?.status) {
      changes.push(`Status: ${oldValues?.status || '-'} → ${newValues?.status || '-'}`);
    }
    if (oldValues?.assigned_to !== newValues?.assigned_to) changes.push('Assignee changed');
    if (oldValues?.due_date !== newValues?.due_date) changes.push('Due date changed');
    return changes.join(', ') || 'Updated';
  };

  // Table columns
  const columns = [
    { title: 'User', key: 'user', render: (_, r) => r.user?.full_name || r.user?.email || 'System' },
    {
      title: 'Action',
      dataIndex: 'operation',
      key: 'operation',
      render: (op) => <Tag color={op === 'insert' ? 'green' : op === 'delete' ? 'red' : 'blue'}>{op}</Tag>,
    },
    { title: 'Table', dataIndex: 'table_name', key: 'table_name' },
    { title: 'Changes', key: 'changes', render: (_, r) => formatChange(r.old_values, r.new_values) },
    { title: 'Time', dataIndex: 'created_at', key: 'created_at', render: (d) => dayjs(d).format('YYYY-MM-DD HH:mm') },
  ];

  if (isLoading) return <Spin />;

  return (
    <div>
      <h2>Activity Logs</h2>
      <Card>
        <Table dataSource={logs} columns={columns} rowKey="id" size="small" pagination={false} />
      </Card>
    </div>
  );
}
