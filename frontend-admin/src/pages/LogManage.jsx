import React, { useEffect, useState } from 'react'
import {
  Table,
  Card,
  Button,
  Tag,
  Input,
} from 'antd'
import {
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { logApi } from '../services/api'

const { Search } = Input

const TypeMap = {
  'login': { text: '登录', color: 'blue' },
  'logout': { text: '登出', color: 'default' },
  'create': { text: '创建', color: 'green' },
  'update': { text: '修改', color: 'orange' },
  'delete': { text: '删除', color: 'red' },
  'other': { text: '其他', color: 'default' },
}

function LogManage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async (page = 1, pageSize = 10, keyword = '') => {
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (keyword) {
        params.keyword = keyword
      }
      const res = await logApi.getList(params)
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

  const handleSearch = (value) => {
    setSearchText(value)
    fetchData(1, pagination.pageSize, value)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '操作类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const info = TypeMap[type] || TypeMap['other']
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (val) => val || '-',
    },
    {
      title: '操作内容',
      dataIndex: 'action',
      key: 'action',
      ellipsis: true,
      render: (val) => val || '-',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
      render: (val) => val || '-',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
      render: (val) => val || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time) => new Date(time).toLocaleString(),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          日志管理
        </h2>
        <p style={{ margin: 0, color: '#999' }}>查看系统操作日志</p>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <Search
            placeholder="搜索操作内容、操作人"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
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
            onChange: (page, pageSize) => fetchData(page, pageSize, searchText),
          }}
        />
      </Card>
    </div>
  )
}

export default LogManage
