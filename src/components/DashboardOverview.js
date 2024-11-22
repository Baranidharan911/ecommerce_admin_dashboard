import React, { useState } from 'react';
import '../styles/DashboardOverview.css';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CustomDashboard = () => {
  const [selectedReport, setSelectedReport] = useState('Customers');

  const handleReportClick = (report) => {
    setSelectedReport(report);
  };

  const data1 = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [50, 60, 70, 90, 100, 110, 130],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Cost',
        data: [30, 40, 50, 70, 80, 90, 100],
        borderColor: '#00c853',
        backgroundColor: 'rgba(0, 200, 83, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const data2 = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sessions',
        data: [40, 35, 60, 50, 45, 55, 50],
        borderColor: '#ff5252',
        fill: false,
      },
    ],
  };

  const data3 = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [50, 60, 55, 70, 80, 95, 110],
        borderColor: '#00c853',
        fill: false,
      },
    ],
  };

  const data4 = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Profit',
        data: [10, 20, 30, 40, 50, 60, 70],
        borderColor: '#00c853',
        fill: false,
      },
    ],
  };

  const data5 = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Discounted Amount',
        data: [15, 20, 25, 30, 20, 25, 20],
        borderColor: '#ff5252',
        fill: false,
      },
    ],
  };

  const reportsData = {
    Customers: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Customers',
          data: [10, 15, 20, 25, 20, 30, 40],
          borderColor: '#007bff',
          fill: false,
        },
      ],
    },
    'Total Products': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Total Products',
          data: [30, 35, 25, 45, 30, 50, 60],
          borderColor: '#007bff',
          fill: false,
        },
      ],
    },
    'Stock Products': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Stock Products',
          data: [20, 25, 20, 35, 25, 40, 50],
          borderColor: '#007bff',
          fill: false,
        },
      ],
    },
    'Out of Stock': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Out of Stock',
          data: [5, 10, 15, 10, 15, 20, 25],
          borderColor: '#007bff',
          fill: false,
        },
      ],
    },
    Revenue: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Revenue',
          data: [50, 55, 45, 60, 50, 65, 70],
          borderColor: '#007bff',
          fill: false,
        },
      ],
    },
  };

  const usersData = {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Users per minute',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
        backgroundColor: '#007bff',
      },
    ],
  };

  const salesByStateData = [
    { state: 'Karnataka', value: '30k', percentage: '25.8%', increase: true },
    { state: 'Tamil Nadu', value: '26k', percentage: '16.2%', increase: false },
    { state: 'Kerala', value: '22k', percentage: '12.3%', increase: true },
    { state: 'Maharashtra', value: '17k', percentage: '11.9%', increase: false },
  ];

  const pieData = {
    labels: ['Business Cards', 'Photo Frames', 'Photo Gifts'],
    datasets: [
      {
        data: [4567, 3167, 1845],
        backgroundColor: ['#007bff', '#00c853', '#ff5252'],
        hoverBackgroundColor: ['#0056b3', '#009624', '#ff1744'],
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="custom-overview">
      <h1 className="custom-dashboard-title">Dashboard</h1>
      <div className="custom-container custom-sales-costs">
        <h2>Total Sales & Costs</h2>
        <div className="custom-sub-text">Last 7 days</div>
        <div className="custom-sales-costs-values">
          <div className="custom-sales-value">₹350K</div>
          <div className="custom-cost-value">₹235K</div>
        </div>
        <div className="custom-chart-container">
          <Line data={data1} options={options} />
        </div>
        <div className="custom-percentage-text">↑ 8.56K vs last 7 days</div>
      </div>

      <div className="custom-container custom-sessions">
        <h2>Sessions</h2>
        <div className="custom-sub-text">Last 7 days</div>
        <div className="custom-session-value">16.5K</div>
        <div className="custom-chart-container">
          <Line data={data2} options={options} />
        </div>
        <div className="custom-percentage-text custom-percentage-text-down">↓ 3% vs last 7 days</div>
      </div>

      <div className="custom-container custom-orders">
        <h2>Total Orders</h2>
        <div className="custom-sub-text">Last 7 days</div>
        <div className="custom-order-value">25.7K</div>
        <div className="custom-chart-container">
          <Line data={data3} options={options} />
        </div>
        <div className="custom-percentage-text">↑ 6% vs last 7 days</div>
      </div>

      <div className="custom-container custom-profit">
        <h2>Total Profit</h2>
        <div className="custom-sub-text">Last 7 days</div>
        <div className="custom-profit-value">50K</div>
        <div className="custom-chart-container">
          <Line data={data4} options={options} />
        </div>
        <div className="custom-percentage-text">↑ 12% vs last 7 days</div>
      </div>

      <div className="custom-container custom-discount">
        <h2>Discounted Amount</h2>
        <div className="custom-sub-text">Last 7 days</div>
        <div className="custom-discount-value">12K</div>
        <div className="custom-chart-container">
          <Line data={data5} options={options} />
        </div>
        <div className="custom-percentage-text custom-percentage-text-down">↓ 2% vs last 7 days</div>
      </div>

      {/* Reports Section */}
      <div className="custom-container custom-reports">
        <h2>Reports</h2>
        <div className="custom-sub-text">Last 7 Days</div>
        <div className="custom-report-tabs">
          {Object.keys(reportsData).map((report) => (
            <div
              key={report}
              className={`custom-tab ${selectedReport === report ? 'custom-tab-active' : ''}`}
              onClick={() => handleReportClick(report)}
            >
              <div className="custom-tab-value">{`${reportsData[report].datasets[0].data[6]}k`}</div>
              <div className="custom-tab-name">{report}</div>
            </div>
          ))}
        </div>
        <div className="custom-chart-container">
          <Line data={reportsData[selectedReport]} options={options} />
        </div>
      </div>

      {/* Users Section */}
      <div className="custom-container custom-users">
        <h2>Users in last 30 minutes</h2>
        <div className="custom-users-value">16.5K</div>
        <div className="custom-chart-container">
          <Bar data={usersData} options={options} />
        </div>
        <h2>Sales by State</h2>
        <ul className="custom-sales-by-country">
          {salesByStateData.map((item, index) => (
            <li key={index}>
              <div className="custom-country-name">{item.state}</div>
              <div className="custom-country-sales">{item.value}</div>
              <div className="custom-country-bar">
                <div className="custom-bar" style={{ width: item.percentage, backgroundColor: item.increase ? '#00c853' : '#ff5252' }}></div>
              </div>
              <div
                className="custom-country-percentage"
                style={{ color: item.increase ? '#00c853' : '#ff5252' }}
              >
                {item.increase ? `↑` : `↓`} {item.percentage}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Selling Category Section */}
      <div className="custom-container custom-top-selling-category">
        <h2>Top Selling Category</h2>
        <div className="custom-sub-text">Total 10.4k Visitors</div>
        <div className="custom-chart-container custom-pie-chart">
          <Pie
            data={pieData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Last Transactions Section */}
      <div className="custom-container custom-last-transactions">
        <h2>Last Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Issued Date</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i}>
                <td>#5089</td>
                <td>31 March 2023</td>
                <td>₹1200</td>
                <td>
                  <button onClick={() => alert('Viewing details')} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
                    View Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Best Selling Products Section */}
      <div className="custom-container custom-best-selling-products">
        <h2>Best Selling Products</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Total Order</th>
              <th>Status</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Business Cards</td>
              <td>506</td>
              <td><span className="custom-status custom-in-stock">Stock</span></td>
              <td>₹99.29</td>
            </tr>
            <tr>
              <td>Employee Joining Kits</td>
              <td>506</td>
              <td><span className="custom-status custom-in-stock">Stock</span></td>
              <td>₹672.40</td>
            </tr>
            <tr>
              <td>Backpacks</td>
              <td>506</td>
              <td><span className="custom-status custom-in-stock">Stock</span></td>
              <td>₹999.90</td>
            </tr>
            <tr>
              <td>Diaries</td>
              <td>506</td>
              <td><span className="custom-status custom-out-of-stock">Out</span></td>
              <td>₹249.99</td>
            </tr>
            <tr>
              <td>Keychains</td>
              <td>506</td>
              <td><span className="custom-status custom-in-stock">Stock</span></td>
              <td>₹79.40</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Trending Products Section */}
      <div className="custom-container custom-trending-products">
        <h2>Trending Products</h2>
        <div className="custom-sub-text">Total 10.4k Visitors</div>
        <ul className="custom-trending-products-list">
          <li>
            <span className="custom-product-name">Backpacks</span>
            <span className="custom-product-item">Item: #FXZ-4567</span>
            <span className="custom-product-price">₹999.29</span>
          </li>
          <li>
            <span className="custom-product-name">Notebooks</span>
            <span className="custom-product-item">Item: #FXZ-1234</span>
            <span className="custom-product-price">₹72.40</span>
          </li>
          <li>
            <span className="custom-product-name">Sipper Bottles</span>
            <span className="custom-product-item">Item: #FXZ-2345</span>
            <span className="custom-product-price">₹99.90</span>
          </li>
          <li>
            <span className="custom-product-name">Diaries</span>
            <span className="custom-product-item">Item: #FXZ-3456</span>
            <span className="custom-product-price">₹249.99</span>
          </li>
          <li>
            <span className="custom-product-name">Keychains</span>
            <span className="custom-product-item">Item: #FXZ-7890</span>
            <span className="custom-product-price">₹79.40</span>
          </li>
          <li>
            <span className="custom-product-name">Employee Joining Kits</span>
            <span className="custom-product-item">Item: #FXZ-9876</span>
            <span className="custom-product-price">₹129.48</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CustomDashboard;
