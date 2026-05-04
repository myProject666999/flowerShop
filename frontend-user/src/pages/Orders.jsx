import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Card,
  Tag,
  Button,
  Tabs,
  Empty,
  message,
  Descriptions,
} from 'antd'
import {
  ReconciliationOutlined,
  EyeOutlined,
  PayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { orderApi } from '../services/api'

const OrderStatusMap = {
  0: { text: '待付款', color: 'orange' },
  1: { text: '待发货', color: 'blue' },
  2: { text: '配送中', color: 'processing' },
  3: { text: '已完成', color: 'success' },
  4: { text: '已取消', color: 'default' },
}

function Orders() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [activeKey, setActiveKey] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [activeKey])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeKey !== 'all') {
        params.status = activeKey
      }
      const res = await orderApi.getList(params)
      setOrders(res.data?.list || [])
    } catch (error) {
      console.error('获取订单列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (order) => {
    try {
      await orderApi.pay(order.id)
      message.success('支付成功')
      fetchOrders()
    } catch (error) {
      console.error('支付失败', error)
    }
  }

  const handleComplete = async (order) => {
    try {
      await orderApi.complete(order.id)
      message.success('确认收货成功')
      fetchOrders()
    } catch (error) {
      console.error('确认收货失败', error)
    }
  }

  const tabItems = [
    { key: 'all', label: '全部订单' },
    { key: '0', label: '待付款' },
    { key: '1', label: '待发货' },
    { key: '2', label: '配送中' },
    { key: '3', label: '已完成' },
    { key: '4', label: '已取消' },
  ]

  const columns = [
    {
      title: '订单信息',
      key: 'info',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#999', marginRight: 10 }}>订单号：</span>
            <span style={{ fontFamily: 'monospace' }}>{record.order_no}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#999', marginRight: 10 }}>下单时间：</span>
            <span>{new Date(record.created_at).toLocaleString()}</span>
          </div>
          <div>
            <span style={{ color: '#999', marginRight: 10 }}>状态：</span>
            <Tag color={OrderStatusMap[record.status]?.color}>
              {OrderStatusMap[record.status]?.text}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: '商品',
      key: 'items',
      render: (_, record) => (
        <div>
          {record.items?.slice(0, 2).map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: index < 1 ? 8 : 0,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                🌸
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{item.flower_name}</div>
                <div style={{ color: '#999', fontSize: 12 }}>
                  ¥{item.price} × {item.quantity}
                </div>
              </div>
            </div>
          ))}
          {record.items?.length > 2 && (
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
              等共 {record.items.length} 件商品
            </div>
          )}
        </div>
      ),
    },
    {
      title: '收货信息',
      key: 'receiver',
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 500 }}>{record.receive_name}</span>
            <span style={{ marginLeft: 10 }}>{record.receive_phone}</span>
          </div>
          <div style={{ color: '#666', fontSize: 13 }}>{record.receive_address}</div>
        </div>
      ),
    },
    {
      title: '实付金额',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      align: 'center',
      render: (amount) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 16 }}>
          ¥{amount}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${record.id}`)}
          >
            详情
          </Button>
          {record.status === 0 && (
            <Button
              type="primary"
              size="small"
              icon={<PayCircleOutlined />}
              onClick={() => handlePay(record)}
            >
              立即支付
            </Button>
          )}
          {record.status === 2 && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record)}
            >
              确认收货
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div style={{ padding: '20px 50px' }}>
      <Card>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, marginBottom: 16 }}>
            <ReconciliationOutlined style={{ marginRight: 10 }} />
            我的订单
          </h2>
        </div>

        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabItems}
        />

        {orders.length > 0 ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={orders}
            loading={loading}
            pagination={false}
          />
        ) : (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: '#999' }}>暂无订单</span>}
            >
              <Button type="primary" onClick={() => navigate('/flowers')}>
                去逛逛
              </Button>
            </Empty>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Orders
