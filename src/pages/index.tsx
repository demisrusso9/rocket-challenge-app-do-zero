import { format } from 'date-fns';
import Link from 'next/link';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

format(new Date(), 'dd MMM yyyy', {
  locale: ptBR,
});

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, results } = postsPagination;

  return (
    <div className={commonStyles.container}>
      <main className={styles.content}>
        {results.map(post => (
          <article className={styles.post} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                <div className={styles.postInfo}>
                  <time>
                    <FiCalendar size={20} />
                    {post.first_publication_date}
                  </time>

                  <span>
                    <FiUser size={20} />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          </article>
        ))}
      </main>

      {/* {next_page && (
        <button type="button" className={styles.loadMorePosts}>
          Carregar mais posts
        </button>
      )} */}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    // page: 1,
    // pageSize: 2,
  });

  const posts = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(result => {
      return {
        uid: result.uid,
        first_publication_date: format(
          new Date(result.first_publication_date),
          'dd MMM yyyy',
          { locale: ptBR }
        ),
        data: {
          title: result.data.title,
          subtitle: result.data.subtitle,
          author: result.data.author,
        },
      };
    }),
  };

  return {
    props: {
      postsPagination: {
        next_page: posts.next_page,
        results: posts.results,
      },
    },
  };
};
