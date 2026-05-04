import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Carousel, Row, Col, Card, Tag, Button, Empty, message } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons'
import { flowerApi, cartApi, favoriteApi } from '../services/api'
import useStore from '../store/useStore'

const { Meta } = Card

function Home() {
  const navigate = useNavigate()
  const { user, setCartCount } = useStore()
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [hotFlowers, setHotFlowers] = useState([])
  const [recommendFlowers, setRecommendFlowers] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    fetchBanners()
    fetchCategories()
    fetchHotFlowers()
    fetchRecommendFlowers()
    fetchAnnouncements()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await flowerApi.getBanners()
      setBanners(res.data || [])
    } catch (error) {
      console.error('获取轮播图失败', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await flowerApi.getCategories()
      setCategories(res.data || [])
    } catch (error) {
      console.error('获取分类失败', error)
    }
  }

  const fetchHotFlowers = async () => {
    try {
      const res = await flowerApi.getList({ is_hot: 1, page_size: 8 })
      setHotFlowers(res.data?.list || [])
    } catch (error) {
      console.error('获取热销鲜花失败', error)
    }
  }

  const fetchRecommendFlowers = async () => {
    try {
      const res = await flowerApi.getList({ is_recommend: 1, page_size: 8 })
      setRecommendFlowers(res.data?.list || [])
    } catch (error) {
      console.error('获取推荐鲜花失败', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await flowerApi.getAnnouncements()
      setAnnouncements(res.data || [])
    } catch (error) {
      console.error('获取公告失败', error)
    }
  }

  const handleAddCart = async (flower, e) => {
    e.stopPropagation()
    if (!user) {
      message.info('请先登录')
      navigate('/login')
      return
    }
    try {
      await cartApi.add({ flower_id: flower.id, quantity: 1 })
      message.success('已加入购物车')
      const cartRes = await cartApi.getList()
      setCartCount(cartRes.data?.list?.length || 0)
    } catch (error) {
      console.error('添加购物车失败', error)
    }
  }

  const handleToggleFavorite = async (flower, e) => {
    e.stopPropagation()
    if (!user) {
      message.info('请先登录')
      navigate('/login')
      return
    }
    try {
      await favoriteApi.toggle({ flower_id: flower.id })
      message.success('操作成功')
    } catch (error) {
      console.error('收藏操作失败', error)
    }
  }

  const flowerCard = (flower) => (
    <Card
      hoverable
      className="card-hover"
      style={{ width: '100%' }}
      cover={
        <div
          style={{
            height: 200,
            background: `linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/flowers/${flower.id}`)}
        >
          🌸
        </div>
      }
      actions={[
        <HeartOutlined key="favorite" onClick={(e) => handleToggleFavorite(flower, e)} />,
        <ShoppingCartOutlined key="cart" onClick={(e) => handleAddCart(flower, e)} />,
        <EyeOutlined key="view" onClick={() => navigate(`/flowers/${flower.id}`)} />,
      ]}
    >
      <Meta
        title={
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {flower.name}
          </div>
        }
        description={
          <div>
            <div className="price-tag">{flower.price}</div>
            {flower.is_hot && <Tag color="red">热销</Tag>}
            {flower.is_recommend && <Tag color="gold">推荐</Tag>}
            {flower.sales > 0 && <span style={{ color: '#999', fontSize: 12 }}>已售{flower.sales}</span>}
          </div>
        }
      />
    </Card>
  )

  return (
    <div style={{ background: '#f5f5f5' }}>
      {banners.length > 0 ? (
        <Carousel autoplay effect="fade">
          {banners.map((banner) => (
            <div key={banner.id}>
              <div
                style={{
                  height: 400,
                  background: `linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#fff',
                  fontSize: 40,
                }}
              >
                <div style={{ fontSize: 80, marginBottom: 20 }}>🌸</div>
                <div>{banner.title || '在线花店'}</div>
              </div>
            </div>
          ))}
        </Carousel>
      ) : (
        <div
          style={{
            height: 400,
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🌸</div>
          <div style={{ fontSize: 32, fontWeight: 'bold' }}>在线花店</div>
          <div style={{ fontSize: 16, marginTop: 10, opacity: 0.8 }}>
            为您精选优质鲜花，传递美好祝福
          </div>
        </div>
      )}

      {announcements.length > 0 && (
        <div style={{ background: '#fff7e6', padding: '12px 50px' }}>
          <span style={{ color: '#ff4d4f', marginRight: 10 }}>📢 公告：</span>
          <span style={{ color: '#fa8c16' }}>{announcements[0]?.title}</span>
        </div>
      )}

      <div style={{ padding: '20px 50px' }}>
        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 8,
            marginBottom: 30,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>
            鲜花分类
          </div>
          <Row gutter={[16, 16]}>
            {categories.map((category) => (
              <Col span={3} key={category.id}>
                <Link to={`/flowers?category_id=${category.id}`}>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px 10px',
                      background: '#fafafa',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    className="card-hover"
                  >
                    <div style={{ fontSize: 40, marginBottom: 10 }}>
                      {category.icon || '🌷'}
                    </div>
                    <div>{category.name}</div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </div>

        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 8,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 'bold', borderLeft: '4px solid #ff4d4f', paddingLeft: 10 }}>
              🔥 热销鲜花
            </div>
            <Link to="/flowers?is_hot=1">
              <Button type="link">查看更多</Button>
            </Link>
          </div>
          {hotFlowers.length > 0 ? (
            <Row gutter={[16, 16]}>
              {hotFlowers.map((flower) => (
                <Col span={6} key={flower.id}>
                  {flowerCard(flower)}
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无热销鲜花" />
          )}
        </div>

        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 'bold', borderLeft: '4px solid #ff4d4f', paddingLeft: 10 }}>
              ⭐ 为你推荐
            </div>
            <Link to="/flowers?is_recommend=1">
              <Button type="link">查看更多</Button>
            </Link>
          </div>
          {recommendFlowers.length > 0 ? (
            <Row gutter={[16, 16]}>
              {recommendFlowers.map((flower) => (
                <Col span={6} key={flower.id}>
                  {flowerCard(flower)}
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无推荐鲜花" />
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
