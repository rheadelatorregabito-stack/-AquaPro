import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { makeCx } from '../../lib/cx';
import * as store from '../../lib/store';
import { STATUS_LABELS } from '../../lib/constants';
import adminStyles from '../../styles/admin.module.css';
import { useToast } from '../common/Toast';
import AdminShell, { useSidebarToggle } from './AdminShell';

const cx = makeCx(adminStyles);
const STATUSES = ['pending', 'confirmed', 'delivering', 'delivered', 'cancelled'];

const NOTIFICATIONS = [
  { icon: 'fa-exclamation-triangle text-warning', text: 'Low stock alert: 5-Gallon bottles', time: '5 minutes ago', unread: true },
  { icon: 'fa-truck text-primary', text: 'Driver Roberto completed 5 deliveries', time: '15 minutes ago', unread: true },
  { icon: 'fa-user-plus text-success', text: 'New customer registered: Ana Reyes', time: '1 hour ago' },
  { icon: 'fa-clipboard-check text-info', text: 'Order #1050 marked as delivered', time: '2 hours ago' },
  { icon: 'fa-exclamation-circle text-danger', text: 'Customer complaint: Order #1048 delay', time: '3 hours ago' },
];

const WEEKLY_SALES = [
  { day: 'Mon', height: '60%', value: '₱1,800' },
  { day: 'Tue', height: '80%', value: '₱2,400' },
  { day: 'Wed', height: '55%', value: '₱1,650' },
  { day: 'Thu', height: '90%', value: '₱2,700' },
  { day: 'Fri', height: '70%', value: '₱2,100' },
  { day: 'Today', height: '82%', value: '₱2,450', highlight: true },
];

const TOP_CUSTOMERS = [
  { name: 'Juan Dela Cruz', barangay: 'Brgy. Acacia', orders: 12, amount: '₱1,080' },
  { name: 'Maria Santos', barangay: 'Brgy. Baybay', orders: 10, amount: '₱950' },
  { name: 'Jose Garcia', barangay: 'Brgy. Cervantes', orders: 8, amount: '₱720' },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <div className={cx('notification-bell')} onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}>
      <i className={cx('fas fa-bell')}></i>
      <span className={cx('notification-badge')}>5</span>
      <div className={cx('notification-dropdown', open && 'show')} onClick={(e) => e.stopPropagation()}>
        <div className={cx('notification-header')}>
          <h4>Notifications</h4>
          <a href="#" onClick={(e) => e.preventDefault()}>Mark all read</a>
        </div>
        {NOTIFICATIONS.map((n) => (
          <div className={cx('notification-item', n.unread && 'unread')} key={n.text}>
            <i className={cx('fas', n.icon)}></i>
            <div>
              <p>{n.text}</p>
              <small>{n.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardContent() {
  const navigate = useNavigate();
  const showToast = useToast();
  const toggleSidebar = useSidebarToggle();
  const now = useClock();
  const [query, setQuery] = useState('');
  const orders = store.useStoreData(store.getOrders);
  const users = store.useStoreData(store.getUsers);
  const inventory = store.useStoreData(store.getInventory);

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.date === today);
  const pending = orders.filter((o) => ['pending', 'confirmed', 'delivering'].includes(o.status)).length;
  const sales = todayOrders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total), 0);
  const drivers = users.filter((u) => u.role === 'driver' && u.active !== false).length;
  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length]));

  const recent = orders
    .slice()
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5)
    .filter((o) => {
      const text = `#${o.id} ${o.customer} ${o.barangay} ${o.items.map((i) => `${i.quantity} x ${i.name}`).join(', ')} ${o.status}`;
      return text.toLowerCase().includes(query.toLowerCase());
    });

  function viewOrder(order) {
    window.alert(`Order #${order.id}\n${order.customer}\n${order.address}\nTotal: ₱${Number(order.total).toFixed(2)}\nStatus: ${order.status}`);
  }

  function updateStatus(order) {
    const status = window.prompt('Set order status: pending, confirmed, delivering, delivered, cancelled', order.status);
    if (status === null) return;
    if (STATUSES.includes(status.toLowerCase())) store.updateOrder(order.id, { status: status.toLowerCase() });
    else showToast('Choose a valid order status.', 'error');
  }

  const stats = [
    { icon: 'fa-shopping-bag', color: 'blue', value: todayOrders.length, label: "Today's Orders", change: '+12% vs yesterday', tone: 'positive' },
    { icon: 'fa-clock', color: 'orange', value: pending, label: 'Pending Deliveries', change: '+5 urgent', tone: 'negative' },
    { icon: 'fa-peso-sign', color: 'green', value: `₱${sales.toFixed(2)}`, label: 'Total Sales Today', change: '+8% vs yesterday', tone: 'positive' },
    { icon: 'fa-id-card', color: 'blue', value: drivers, label: 'Active Drivers', change: '1 off duty', tone: 'neutral' },
    { icon: 'fa-exclamation-triangle', color: 'red', value: inventory.filter((i) => i.status === 'in-stock').length, label: 'Low Stock Alert', change: 'Restock needed', tone: 'negative' },
  ];

  return (
    <>
      {/* Header */}
      <header className={cx('admin-header')}>
        <div className={cx('header-left')}>
          <div className={cx('mobile-menu-btn')} onClick={toggleSidebar} role="button" aria-label="Toggle menu">
            <i className={cx('fas fa-bars')}></i>
          </div>
          <div>
            <h1>Admin Dashboard</h1>
            <p className={cx('date-time')}>
              {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className={cx('header-center')}>
          <div className={cx('search-bar')}>
            <i className={cx('fas fa-search')}></i>
            <input type="text" placeholder="Search orders, customers, drivers..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className={cx('header-right')}>
          <NotificationBell />
          <div className={cx('user-avatar admin-avatar')} title="Maria Santos - Admin">
            <span>MS</span>
          </div>
        </div>
      </header>

      <div className={cx('admin-dashboard')}>
        {/* Quick Action Buttons */}
        <div className={cx('quick-actions')}>
          <button type="button" className={cx('btn btn-primary')} onClick={() => navigate('/admin/orders')}>
            <i className={cx('fas fa-plus')}></i> New Order
          </button>
          <button type="button" className={cx('btn btn-outline')} onClick={() => navigate('/admin/delivery')}>
            <i className={cx('fas fa-truck')}></i> Assign Deliveries
          </button>
          <button type="button" className={cx('btn btn-outline')} onClick={() => navigate('/admin/inventory')}>
            <i className={cx('fas fa-box')}></i> Log Inventory
          </button>
          <button type="button" className={cx('btn btn-outline')} onClick={() => navigate('/admin/reports')}>
            <i className={cx('fas fa-download')}></i> Generate Report
          </button>
        </div>

        {/* Stat Cards */}
        <div className={cx('stat-cards')}>
          {stats.map((s) => (
            <div className={cx('stat-card')} key={s.label}>
              <div className={cx('stat-icon', s.color)}>
                <i className={cx('fas', s.icon)}></i>
              </div>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{s.value}</span>
                <span className={cx('stat-label')}>{s.label}</span>
              </div>
              <span className={cx('stat-change', s.tone)}>{s.change}</span>
            </div>
          ))}
        </div>

        <div className={cx('dashboard-row')}>
          {/* Recent Orders Table */}
          <div className={cx('card recent-orders-card')}>
            <div className={cx('card-header')}>
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className={cx('view-all')}>
                View All Orders <i className={cx('fas fa-arrow-right')}></i>
              </Link>
            </div>
            <div className={cx('table-container')}>
              <table className={cx('data-table')}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Address</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((order) => (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>
                      <td>{order.customer}</td>
                      <td>{order.barangay}</td>
                      <td>{order.items.map((i) => `${i.quantity} x ${i.name}`).join(', ')}</td>
                      <td>₱{Number(order.total).toFixed(2)}</td>
                      <td><span className={cx('status-badge', `status-${order.status}`)}>{STATUS_LABELS[order.status] || order.status}</span></td>
                      <td>
                        <div className={cx('action-btns')}>
                          <button type="button" className={cx('btn btn-sm btn-primary')} onClick={() => viewOrder(order)}>View</button>
                          <button type="button" className={cx('btn btn-sm btn-outline')} onClick={() => updateStatus(order)}>Update</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Charts & Quick Info */}
          <div className={cx('right-column')}>
            <div className={cx('card sales-chart-card')}>
              <div className={cx('card-header')}>
                <h3>Weekly Sales Trend</h3>
                <select className={cx('chart-period')}>
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className={cx('chart-container')}>
                <div className={cx('bar-chart')}>
                  {WEEKLY_SALES.map((bar) => (
                    <div className={cx('bar-group', bar.highlight && 'highlight')} key={bar.day}>
                      <div className={cx('bar')} style={{ height: bar.height }}>
                        <span className={cx('bar-value')}>{bar.value}</span>
                      </div>
                      <span className={cx('bar-label')}>{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={cx('card top-customers-card')}>
              <div className={cx('card-header')}>
                <h3>Top Customers This Month</h3>
                <Link to="/admin/customers" className={cx('view-all')}>View All</Link>
              </div>
              <div className={cx('card-body')}>
                {TOP_CUSTOMERS.map((c, i) => (
                  <div className={cx('top-customer-item')} key={c.name}>
                    <div className={cx('customer-rank')}>{i + 1}</div>
                    <div className={cx('customer-info')}>
                      <strong>{c.name}</strong>
                      <span>{c.barangay}</span>
                    </div>
                    <div className={cx('customer-stats')}>
                      <span>{c.orders} orders</span>
                      <span className={cx('amount')}>{c.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Status Overview */}
        <div className={cx('card delivery-overview-card')}>
          <div className={cx('card-header')}>
            <h3>Today's Delivery Status Overview</h3>
          </div>
          <div className={cx('card-body')}>
            <div className={cx('delivery-status-grid')}>
              {STATUSES.map((s) => (
                <div className={cx('delivery-status-item')} key={s}>
                  <div className={cx('status-circle', s)}>{statusCounts[s]}</div>
                  <span>{STATUS_LABELS[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminShell cx={cx}>
      <DashboardContent />
    </AdminShell>
  );
}
