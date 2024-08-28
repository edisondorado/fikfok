import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { Context } from './main';

import Video from './pages/Video';

function Home() {
  const { store } = useContext(Context);

  return (
    <div>
      <Video />
    </div>
  );
}

export default observer(Home);
