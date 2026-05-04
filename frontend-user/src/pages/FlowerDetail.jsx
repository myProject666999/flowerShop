import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Button,
  InputNumber,
  Tabs,
  Descriptions,
  Tag,
  Image,
  message,
  Empty,
} from 'antd'
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { flowerApi, cartApi, favoriteApi } from '../services/api'
import useStore from '../store/useStore'

function FlowerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, setCartCount } = useStore()

  const [flower, setFlower] = useState(null)
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (id) {
      fetchFlowerDetail()
      if (user) {
        checkFavorite()
      }
    }
  }, [id, user])

  const fetchFlowerDetail = async () => {
    setLoading(true)
    try {
      const res = await flowerApi.getDetail(id)
      setFlower(res.data?.flower)
    } catch (error) {
      console.error('获取鲜花详情失败', error)
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    try {
      const res = await favoriteApi.check({ flower_id: id })
      setIsFavorite(res.data?.is_favorite || false)
    } catch (error) {
      console.error('检查收藏状态失败', error)
    }
  }

  const handleAddCart = async () => {
    if (!user) {
      message.info('请先登录')
      navigate('/login')
      return
    }
    try {
      await cartApi.add({ flower_id: flower.id, quantity })
      message.success('已加入购物车')
      const cartRes = await cartApi.getList()
      setCartCount(cartRes.data?.list?.length || 0)
    } catch (error) {
      console.error('添加购物车失败', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      message.info('请先登录')
      navigate('/login')
      return
    }
    try {
      await favoriteApi.toggle({ flower_id: flower.id })
      setIsFavorite(!isFavorite)
      message.success(isFavorite ? '已取消收藏' : '已收藏')
    } catch (error) {
      console.error('收藏操作失败', error)
    }
  }

  const tabItems = [
    {
      key: 'detail',
      label: '商品详情',
      children: (
        <div style={{ padding: 20 }}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="商品名称">{flower?.name}</Descriptions.Item>
            <Descriptions.Item label="商品价格">
              <span style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 'bold' }}>
                ¥{flower?.price}
              </span>
              {flower?.originalPrice && flower.originalPrice > flower.price && (
                <span
                  style={{ color: '#999', textDecoration: 'line-through', marginLeft: 10 }}
                >
                  ¥{flower?.originalPrice}
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="库存数量">{flower?.stock}</Descriptions.Item>
            <Descriptions.Item label="已售数量">{flower?.sales}</Descriptions.Item>
            <Descriptions.Item label="商品材质">{flower?.material || '-'}</Descriptions.Item>
            <Descriptions.Item label="包装方式">{flower?.package || '-'}</Descriptions.Item>
            <Descriptions.Item label="适用场合">{flower?.occasion || '-'}</Descriptions.Item>
          </Descriptions>
          {flower?.description && (
            <div style={{ marginTop: 20 }}>
              <h4>商品描述</h4>
              <p style={{ color: '#666', lineHeight: 2 }}>{flower.description}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'comments',
      label: '用户评价',
      children: (
        <div style={{ padding: 20 }}>
          {flower?.comments && flower.comments.length > 0 ? (
            flower.comments.map((comment) => (
              <Card key={comment.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    {comment.is_anonymous ? '匿' : (comment.user?.nickname || comment.user?.username)?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {comment.is_anonymous ? '匿名用户' : (comment.user?.nickname || comment.user?.username)}
                    </div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ color: '#666', lineHeight: 1.8 }}>{comment.content}</div>
              </Card>
            ))
          ) : (
            <Empty description="暂无评价" />
          )}
        </div>
      ),
    },
  ]

  if (loading) {
    return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>
  }

  if (!flower) {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <Empty description="商品不存在" />
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 50px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20 }}
      >
        返回
      </Button>

      <Row gutter={24}>
        <Col span={10}>
          <Card>
            <div
              style={{
                height: 400,
                background: `linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 120,
              }}
            >
              🌸
            </div>
          </Card>
        </Col>

        <Col span={14}>
          <Card>
            <h1 style={{ fontSize: 24, marginBottom: 10 }}>{flower.name}</h1>
            
            <div style={{ marginBottom: 15 }}>
              {flower.is_hot && <Tag color="red">热销</Tag>}
              {flower.is_recommend && <Tag color="gold">推荐</Tag>}
              {flower.category?.name && <Tag color="blue">{flower.category.name}</Tag>}
            </div>

            <div
              style={{
                background: '#fff5f5',
                padding: 20,
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 14, color: '#666' }}>售价</span>
                <span style={{ color: '#ff4d4f', fontSize: 28, fontWeight: 'bold' }}>
                  ¥{flower.price}
                </span>
                {flower.originalPrice && flower.originalPrice > flower.price && (
                  <span style={{ color: '#999', textDecoration: 'line-through' }}>
                    ¥{flower.originalPrice}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 10, color: '#999' }}>
                已售 {flower.sales} 件 | 库存 {flower.stock} 件
              </div>
            </div>

            <Descriptions column={1} colon={false}>
              <Descriptions.Item label="商家">
                {flower.merchant?.shop_name || '在线花店'}
              </Descriptions.Item>
              <Descriptions.Item label="材质">
                {flower.material || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="包装">
                {flower.package || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="适用场合">
                {flower.occasion || '-'}
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 20,
              }}
            >
              <span>数量：</span>
              <InputNumber
                min={1}
                max={flower.stock}
                value={quantity}
                onChange={setQuantity}
                size="large"
              />
              <span style={{ color: '#999' }}>库存 {flower.stock} 件</span>
            </div>

            <div style={{ display: 'flex', gap: 15, marginTop: 30 }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddCart}
                style={{ width: 150 }}
              >
                加入购物车
              </Button>
              <Button
                size="large"
                icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={handleToggleFavorite}
                style={{ width: 150 }}
              >
                {isFavorite ? '已收藏' : '收藏'}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 20 }}>
        <Tabs defaultActiveKey="detail" items={tabItems} />
      </Card>
    </div>
  )
}

export default FlowerDetail
