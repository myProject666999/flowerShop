import React, { useEffect, useState } from 'react'
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import { addressApi } from '../services/api'

const { Option } = Select

function Address() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const res = await addressApi.getList()
      setAddresses(res.data || [])
    } catch (error) {
      console.error('获取地址列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingAddress(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    form.setFieldsValue(address)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await addressApi.delete(id)
      message.success('删除成功')
      fetchAddresses()
    } catch (error) {
      console.error('删除地址失败', error)
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await addressApi.setDefault(id)
      message.success('设置成功')
      fetchAddresses()
    } catch (error) {
      console.error('设置默认地址失败', error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingAddress) {
        await addressApi.update(editingAddress.id, values)
        message.success('修改成功')
      } else {
        await addressApi.create(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      fetchAddresses()
    } catch (error) {
      console.error('提交地址失败', error)
    }
  }

  return (
    <div style={{ padding: '20px 50px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              地址管理
            </span>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加地址
            </Button>
          </div>
        }
      >
        {addresses.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={addresses}
            loading={loading}
            renderItem={(item) => (
              <List.Item>
                <Card
                  style={{
                    border: item.is_default ? '2px solid #1890ff' : '1px solid #f0f0f0',
                  }}
                  actions={[
                    item.is_default ? (
                      <span key="default" style={{ color: '#1890ff' }}>
                        <CheckOutlined /> 默认地址
                      </span>
                    ) : (
                      <Button
                        key="default"
                        type="link"
                        onClick={() => handleSetDefault(item.id)}
                      >
                        设为默认
                      </Button>
                    ),
                    <Button key="edit" type="link" onClick={() => handleEdit(item)}>
                      <EditOutlined /> 编辑
                    </Button>,
                    <Button
                      key="delete"
                      type="link"
                      danger
                      onClick={() => handleDelete(item.id)}
                    >
                      <DeleteOutlined /> 删除
                    </Button>,
                  ]}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                      {item.name}
                      <span style={{ marginLeft: 16, fontWeight: 'normal' }}>{item.phone}</span>
                    </div>
                    <div style={{ color: '#666' }}>
                      {item.province}
                      {item.city}
                      {item.district}
                      {item.detail}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Empty description={<span style={{ color: '#999' }}>暂无收货地址</span>}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加地址
              </Button>
            </Empty>
          </div>
        )}
      </Card>

      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="收货人姓名"
            rules={[{ required: true, message: '请输入收货人姓名' }]}
          >
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item name="province" label="省份">
            <Input placeholder="请输入省份" />
          </Form.Item>

          <Form.Item name="city" label="城市">
            <Input placeholder="请输入城市" />
          </Form.Item>

          <Form.Item name="district" label="区县">
            <Input placeholder="请输入区县" />
          </Form.Item>

          <Form.Item
            name="detail"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入详细地址" />
          </Form.Item>

          <Form.Item name="is_default" label="是否设为默认地址">
            <Select placeholder="请选择">
              <Option value={0}>否</Option>
              <Option value={1}>是</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Address
