import { definePageConfig } from 'ice';
import Fabritor from '@/fabritor';

export const pageConfig = definePageConfig(() => ({
  title: 'Fabritor App',
}));

export default function () {
  return <Fabritor />;
}
