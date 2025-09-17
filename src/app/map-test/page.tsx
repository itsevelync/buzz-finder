import type { NextPage } from 'next';
import Head from 'next/head'
import GoogleMap from '@/components/maps/goolemap';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Interactive Google Map</title>
        <meta name="description" content="A Next.js app with an interactive Google Map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <GoogleMap width="100%" height="100vh"/>
      </main>
    </div>
  );
};

export default Home;