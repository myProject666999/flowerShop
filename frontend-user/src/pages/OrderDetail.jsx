import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  List,
  Button,
  Tag,
  Divider,
  message,
  Result,
} from 'antd'
import {
  ArrowLeftOutlined,
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

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (id) {
      fetchOrderDetail()
    }
  }, [id])

  const fetchOrderDetail = async () => {
    setLoading(true)
    try {
      const res = await orderApi.getDetail(id)
      setOrder(res.data)
    } catch (error) {
      console.error('获取订单详情失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    try {
      await orderApi.pay(id)
      message.success('支付成功')
      fetchOrderDetail()
    } catch (error) {
      console.error('支付失败', error)
    }
  }

  const handleComplete = async () => {
    try {
      await orderApi.complete(id)
      message.success('确认收货成功')
      fetchOrderDetail()
    } catch (error) {
      console.error('确认收货失败', error)
    }
  }

  if (loading) {
    return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>
  }

  if (!order) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Result status="warning" title="订单不存在" />
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
          返回订单列表
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 50px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/orders')}
        style={{ marginBottom: 20 }}
      >
        返回订单列表
      </Button>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>订单详情</span>
            <Tag color={OrderStatusMap[order.status]?.color}>
              {OrderStatusMap[order.status]?.text}
            </Tag>
          </div>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="订单号">{order.order_no}</Descriptions.Item>
          <Descriptions.Item label="下单时间">
            {new Date(order.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="收货人">{order.receive_name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{order.receive_phone}</Descriptions.Item>
          <Descriptions.Item label="收货地址" span={2}>
            {order.receive_address}
          </Descriptions.Item>
          {order.remark && (
            <Descriptions.Item label="订单备注" span={2}>
              {order.remark}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider>商品信息</Divider>

        <List
          itemLayout="horizontal"
          dataSource={order.items || []}
          renderItem={(item) => (
            <List.Item
              actions={[
                <span key="price" style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  ¥{item.amount}
                </span>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                    }}
                  >
                    🌸
                  </div>
                }
                title={
                  <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/flowers/${item.flower_id}`)}>
                    {item.flower_name}
                  </div>
                }
                description={
                  <div>
                    <span style={{ color: '#666' }}>单价：¥{item.price}</span>
                    <span style={{ marginLeft: 20, color: '#666' }}>数量：{item.quantity}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        <Divider>金额明细</Divider>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="商品总额">
            <span style={{ color: '#ff4d4f' }}>¥{order.total_amount}</span>
          </Descriptions.Item>
          {order.discount > 0 && (
            <Descriptions.Item label="优惠金额">
              <span style={{ color: 'green' }}>-¥{order.discount}</span>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="实付金额">
            <span style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 'bold' }}>
              ¥{order.pay_amount}
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          {order.status === 0 && (
            <Button type="primary" size="large" icon={<PayCircleOutlined />} onClick={handlePay}>
              立即支付
            </Button>
          )}
          {order.status === 2 && (
            <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={handleComplete}>
              确认收货
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default OrderDetail
