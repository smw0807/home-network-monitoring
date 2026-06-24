import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

export default defineNuxtPlugin(() => {
  Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);
});
