import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeCx } from '../../lib/cx';
import * as store from '../../lib/store';
import ordersStyles from '../../styles/customerOrders.module.css';
import CustomerShell from './CustomerShell';

const cx = makeCx(ordersStyles);
const AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%233b82f6'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16'%3EJD%3C/text%3E%3C/svg%3E";

/** Compact card-based order history (converted from customer/order-history.html). */
export default function SimpleOrderHistoryPage() {
  const navigate = useNavigate();
  const user = store.useStoreData(store.getCurrentUser);
  const orders = store.useStoreData(() =>
    store.getOrders()
      .filter((o) => o.email === user?.email)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
  );
  const [status, setStatus] = useState('');
  const [month, setMonth] = useState('');
  const [query, setQuery] = useState('');

  const visible = orders.filter((order) => {
    const date = new Date(`${order.date}T00:00:00`);
    const text = `Order #${order.id} ${order.status} ${date.toLocaleDateString()} ${order.items.map((i) => `${i.quantity} x ${i.name}`).join(', ')}`;
    return (
      (!status || order.status === status) &&
      (!month || String(date.getMonth() + 1) === month) &&
      text.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <CustomerShell cx={cx} active="/order-history">
      <main className={cx('main-content')}>
        <header className={cx('dashboard-header')}>
          <div className={cx('header-left')}>
            <h1>Order History</h1>
            <p>View all your past water deliveries</p>
          </div>
          <div className={cx('header-right')}>
            <div className={cx('notification-bell')}>
              <i className={cx('fas fa-bell')}></i>
              <span className={cx('notification-badge')}>2</span>
            </div>
            <div className={cx('user-avatar')}>
              <img src={AVATAR} alt="User" />
            </div>
          </div>
        </header>

        <div className={cx('order-history-container')}>
          {/* Filters */}
          <div className={cx('history-filters')}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">All Months</option>
              <option value="4">April 2024</option>
              <option value="3">March 2024</option>
              <option value="2">February 2024</option>
            </select>
            <input type="text" placeholder="Search by Order ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="button" className={cx('btn btn-outline')} onClick={() => { setStatus(''); setMonth(''); setQuery(''); }}>
              <i className={cx('fas fa-times')}></i> Clear Filters
            </button>
          </div>

          {/* Order History List */}
          <div className={cx('order-history-list')}>
            {visible.map((order) => (
              <article className={cx('card simple-history-order')} key={order.id}>
                <div className={cx('card-header')}>
                  <h3>Order #{order.id}</h3>
                  <span className={cx('status-badge')}>{order.status}</span>
                </div>
                <div className={cx('card-body')}>
                  <p>{new Date(`${order.date}T00:00:00`).toLocaleDateString()}</p>
                  <p>{order.items.map((i) => `${i.quantity} x ${i.name}`).join(', ')}</p>
                  <strong>₱{Number(order.total).toFixed(2)}</strong>
                  <button className={cx('btn btn-outline')} type="button" onClick={() => navigate(`/order?reorder=${order.id}`)}>Reorder</button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination (single page in this prototype) */}
          <div className={cx('pagination')}>
            <button type="button" className={cx('btn btn-sm')} disabled><i className={cx('fas fa-chevron-left')}></i></button>
            <button type="button" className={cx('btn btn-sm active')} disabled>1</button>
            <button type="button" className={cx('btn btn-sm')} disabled><i className={cx('fas fa-chevron-right')}></i></button>
          </div>

          {/* Empty State */}
          {visible.length === 0 && (
            <div className={cx('empty-history')}>
              <i className={cx('fas fa-inbox')}></i>
              <p>No orders found matching your filters</p>
              <button type="button" className={cx('btn btn-primary')} onClick={() => navigate('/order')}>
                <i className={cx('fas fa-shopping-cart')}></i> Place an Order
              </button>
            </div>
          )}
        </div>
      </main>
    </CustomerShell>
  );
}
