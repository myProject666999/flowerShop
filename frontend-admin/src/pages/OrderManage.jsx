import React, { useEffect, useState } from 'react'
import {
  Table,
  Card,
  Button,
  Tag,
  Modal,
  Descriptions,
  List,
  message,
  Space,
  Input,
  Select,
} from 'antd'
import {
  ReconciliationOutlined,
  SearchOutlined,
  EyeOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { orderApi, merchantOrderApi } from '../services/api'
import useStore from '../store/useStore'

const { Search } = Input
const { Option } = Select

const OrderStatusMap = {
  0: { text: '待付款', color: 'orange' },
  1: { text: '待发货', color: 'blue' },
  2: { text: '配送中', color: 'processing' },
  3: { text: '已完成', color: 'success' },
  4: { text: '已取消', color: 'default' },
}

function OrderManage() {
  const { role } = useStore()
  const api = role === 'admin' ? orderApi : merchantOrderApi
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (searchText) {
        params.keyword = searchText
      }
      if (statusFilter !== null) {
        params.status = statusFilter
      }
      const res = await api.getList(params)
      setData(res.data?.list || [])
      setPagination({
        current: page,
        pageSize,
        total: res.data?.total || 0,
      })
    } catch (error) {
      console.error('获取数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (record) => {
    setCurrentOrder(record)
    setDetailVisible(true)
  }

  const handleShip = async (id) => {
    try {
      if (role === 'merchant') {
        await merchantOrderApi.ship(id)
      } else {
        await orderApi.updateStatus(id, { status: 2 })
      }
      message.success('发货成功')
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('发货失败', error)
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
    fetchData(1, pagination.pageSize)
  }

  const columns = [
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
      width: 100,
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
      width: 160,
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {role === 'merchant' && record.status === 1 && (
            <Button type="primary" size="small" icon={<SendOutlined />} onClick={() => handleShip(record.id)}>
              发货
            </Button>
          )}
          {role === 'admin' && record.status === 1 && (
            <Button type="primary" size="small" icon={<SendOutlined />} onClick={() => handleShip(record.id)}>
              发货
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>
          <ReconciliationOutlined style={{ marginRight: 8 }} />
          订单管理
        </h2>
        <p style={{ margin: 0, color: '#999' }}>管理所有订单信息</p>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <Search
            placeholder="搜索订单号、收货人"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="全部状态"
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
          >
            {Object.entries(OrderStatusMap).map(([key, val]) => (
              <Option key={key} value={parseInt(key)}>
                {val.text}
              </Option>
            ))}
          </Select>
          <Button onClick={() => fetchData(pagination.current, pagination.pageSize)}>
            刷新
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total) => `共 ${total} 条`,
            showSizeChanger: true,
            onChange: (page, pageSize) => fetchData(page, pageSize),
          }}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentOrder && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="订单号">{currentOrder.order_no}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={OrderStatusMap[currentOrder.status]?.color}>
                  {OrderStatusMap[currentOrder.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="收货人">{currentOrder.receive_name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentOrder.receive_phone}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {currentOrder.receive_address}
              </Descriptions.Item>
              <Descriptions.Item label="订单备注" span={2}>
                {currentOrder.remark || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="商品总额">
                <span style={{ color: '#ff4d4f' }}>¥{currentOrder.total_amount}</span>
              </Descriptions.Item>
              <Descriptions.Item label="实付金额">
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{currentOrder.pay_amount}</span>
              </Descriptions.Item>
              <Descriptions.Item label="下单时间" span={2}>
                {new Date(currentOrder.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 12 }}>商品列表</h4>
              <List
                size="small"
                bordered
                dataSource={currentOrder.items || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
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
                      }
                      title={item.flower_name}
                      description={
                        <span>
                          单价：¥{item.price} × {item.quantity}
                        </span>
                      }
                    />
                    <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{item.amount}</span>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderManage
