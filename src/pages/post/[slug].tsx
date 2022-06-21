import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const readingTime = post?.data.content.reduce((acc, time) => {
    const totalWords = RichText.asText(time.body).split(' ').length;
    const min = Math.ceil(totalWords / 200);

    return acc + min;
  }, 0);

  if (router.isFallback) {
    return (
      <div className={commonStyles.container}>
        <p className={styles.loading}>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <figure className={styles.banner}>
        <img src={`${post.data.banner.url}`} alt="" />
      </figure>

      <div className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.postInfo}>
            <span>
              <FiCalendar size={20} />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>

            <span>
              <FiUser size={20} />
              {post.data.author}
            </span>

            <span>
              <FiClock size={20} />
              {readingTime} min
            </span>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(p => (
              <div key={p.heading}>
                <strong>{p.heading}</strong>

                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(p.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  // TODO
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
    },
  };

  return {
    props: {
      post,
    },
  };
};
