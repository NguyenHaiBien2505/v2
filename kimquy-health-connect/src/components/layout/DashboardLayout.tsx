import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconType } from 'react-icons';
import Header from './Header';
import styles from './DashboardLayout.module.css';

export interface SidebarItem {
  path: string;
  label: string;
  icon: IconType;
  badge?: number;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

interface Props {
  sections: SidebarSection[];
  children: ReactNode;
}

const DashboardLayout = ({ sections, children }: Props) => {
  const location = useLocation();

  return (
    <>
      <Header />
      <aside className={styles.sidebar}>
        {sections.map((section) => (
          <div key={section.label}>
            <div className={styles.sectionLabel}>{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                >
                  <Icon />
                  {item.label}
                  {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </>
  );
};

export default DashboardLayout;
