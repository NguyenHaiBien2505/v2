import { Link, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { blogPosts } from '../data/mockData';
import styles from './BlogPage.module.css';

const BlogListPage = () => (
  <div className={styles.page}>
    <Header />
    <div className={styles.container}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Tin tức sức khỏe</h1>
      <div className={styles.list}>
        {blogPosts.map((p) => (
          <Link to={`/blog/${p.slug}`} className={styles.card} key={p.id}>
            <img src={p.thumbnailUrl} alt={p.title} className={styles.cardImg} />
            <div className={styles.cardBody}>
              <span className={styles.cardCat}>{p.category}</span>
              <div className={styles.cardTitle}>{p.title}</div>
              <div className={styles.cardDate}>{p.authorName} • {p.createdAt}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

const BlogDetailPage = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return <div className={styles.page}><Header /><div className={styles.detail}><p>Bài viết không tồn tại.</p></div></div>;

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.detail}>
        <div className={styles.breadcrumb}>
          <Link to="/blog">Tin tức</Link> / {post.title}
        </div>
        <h1 className={styles.detailTitle}>{post.title}</h1>
        <div className={styles.detailMeta}>{post.authorName} • {post.createdAt} • {post.category}</div>
        <img src={post.thumbnailUrl} alt={post.title} style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }} />
        <div className={styles.detailContent} dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      <Footer />
    </div>
  );
};

export { BlogListPage, BlogDetailPage };
