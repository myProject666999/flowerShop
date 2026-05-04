import React, { useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Badge, Button, Avatar, Dropdown, Space, message } from 'antd'
import {
  HomeOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ReconciliationOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import useStore from '../store/useStore'
import { cartApi } from '../services/api'

const { Header, Content, Footer } = AntLayout

function Layout() {
  const navigate = useNavigate()
  const { user, logout, cartCount, setCartCount } = useStore()

  useEffect(() => {
    if (user) {
      fetchCartCount()
    }
  }, [user])

  const fetchCartCount = async () => {
    try {
      const res = await cartApi.getList()
      setCartCount(res.data?.list?.length || 0)
    } catch (error) {
      console.error('获取购物车数量失败', error)
    }
  }

  const handleLogout = () => {
    logout()
    message.success('退出登录成功')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人中心</Link>,
    },
    {
      key: 'orders',
      icon: <ReconciliationOutlined />,
      label: <Link to="/orders">我的订单</Link>,
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: <Link to="/favorites">我的收藏</Link>,
    },
    {
      key: 'address',
      icon: <EnvironmentOutlined />,
      label: <Link to="/address">地址管理</Link>,
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ]

  const headerMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/flowers',
      label: <Link to="/flowers">鲜花商城</Link>,
    },
  ]

  return (
    <AntLayout className="layout" style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#fff',
          padding: '0 50px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#ff4d4f',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              🌸 在线花店
            </div>
            <Menu
              mode="horizontal"
              selectedKeys={[window.location.pathname]}
              items={headerMenuItems}
              style={{ borderBottom: 'none', minWidth: 200 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {user ? (
              <>
                <Badge count={cartCount} size="small">
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
                    onClick={() => navigate('/cart')}
                  />
                </Badge>
                <Badge dot size="default">
                  <Button
                    type="text"
                    icon={<HeartOutlined style={{ fontSize: 20 }} />}
                    onClick={() => navigate('/favorites')}
                  />
                </Badge>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Space style={{ cursor: 'pointer' }}>
                    <Avatar size={32} icon={<UserOutlined />} src={user?.avatar} />
                    <span>{user?.nickname || user?.username}</span>
                  </Space>
                </Dropdown>
              </>
            ) : (
              <>
                <Button type="link" onClick={() => navigate('/login')}>
                  登录
                </Button>
                <Button type="primary" onClick={() => navigate('/register')}>
                  注册
                </Button>
              </>
            )}
          </div>
        </div>
      </Header>

      <Content style={{ background: '#f5f5f5' }}>
        <Outlet />
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        在线花店 ©2024 Created by FlowerShop Team
      </Footer>
    </AntLayout>
  )
}

export default Layout
