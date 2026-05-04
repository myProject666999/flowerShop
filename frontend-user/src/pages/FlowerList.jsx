import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Tag,
  Input,
  Select,
  Button,
  Pagination,
  Empty,
  message,
} from 'antd'
import { ShoppingCartOutlined, HeartOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { flowerApi, cartApi, favoriteApi } from '../services/api'
import useStore from '../store/useStore'

const { Search } = Input
const { Option } = Select
const { Meta } = Card

function FlowerList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, setCartCount } = useStore()
  
  const [flowers, setFlowers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  })

  const [filters, setFilters] = useState({
    keyword: '',
    category_id: '',
    is_hot: '',
    is_recommend: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const categoryId = searchParams.get('category_id')
    const isHot = searchParams.get('is_hot')
    const isRecommend = searchParams.get('is_recommend')
    const keyword = searchParams.get('keyword')

    setFilters({
      keyword: keyword || '',
      category_id: categoryId || '',
      is_hot: isHot || '',
      is_recommend: isRecommend || '',
    })
    setPagination((prev) => ({ ...prev, current: 1 }))
  }, [searchParams])

  useEffect(() => {
    fetchFlowers()
  }, [filters, pagination.current])

  const fetchCategories = async () => {
    try {
      const res = await flowerApi.getCategories()
      setCategories(res.data || [])
    } catch (error) {
      console.error('获取分类失败', error)
    }
  }

  const fetchFlowers = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters,
      }
      
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key]
        }
      })

      const res = await flowerApi.getList(params)
      setFlowers(res.data?.list || [])
      setPagination((prev) => ({
        ...prev,
        total: res.data?.total || 0,
      }))
    } catch (error) {
      console.error('获取鲜花列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchParams({ ...Object.fromEntries(searchParams), keyword: value })
  }

  const handleFilterChange = (key, value) => {
    const newParams = { ...Object.fromEntries(searchParams), [key]: value || '' }
    if (!newParams[key]) delete newParams[key]
    setSearchParams(newParams)
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
      loading={loading}
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
    <div style={{ padding: '20px 50px' }}>
      <div
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 15 }}>
          <span style={{ fontWeight: 'bold', color: '#666' }}>分类：</span>
          <Select
            style={{ width: 150 }}
            placeholder="全部分类"
            allowClear
            value={filters.category_id || undefined}
            onChange={(value) => handleFilterChange('category_id', value)}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>

          <span style={{ fontWeight: 'bold', color: '#666' }}>筛选：</span>
          <Select
            style={{ width: 120 }}
            placeholder="全部"
            allowClear
            value={filters.is_hot || undefined}
            onChange={(value) => handleFilterChange('is_hot', value)}
          >
            <Option value="1">热销</Option>
          </Select>
          <Select
            style={{ width: 120 }}
            placeholder="全部"
            allowClear
            value={filters.is_recommend || undefined}
            onChange={(value) => handleFilterChange('is_recommend', value)}
          >
            <Option value="1">推荐</Option>
          </Select>

          <Search
            placeholder="搜索鲜花"
            style={{ width: 250 }}
            value={filters.keyword}
            onSearch={handleSearch}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
            enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
          />
        </div>
      </div>

      {flowers.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {flowers.map((flower) => (
              <Col span={6} key={flower.id}>
                {flowerCard(flower)}
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
              onChange={(page, pageSize) => {
                setPagination((prev) => ({ ...prev, current: page, pageSize }))
              }}
            />
          </div>
        </>
      ) : (
        <div
          style={{
            background: '#fff',
            padding: 50,
            borderRadius: 8,
            textAlign: 'center',
          }}
        >
          <Empty description="暂无鲜花" />
        </div>
      )}
    </div>
  )
}

export default FlowerList
