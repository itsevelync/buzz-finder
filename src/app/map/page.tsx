import type { NextPage } from 'next';
import Head from 'next/head'
import ItemModel from '@/model/Item';
import GoogleMap from '@/components/maps/goolemap';
import type {Item} from '@/model/Item';

const Home = async ({searchParams}:{ searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) => {
  //Check Search Params to see if there is a item we want to focus
  const params = await searchParams;
  const itemId = params.itemId as string|null;

  //Get all items from the database adn convret them to plain Item objects
  const dbItems = await ItemModel.find().lean<Item[]>().exec();
  const items:any[] = dbItems.map(item => ({
    ...item,
    _id: item._id.toString(),
  }));





  return (
    <div className="w-full h-full flex">
      <Head>
        <title>Interactive Google Map</title>
        <meta name="description" content="A Next.js app with an interactive Google Map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        
      </div>

        <GoogleMap width="100vw" height="100vh" defaultMarkerId={itemId} items={items}/>
    </div>
  );
};

export default Home;