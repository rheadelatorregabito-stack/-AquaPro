import { useState } from 'react'
import './App.css'

const SAMPLE_ORDERS = [
  {
    id: 1005,
    customer: 'Juan Dela Cruz',
    date: '2026-10-23',
    status: 'delivering',
    items: [{ name: '5-Gallon Bottle', quantity: 2 }],
    total: 90,
  },
  {
    id: 1004,
    customer: 'Juan Dela Cruz',
    date: '2026-10-22',
    status: 'confirmed',
    items: [{ name: 'Round Container', quantity: 3 }],
    total: 110,
  },
]

const STATUSES = ['all', 'pending', 'confirmed', 'delivering', 'delivered']

function getOrders() {
  try {
    const saved = localStorage.getItem('aquapro_orders')
    if (saved) return JSON.parse(saved)
  } catch (error) {
    console.error('Could not read orders', error)
  }
  return SAMPLE_ORDERS
}

function OrderCard({ order }) {
  return (
    <div className="card">
      <div className="card-top">
        <strong>Order #{order.id}</strong>
        <span className={'status ' + order.status}>{order.status}</span>
      </div>
      <p>
        {order.customer} - {order.date}
      </p>
      <p>
        {order.items.map((item) => item.quantity + 'x ' + item.name).join(', ')}
      </p>
      <p className="total">Total: ₱{order.total}</p>
    </div>
  )
}

function App() {
  const [filter, setFilter] = useState('all')
  const [orders] = useState(getOrders)

  const shown =
    filter === 'all'
      ? orders
      : orders.filter((order) => order.status === filter)

  return (
    <div className="wrap">
      <h1>AquaPro Orders</h1>

      <div className="filters">
        {STATUSES.map((status) => (
          <button
            key={status}
            className={filter === status ? 'active' : ''}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <p>Showing {shown.length} order(s)</p>

      {shown.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

export default App