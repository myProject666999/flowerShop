import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  InputNumber,
  Checkbox,
  Empty,
  message,
  Card,
  Modal,
  Form,
  Select,
} from 'antd'
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { cartApi, orderApi, addressApi } from '../services/api'
import useStore from '../store/useStore'

const { Option } = Select

function Cart() {
  const navigate = useNavigate()
  const { setCartCount } = useStore()

  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [addresses, setAddresses] = useState([])
  const [addressModalVisible, setAddressModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCart()
    fetchAddresses()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const res = await cartApi.getList()
      setCartItems(res.data?.list || [])
      setCartCount(res.data?.list?.length || 0)
    } catch (error) {
      console.error('获取购物车失败', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const res = await addressApi.getList()
      setAddresses(res.data || [])
    } catch (error) {
      console.error('获取地址失败', error)
    }
  }

  const handleQuantityChange = async (id, quantity) => {
    try {
      await cartApi.update(id, { quantity })
      fetchCart()
    } catch (error) {
      console.error('更新数量失败', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await cartApi.delete(id)
      message.success('已删除')
      fetchCart()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  const getTotalPrice = () => {
    return cartItems
      .filter((item) => selectedRowKeys.includes(item.id))
      .reduce((sum, item) => {
        return sum + (item.flower?.price || 0) * item.quantity
      }, 0)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  const handleCheckout = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要结算的商品')
      return
    }
    if (addresses.length === 0) {
      message.warning('请先添加收货地址')
      navigate('/address')
      return
    }
    setAddressModalVisible(true)
  }

  const handleCreateOrder = async (values) => {
    try {
      const selectedAddress = addresses.find((a) => a.id === values.address_id)
      const res = await orderApi.create({
        cart_ids: selectedRowKeys,
        address: `${selectedAddress.province || ''}${selectedAddress.city || ''}${selectedAddress.district || ''}${selectedAddress.detail}`,
        receive_name: selectedAddress.name,
        receive_phone: selectedAddress.phone,
      })
      message.success('订单创建成功')
      setAddressModalVisible(false)
      setSelectedRowKeys([])
      fetchCart()
      navigate(`/orders/${res.data?.order_id}`)
    } catch (error) {
      console.error('创建订单失败', error)
    }
  }

  const columns = [
    {
      title: '商品',
      key: 'flower',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/flowers/${record.flower_id}`)}
          >
            🌸
          </div>
          <div>
            <div
              style={{
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/flowers/${record.flower_id}`)}
            >
              {record.flower?.name}
            </div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
              ID: {record.flower_id}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: ['flower', 'price'],
      key: 'price',
      render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price}</span>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.flower?.stock || 999}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_, record) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 16 }}>
          ¥{(record.flower?.price || 0) * record.quantity}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: '20px 50px' }}>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0 }}>
            <ShoppingCartOutlined style={{ marginRight: 10 }} />
            购物车 ({cartItems.length}件)
          </h2>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            继续购物
          </Button>
        </div>

        {cartItems.length > 0 ? (
          <>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={cartItems}
              loading={loading}
              rowSelection={rowSelection}
              pagination={false}
            />

            <div
              style={{
                marginTop: 20,
                padding: 20,
                background: '#fafafa',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ marginRight: 20 }}>
                  已选择 <strong style={{ color: '#ff4d4f' }}>{selectedRowKeys.length}</strong> 件商品
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div>
                  <span style={{ fontSize: 14, color: '#666' }}>合计：</span>
                  <span
                    style={{
                      fontSize: 24,
                      color: '#ff4d4f',
                      fontWeight: 'bold',
                    }}
                  >
                    ¥{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleCheckout}
                  disabled={selectedRowKeys.length === 0}
                >
                  结算
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#999' }}>购物车是空的</span>
              }
            >
              <Button type="primary" onClick={() => navigate('/flowers')}>
                去逛逛
              </Button>
            </Empty>
          </div>
        )}
      </Card>

      <Modal
        title="选择收货地址"
        open={addressModalVisible}
        onCancel={() => setAddressModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateOrder}>
          <Form.Item
            name="address_id"
            rules={[{ required: true, message: '请选择收货地址' }]}
          >
            <Select placeholder="请选择收货地址">
              {addresses.map((addr) => (
                <Option key={addr.id} value={addr.id}>
                  {addr.name} {addr.phone} - {addr.province}{addr.city}{addr.district}{addr.detail}
                  {addr.is_default && <Tag color="blue">默认</Tag>}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认下单
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Cart
