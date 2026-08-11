import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@shuttle/types';
import {
  Layout as AntLayout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Grid,
  Drawer,
} from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  BookOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { Header, Content } = AntLayout;
const { useBreakpoint } = Grid;

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.USER:
        return [
          {
            key: '/user',
            icon: <DashboardOutlined />,
            label: <Link to="/user">Dashboard</Link>,
          },
          {
            key: '/user/bookings',
            icon: <BookOutlined />,
            label: <Link to="/user/bookings">My Bookings</Link>,
          },
          {
            key: '/user/bookings/new',
            icon: <PlusOutlined />,
            label: <Link to="/user/bookings/new">Request Shuttle</Link>,
          },
        ];
      case UserRole.DRIVER:
        return [
          {
            key: '/driver',
            icon: <DashboardOutlined />,
            label: <Link to="/driver">Dashboard</Link>,
          },
          {
            key: '/driver/bookings',
            icon: <BookOutlined />,
            label: <Link to="/driver/bookings">My Bookings</Link>,
          },
        ];
      case UserRole.ADMIN:
        return [
          {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Dashboard</Link>,
          },
          {
            key: '/admin/bookings',
            icon: <BookOutlined />,
            label: <Link to="/admin/bookings">Bookings</Link>,
          },
          {
            key: '/admin/drivers',
            icon: <CarOutlined />,
            label: <Link to="/admin/drivers">Drivers</Link>,
          },
          {
            key: '/admin/users',
            icon: <TeamOutlined />,
            label: <Link to="/admin/users">Users</Link>,
          },
          {
            key: '/admin/vehicles',
            icon: <CarOutlined />,
            label: <Link to="/admin/vehicles">Vehicles</Link>,
          },
          {
            key: '/admin/locations',
            icon: <EnvironmentOutlined />,
            label: <Link to="/admin/locations">Locations</Link>,
          },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const isMobile = !screens.md;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: isMobile ? '0 16px' : '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
          )}
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 'bold',
              color: '#1890ff',
            }}
          >
            🚐 Shuttle POC
          </h1>
        </div>

        {!isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0, marginLeft: 24, border: 'none' }}
          />
        )}

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Avatar icon={<UserOutlined />} />
            {!isMobile && (
              <span style={{ fontSize: '14px' }}>{user?.name}</span>
            )}
          </div>
        </Dropdown>
      </Header>

      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={() => setDrawerVisible(false)}
        />
      </Drawer>

      <Content
        style={{
          padding: isMobile ? '16px' : '24px',
          background: '#f0f2f5',
        }}
      >
        <div
          style={{
            maxWidth: user?.role === UserRole.ADMIN ? '100%' : '1200px',
            margin: '0 auto',
          }}
        >
          {children}
        </div>
      </Content>
    </AntLayout>
  );
}
