import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

// Reusable confirmation dialog for critical actions
export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger, loading }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: danger ? '#ff4d4f' : '#faad14', fontSize: 20 }} />
          <span>{title}</span>
        </div>
      }
    >
      <p style={{ marginTop: 16 }}>{description}</p>
    </Modal>
  );
}
