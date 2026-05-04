import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Radio, message } from 'antd'
import { UserOutlined, LockOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { merchantApi, adminApi } from '../services/api'
import useStore from '../store/useStore'

function Login() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('merchant')
  const [form] = Form.useForm()

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      let res
      if (loginType === 'merchant') {
        res = await merchantApi.login(values)
        login(res.data.merchant, res.data.token, 'merchant')
        message.success('商家登录成功')
      } else {
        res = await adminApi.login(values)
        login(res.data.admin, res.data.token, 'admin')
        message.success('管理员登录成功')
      }
      navigate('/')
    } catch (error) {
      console.error('登录失败', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-title">
          <h1>
            {loginType === 'merchant' ? <ShopOutlined /> : <TeamOutlined />}
            &nbsp;花店管理后台
          </h1>
          <p>{loginType === 'merchant' ? '商家登录' : '管理员登录'}</p>
        </div>

        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item style={{ marginBottom: 24 }}>
            <Radio.Group
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              style={{ width: '100%', display: 'flex' }}
            >
              <Radio.Button value="merchant" style={{ flex: 1, textAlign: 'center' }}>
                <ShopOutlined style={{ marginRight: 4 }} />
                商家登录
              </Radio.Button>
              <Radio.Button value="admin" style={{ flex: 1, textAlign: 'center' }}>
                <TeamOutlined style={{ marginRight: 4 }} />
                管理员登录
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={loginType === 'merchant' ? '商家用户名（示例：merchant）' : '管理员用户名（示例：admin）'}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={loginType === 'merchant' ? '商家密码（示例：123456）' : '管理员密码（示例：admin123）'}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{ height: 48, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center', color: '#999', fontSize: 12 }}>
            <p style={{ margin: 0 }}>测试账号：</p>
            <p style={{ margin: 0 }}>商家：merchant / 123456</p>
            <p style={{ margin: 0 }}>管理员：admin / admin123</p>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
