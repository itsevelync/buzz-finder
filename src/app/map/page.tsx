import type { NextPage } from 'next';
import Head from 'next/head'
import GoogleMap from '@/components/maps/goolemap';
import CenteredMap from '@/components/maps/centeredmap';
import DropPin from '@/components/maps/droppin';

const Home: NextPage = () => {
  return (
    <div className="w-full h-full flex">
      <Head>
        <title>Interactive Google Map</title>
        <meta name="description" content="A Next.js app with an interactive Google Map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <DropPin width = "100vw" height="100vh"/>
        {/* <CenteredMap width="100%" height="100vh" pinId={1}/> */}
        {/* <GoogleMap width="100%" height="100vh"/> */}
      </main>
    </div>
  );
};

export default Home;