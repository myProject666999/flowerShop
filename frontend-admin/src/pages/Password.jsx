import React, { useState } from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { merchantApi, adminApi } from '../services/api'
import useStore from '../store/useStore'

function Password() {
  const { role } = useStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的新密码不一致')
      return
    }

    setLoading(true)
    try {
      const data = {
        old_password: values.old_password,
        new_password: values.new_password,
      }

      if (role === 'merchant') {
        await merchantApi.updatePassword(data)
      } else {
        await adminApi.updatePassword(data)
      }

      message.success('密码修改成功')
      form.resetFields()
    } catch (error) {
      console.error('修改密码失败', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>
          <LockOutlined style={{ marginRight: 8 }} />
          修改密码
        </h2>
        <p style={{ margin: 0, color: '#999' }}>修改登录密码</p>
      </div>

      <Card style={{ maxWidth: 500 }}>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="old_password"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" size="large" />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码（至少6位）" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="确认新密码"
            rules={[
              { required: true, message: '请再次输入新密码' },
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Password
