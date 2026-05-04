import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Button, Tag, message } from 'antd'
import {
  DashboardOutlined,
  ShopOutlined,
  ReconciliationOutlined,
  TeamOutlined,
  AppstoreOutlined,
  NotificationOutlined,
  PictureOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
} from '@ant-design/icons'
import useStore from '../store/useStore'
import { merchantApi, adminApi } from '../services/api'

const { Header, Sider, Content } = Layout

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role, logout, updateUser } = useStore()
  const [collapsed, setCollapsed] = useState(false)
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
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  const handleLogout = () => {
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      showFor: ['admin', 'merchant'],
    },
    {
      key: '/flowers',
      icon: <ShopOutlined />,
      label: '鲜花管理',
      showFor: ['admin', 'merchant'],
    },
    {
      key: '/orders',
      icon: <ReconciliationOutlined />,
      label: '订单管理',
      showFor: ['admin', 'merchant'],
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: '用户管理',
      showFor: ['admin'],
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: '分类管理',
      showFor: ['admin'],
    },
    {
      key: '/announcements',
      icon: <NotificationOutlined />,
      label: '公告管理',
      showFor: ['admin'],
    },
    {
      key: '/banners',
      icon: <PictureOutlined />,
      label: '轮播图管理',
      showFor: ['admin'],
    },
    {
      key: '/logs',
      icon: <FileTextOutlined />,
      label: '日志管理',
      showFor: ['admin'],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.showFor.includes(role))

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => navigate('/password'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
      danger: true,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={240}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            borderBottom: '1px solid #303030',
          }}
        >
          <div
            style={{
              fontSize: collapsed ? 12 : 20,
              fontWeight: 'bold',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: collapsed ? 16 : 24 }}>🌸</span>
            {!collapsed && <span>花店管理后台</span>}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredMenuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tag color={role === 'admin' ? 'blue' : 'green'}>
              {role === 'admin' ? '管理员' : '商家'}
            </Tag>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 4,
                  transition: 'all 0.3s',
                }}
              >
                <Avatar size={32} icon={<UserOutlined />} />
                <span style={{ color: '#333' }}>{currentUser?.username || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
