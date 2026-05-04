import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  ReconciliationOutlined,
  ShopOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { adminApi, orderApi, userAdminApi, flowerApi } from '../services/api'
import useStore from '../store/useStore'

const OrderStatusMap = {
  0: { text: '待付款', color: 'orange' },
  1: { text: '待发货', color: 'blue' },
  2: { text: '配送中', color: 'processing' },
  3: { text: '已完成', color: 'success' },
  4: { text: '已取消', color: 'default' },
}

function Dashboard() {
  const { role } = useStore()
  const [stats, setStats] = useState({
    userCount: 0,
    orderCount: 0,
    categoryCount: 0,
    totalSales: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (role === 'admin') {
        const [statsRes, ordersRes] = await Promise.all([
          adminApi.getStats(),
          orderApi.getList({ page: 1, page_size: 10 }),
        ])
        setStats({
          userCount: statsRes.data?.user_count || 0,
          orderCount: statsRes.data?.order_count || 0,
          categoryCount: statsRes.data?.category_count || 0,
          totalSales: statsRes.data?.total_sales || 0,
        })
        setRecentOrders(ordersRes.data?.list || [])
      } else {
        const ordersRes = await orderApi.getList({ page: 1, page_size: 10 })
        setRecentOrders(ordersRes.data?.list || [])
        setStats({
          userCount: 0,
          orderCount: ordersRes.data?.total || 0,
          categoryCount: 0,
          totalSales: 0,
        })
      }
    } catch (error) {
      console.error('获取数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 180,
    },
    {
      title: '收货人',
      dataIndex: 'receive_name',
      key: 'receive_name',
    },
    {
      title: '联系电话',
      dataIndex: 'receive_phone',
      key: 'receive_phone',
    },
    {
      title: '实付金额',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      render: (amount) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{amount}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={OrderStatusMap[status]?.color}>
          {OrderStatusMap[status]?.text}
        </Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>
          <DashboardOutlined style={{ marginRight: 8 }} />
          仪表盘
        </h2>
        <p style={{ margin: 0, color: '#999' }}>欢迎使用花店管理后台</p>
      </div>

      {role === 'admin' && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card className="dashboard-card">
              <Statistic
                title="用户总数"
                value={stats.userCount}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="dashboard-card">
              <Statistic
                title="订单总数"
                value={stats.orderCount}
                prefix={<ReconciliationOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="dashboard-card">
              <Statistic
                title="鲜花种类"
                value={stats.categoryCount}
                prefix={<ShopOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="dashboard-card">
              <Statistic
                title="销售额"
                value={stats.totalSales}
                precision={2}
                prefix={<DollarOutlined style={{ color: '#ff4d4f' }} />}
                suffix="元"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {role === 'merchant' && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card className="dashboard-card">
              <Statistic
                title="订单总数"
                value={stats.orderCount}
                prefix={<ReconciliationOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card className="dashboard-card">
              <Statistic
                title="待处理订单"
                value={recentOrders.filter((o) => o.status === 1).length}
                prefix={<ReconciliationOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card title="最近订单" extra={<a onClick={fetchData} style={{ cursor: 'pointer' }}>刷新</a>}>
        <Table
          rowKey="id"
          columns={orderColumns}
          dataSource={recentOrders}
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default Dashboard
