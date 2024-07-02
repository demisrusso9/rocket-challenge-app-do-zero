import { format } from 'date-fns';
import Link from 'next/link';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  const [postList, setPostList] = useState(results);
  const [active, setActive] = useState<string | null>(next_page);

  async function getNewPosts() {
    try {
      const response = await fetch(`${next_page}`).then(res => res.json());
      const postData = await response.results;

      setActive(response.next_page);

      const posts = postData.map(post => {
        return {
          uid: post.uid,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            { locale: ptBR }
          ),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        };
      });

      setPostList(state => [...state, ...posts]);
    } catch (err) {
      console.log(`Erro: ${err}`);
    }
  }

  return (
    <div className={commonStyles.container}>
      {postList.map(post => (
        <article className={styles.post} key={post.uid}>
          <Link href={`/post/${post.uid}`}>
            <span>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>

              <div className={styles.postInfo}>
                <time>
                  <FiCalendar size={20} />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>

                <span>
                  <FiUser size={20} />
                  {post.data.author}
                </span>
              </div>
            </span>
          </Link>
        </article>
      ))}

      {active && (
        <button
          type="button"
          onClick={getNewPosts}
          className={styles.loadMorePosts}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    page: 1,
    pageSize: 2,
  });

  const posts = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(result => {
      return {
        uid: result.uid,
        first_publication_date: result.first_publication_date,
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
