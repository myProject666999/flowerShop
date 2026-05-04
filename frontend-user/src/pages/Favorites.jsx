import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  List,
  Button,
  Empty,
  message,
  Tag,
} from 'antd'
import {
  HeartOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { favoriteApi, cartApi } from '../services/api'
import useStore from '../store/useStore'

function Favorites() {
  const navigate = useNavigate()
  const { cartCount, updateCartCount } = useStore()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const res = await favoriteApi.getList()
      setFavorites(res.data?.list || [])
    } catch (error) {
      console.error('获取收藏列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (flowerId) => {
    try {
      await favoriteApi.toggle(flowerId)
      message.success('已取消收藏')
      fetchFavorites()
    } catch (error) {
      console.error('取消收藏失败', error)
    }
  }

  const handleAddToCart = async (item) => {
    try {
      await cartApi.create({
        flower_id: item.flower_id,
        quantity: 1,
      })
      message.success('已加入购物车')
      updateCartCount(cartCount + 1)
    } catch (error) {
      console.error('加入购物车失败', error)
    }
  }

  const renderGrid = () => {
    if (favorites.length === 0) {
      return (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Empty
            image={<HeartOutlined style={{ fontSize: 60, color: '#ccc' }} />}
            description={<span style={{ color: '#999' }}>暂无收藏商品</span>}
          >
            <Button type="primary" onClick={() => navigate('/flowers')}>
              去逛逛
            </Button>
          </Empty>
        </div>
      )
    }

    return (
      <List
        grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
        dataSource={favorites}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              cover={
                <div
                  style={{
                    height: 200,
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 80,
                  }}
                  onClick={() => navigate(`/flowers/${item.flower_id}`)}
                >
                  🌸
                </div>
              }
              actions={[
                <Button
                  key="cart"
                  type="link"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleAddToCart(item)}
                >
                  加入购物车
                </Button>,
                <Button
                  key="fav"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFavorite(item.flower_id)}
                >
                  取消收藏
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/flowers/${item.flower_id}`)}
                  >
                    {item.flower?.name || '商品名称'}
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      {item.flower?.status === 1 && (
                        <Tag color="green" style={{ margin: 0 }}>
                          在售
                        </Tag>
                      )}
                      {item.flower?.is_recommended && (
                        <Tag color="red" style={{ marginLeft: 4 }}>
                          推荐
                        </Tag>
                      )}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ff4d4f' }}>
                      ¥{item.flower?.price || 0}
                    </div>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    )
  }

  return (
    <div style={{ padding: '20px 50px' }}>
      <Card
        title={
          <div>
            <HeartOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
            我的收藏
            <span style={{ marginLeft: 8, color: '#999', fontSize: 14, fontWeight: 'normal' }}>
              共 {favorites.length} 件商品
            </span>
          </div>
        }
      >
        {renderGrid()}
      </Card>
    </div>
  )
}

export default Favorites
