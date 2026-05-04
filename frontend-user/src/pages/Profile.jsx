import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Modal,
  message,
  Descriptions,
  Divider,
  Tabs,
  Statistic,
  Row,
  Col,
  Tag,
} from 'antd'
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  WalletOutlined,
  SettingOutlined,
  ReconciliationOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { userApi, orderApi, cartApi, favoriteApi, addressApi } from '../services/api'
import useStore from '../store/useStore'

const { TabPane } = Tabs

function Profile() {
  const navigate = useNavigate()
  const { user, updateUser, cartCount, updateCartCount } = useStore()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ orders: 0, favorites: 0, addresses: 0, cartItems: 0 })
  const [infoForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)

  useEffect(() => {
    fetchStats()
    if (user) {
      infoForm.setFieldsValue({
        username: user.username,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
      })
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const [ordersRes, favoritesRes, addressesRes, cartRes] = await Promise.all([
        orderApi.getList(),
        favoriteApi.getList(),
        addressApi.getList(),
        cartApi.getList(),
      ])
      setStats({
        orders: ordersRes.data?.list?.length || 0,
        favorites: favoritesRes.data?.list?.length || 0,
        addresses: addressesRes.data?.length || 0,
        cartItems: cartRes.data?.length || 0,
      })
    } catch (error) {
      console.error('获取统计数据失败', error)
    }
  }

  const handleInfoSubmit = async (values) => {
    setLoading(true)
    try {
      await userApi.updateProfile(values)
      message.success('修改成功')
      setInfoModalVisible(false)
      const res = await userApi.getProfile()
      updateUser(res.data)
    } catch (error) {
      console.error('修改资料失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致')
      return
    }
    setLoading(true)
    try {
      await userApi.updatePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      })
      message.success('密码修改成功')
      setPasswordModalVisible(false)
      passwordForm.resetFields()
    } catch (error) {
      console.error('修改密码失败', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOverview = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/orders')}>
            <Statistic
              title="我的订单"
              value={stats.orders}
              prefix={<ReconciliationOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/favorites')}>
            <Statistic
              title="我的收藏"
              value={stats.favorites}
              prefix={<HeartOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/cart')}>
            <Statistic
              title="购物车"
              value={stats.cartItems}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/address')}>
            <Statistic
              title="收货地址"
              value={stats.addresses}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="基本信息" extra={
        <Button type="link" icon={<EditOutlined />} onClick={() => setInfoModalVisible(true)}>
          编辑
        </Button>
      }>
        <Descriptions column={2}>
          <Descriptions.Item label="用户名">{user?.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="昵称">{user?.nickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="余额">
            <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 18 }}>
              ¥{user?.balance || 0}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )

  const renderSecurity = () => (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: 4 }}>登录密码</h3>
            <p style={{ margin: 0, color: '#999' }}>定期修改密码可以保护账号安全</p>
          </div>
          <Button type="primary" icon={<LockOutlined />} onClick={() => setPasswordModalVisible(true)}>
            修改密码
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <div style={{ padding: '20px 50px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, padding: 20, background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', borderRadius: 8 }}>
          <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#fff', color: '#ff9a9e', fontSize: 36 }} />
          <div style={{ marginLeft: 24 }}>
            <h2 style={{ margin: 0, marginBottom: 8, color: '#fff' }}>
              {user?.nickname || user?.username || '用户'}
              <Tag color="green" style={{ marginLeft: 12 }}>普通用户</Tag>
            </h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              <WalletOutlined style={{ marginRight: 8 }} />
              余额：<span style={{ fontWeight: 'bold', fontSize: 18 }}>¥{user?.balance || 0}</span>
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button type="primary" icon={<SettingOutlined />} onClick={() => setInfoModalVisible(true)}>
              编辑资料
            </Button>
          </div>
        </div>

        <Tabs defaultActiveKey="overview">
          <TabPane
            tab={<span><UserOutlined /> 个人中心</span>}
            key="overview"
          >
            {renderOverview()}
          </TabPane>
          <TabPane
            tab={<span><LockOutlined /> 安全设置</span>}
            key="security"
          >
            {renderSecurity()}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="编辑个人资料"
        open={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={infoForm} onFinish={handleInfoSubmit} layout="vertical">
          <Form.Item name="username" label="用户名">
            <Input disabled placeholder="用户名不可修改" />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => setInfoModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确定
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={passwordForm} onFinish={handlePasswordSubmit} layout="vertical">
          <Form.Item
            name="old_password"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            rules={[{ required: true, message: '请再次输入新密码' }]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => setPasswordModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确定
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
