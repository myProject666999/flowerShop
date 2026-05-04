import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Button, Descriptions, Avatar, message, Row, Col } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { merchantApi, adminApi } from '../services/api'
import useStore from '../store/useStore'

function Profile() {
  const { user, role, updateUser } = useStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [currentUser, setCurrentUser] = useState(user)

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      let res
      if (role === 'merchant') {
        res = await merchantApi.getProfile()
      } else {
        res = await adminApi.getProfile()
      }
      setCurrentUser(res.data)
      updateUser(res.data)
      form.setFieldsValue({
        username: res.data?.username,
        nickname: res.data?.nickname,
        phone: res.data?.phone,
        email: res.data?.email,
      })
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      if (role === 'merchant') {
        await merchantApi.updateProfile(values)
      } else {
        await adminApi.updateProfile(values)
      }
      message.success('修改成功')
      fetchUserInfo()
    } catch (error) {
      console.error('修改失败', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          个人中心
        </h2>
        <p style={{ margin: 0, color: '#999' }}>管理个人信息</p>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="编辑个人信息">
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="用户名"
              >
                <Input disabled placeholder="用户名不可修改" />
              </Form.Item>

              <Form.Item
                name="nickname"
                label="昵称"
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="用户信息">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#ff9a9e', fontSize: 48 }} />
              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: 0, marginBottom: 4 }}>{currentUser?.username}</h3>
                <p style={{ margin: 0, color: '#999' }}>{role === 'merchant' ? '商家' : '管理员'}</p>
              </div>
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="用户名">{currentUser?.username || '-'}</Descriptions.Item>
              <Descriptions.Item label="昵称">{currentUser?.nickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="手机号">{currentUser?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{currentUser?.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleString() : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
